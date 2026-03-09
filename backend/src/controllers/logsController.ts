import { Request, Response } from 'express';
import pool from '../db';

export const getDeploymentLogs = async (req: Request, res: Response): Promise<void> => {
  const { deployment_id, level, search, limit = 100, offset = 0 } = req.query;
  try {
    const params: unknown[] = [];
    let query = `SELECT * FROM deployment_logs WHERE 1=1`;

    if (deployment_id) { params.push(deployment_id); query += ` AND deployment_id = $${params.length}`; }
    if (level) { params.push(level); query += ` AND level = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND message ILIKE $${params.length}`; }

    query += ` ORDER BY created_at ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const getAllLogs = async (req: Request, res: Response): Promise<void> => {
  const { level, search, limit = 200, offset = 0 } = req.query;
  try {
    const params: unknown[] = [];
    let query = `
      SELECT dl.*, d.status as deployment_status, m.name as machine_name
      FROM deployment_logs dl
      JOIN deployments d ON dl.deployment_id = d.id
      LEFT JOIN machines m ON d.machine_id = m.id
      WHERE 1=1
    `;
    if (level) { params.push(level); query += ` AND dl.level = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND dl.message ILIKE $${params.length}`; }

    query += ` ORDER BY dl.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};
