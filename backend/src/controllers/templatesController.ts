import { Request, Response } from 'express';
import pool from '../db';

export const getTemplates = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`SELECT * FROM deployment_templates ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const getTemplateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`SELECT * FROM deployment_templates WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(result.rows[0]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const createTemplate = async (req: Request, res: Response): Promise<void> => {
  const { name, description, software_list, security_config, scripts, created_by } = req.body;
  if (!name) { res.status(400).json({ error: 'Template name is required' }); return; }
  try {
    const result = await pool.query(
      `INSERT INTO deployment_templates (name, description, software_list, security_config, scripts, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        name, description || '',
        JSON.stringify(software_list || []),
        JSON.stringify(security_config || {}),
        JSON.stringify(scripts || []),
        created_by || 'admin'
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const updateTemplate = async (req: Request, res: Response): Promise<void> => {
  const { name, description, software_list, security_config, scripts } = req.body;
  try {
    const result = await pool.query(
      `UPDATE deployment_templates
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           software_list = COALESCE($3, software_list),
           security_config = COALESCE($4, security_config),
           scripts = COALESCE($5, scripts),
           updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [name, description, JSON.stringify(software_list), JSON.stringify(security_config), JSON.stringify(scripts), req.params.id]
    );
    if (result.rows.length === 0) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(result.rows[0]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};

export const deleteTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    await pool.query(`DELETE FROM deployment_templates WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Template deleted' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
};
