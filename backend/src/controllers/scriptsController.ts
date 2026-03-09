import { Request, Response } from 'express';
import pool from '../db';

export const getScripts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`SELECT * FROM automation_scripts ORDER BY category, name`);
    res.json(result.rows);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const getScriptById = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`SELECT * FROM automation_scripts WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(result.rows[0]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};
