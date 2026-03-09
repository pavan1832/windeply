import { Request, Response } from 'express';
import pool from '../db';

export const getMachines = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT m.*,
        (SELECT COUNT(*) FROM deployments d WHERE d.machine_id = m.id) as total_deployments,
        (SELECT COUNT(*) FROM deployments d WHERE d.machine_id = m.id AND d.status = 'success') as successful_deployments
      FROM machines m ORDER BY m.created_at DESC
    `);
    res.json(result.rows);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const getMachineById = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`SELECT * FROM machines WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(result.rows[0]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const createMachine = async (req: Request, res: Response): Promise<void> => {
  const { name, ip_address, os_version, department, assigned_to } = req.body;
  if (!name) { res.status(400).json({ error: 'Machine name is required' }); return; }
  try {
    const result = await pool.query(
      `INSERT INTO machines (name, ip_address, os_version, department, assigned_to)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, ip_address || null, os_version || null, department || null, assigned_to || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const updateMachine = async (req: Request, res: Response): Promise<void> => {
  const { name, ip_address, os_version, status, department, assigned_to } = req.body;
  try {
    const result = await pool.query(
      `UPDATE machines SET
         name = COALESCE($1, name),
         ip_address = COALESCE($2, ip_address),
         os_version = COALESCE($3, os_version),
         status = COALESCE($4, status),
         department = COALESCE($5, department),
         assigned_to = COALESCE($6, assigned_to),
         last_seen = NOW()
       WHERE id = $7 RETURNING *`,
      [name, ip_address, os_version, status, department, assigned_to, req.params.id]
    );
    if (result.rows.length === 0) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(result.rows[0]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const deleteMachine = async (req: Request, res: Response): Promise<void> => {
  try {
    await pool.query(`DELETE FROM machines WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Machine deleted' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};
