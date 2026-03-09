import { Request, Response } from 'express';
import pool from '../db';
import { runDeployment, getDeploymentStats } from '../services/deploymentService';

export const createDeployment = async (req: Request, res: Response): Promise<void> => {
  const { machine_id, template_id, configuration_profile, created_by } = req.body;

  if (!machine_id || !template_id) {
    res.status(400).json({ error: 'machine_id and template_id are required' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO deployments (machine_id, template_id, configuration_profile, created_by, total_steps)
       VALUES ($1, $2, $3, $4, 5) RETURNING *`,
      [machine_id, template_id, configuration_profile || 'standard', created_by || 'operator']
    );
    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const executeDeployment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const check = await pool.query(`SELECT status FROM deployments WHERE id = $1`, [id]);
    if (check.rows.length === 0) { res.status(404).json({ error: 'Deployment not found' }); return; }
    if (check.rows[0].status === 'running') { res.status(400).json({ error: 'Deployment already running' }); return; }

    // Run async in background
    runDeployment(id).catch(console.error);
    res.json({ message: 'Deployment started', deployment_id: id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const getDeployments = async (req: Request, res: Response): Promise<void> => {
  const { status, limit = 50, offset = 0 } = req.query;
  try {
    let query = `
      SELECT d.*, m.name as machine_name, t.name as template_name
      FROM deployments d
      LEFT JOIN machines m ON d.machine_id = m.id
      LEFT JOIN deployment_templates t ON d.template_id = t.id
    `;
    const params: unknown[] = [];
    if (status) {
      params.push(status);
      query += ` WHERE d.status = $${params.length}`;
    }
    query += ` ORDER BY d.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const getDeploymentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT d.*, m.name as machine_name, m.ip_address, t.name as template_name
       FROM deployments d
       LEFT JOIN machines m ON d.machine_id = m.id
       LEFT JOIN deployment_templates t ON d.template_id = t.id
       WHERE d.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(result.rows[0]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getDeploymentStats();
    const recentLogs = await pool.query(
      `SELECT dl.*, d.id as dep_id FROM deployment_logs dl
       JOIN deployments d ON dl.deployment_id = d.id
       ORDER BY dl.created_at DESC LIMIT 10`
    );
    const machineStats = await pool.query(
      `SELECT status, COUNT(*) as count FROM machines GROUP BY status`
    );
    res.json({ deployments: stats, recent_logs: recentLogs.rows, machines: machineStats.rows });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const cancelDeployment = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `UPDATE deployments SET status = 'cancelled', completed_at = NOW()
       WHERE id = $1 AND status IN ('pending', 'running') RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) { res.status(404).json({ error: 'Deployment not found or cannot be cancelled' }); return; }
    res.json(result.rows[0]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};
