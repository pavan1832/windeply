import pool from '../db';
import { DEPLOYMENT_STEPS, DeploymentStatus } from '../types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const addLog = async (
  deploymentId: string,
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  stepName?: string,
  scriptName?: string,
  output?: string
) => {
  await pool.query(
    `INSERT INTO deployment_logs (deployment_id, level, message, step_name, script_name, output)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [deploymentId, level, message, stepName || null, scriptName || null, output || null]
  );
};

const simulateScriptExecution = (scriptName: string, machineName: string): string => {
  const outputs: Record<string, string> = {
    'system_health_check.ps1': `[INFO] Running system health check on ${machineName}...\n[CHECK] CPU Load: 12%\n[CHECK] Available Memory: 14.2 GB\n[CHECK] Disk Space: 234 GB free\n[CHECK] Network connectivity: OK\n[OK] System health check complete - Machine is deployment-ready`,
    'install_packages.ps1': `[INFO] Starting package installation on ${machineName}...\n[INSTALL] Downloading package manifests...\n[INSTALL] Resolving dependencies...\n[INSTALL] Installing Visual Studio Code v1.85.0...\n[INSTALL] Installing Git v2.43.0...\n[INSTALL] Installing Node.js v20.10.0...\n[OK] All packages installed successfully\n[INFO] Package installation complete - 7 packages installed, 0 errors`,
    'configure_security.ps1': `[INFO] Applying security configuration on ${machineName}...\n[SEC] Enabling Windows Defender Firewall...\n[SEC] Configuring inbound rules: 3 rules applied\n[SEC] Configuring outbound rules: 2 rules applied\n[SEC] Enabling BitLocker Drive Encryption...\n[SEC] Applying Group Policy settings...\n[SEC] Disabling unnecessary services: 4 services disabled\n[OK] Security baseline applied - CIS Level 1 compliant`,
    'generate_report.ps1': `[INFO] Generating deployment report for ${machineName}...\n[REPORT] Deployment ID: captured\n[REPORT] Total steps completed: 5/5\n[REPORT] Packages installed: success\n[REPORT] Security policies applied: success\n[REPORT] System health: nominal\n[REPORT] Report saved to: C:\\DeployLogs\\report.json\n[OK] Deployment finalized successfully`,
  };
  return outputs[scriptName] || `[INFO] Executing ${scriptName}...\n[OK] Script completed successfully`;
};

export const runDeployment = async (deploymentId: string): Promise<void> => {
  const client = await pool.connect();
  try {
    // Get deployment details
    const deployResult = await client.query(
      `SELECT d.*, m.name as machine_name, t.name as template_name, t.software_list
       FROM deployments d
       JOIN machines m ON d.machine_id = m.id
       JOIN deployment_templates t ON d.template_id = t.id
       WHERE d.id = $1`,
      [deploymentId]
    );

    if (deployResult.rows.length === 0) throw new Error('Deployment not found');
    const deployment = deployResult.rows[0];

    // Mark as running
    await client.query(
      `UPDATE deployments SET status = 'running', started_at = NOW() WHERE id = $1`,
      [deploymentId]
    );
    await client.query(
      `UPDATE machines SET status = 'deploying' WHERE id = $1`,
      [deployment.machine_id]
    );

    await addLog(deploymentId, 'info', `🚀 Deployment started for machine: ${deployment.machine_name}`, 'Initialization');
    await addLog(deploymentId, 'info', `📋 Using template: ${deployment.template_name}`, 'Initialization');
    await addLog(deploymentId, 'info', `⚙️  Configuration profile: ${deployment.configuration_profile}`, 'Initialization');

    // Execute each step
    for (const step of DEPLOYMENT_STEPS) {
      await client.query(
        `UPDATE deployments SET current_step = $1 WHERE id = $2`,
        [step.step, deploymentId]
      );

      await addLog(
        deploymentId, 'info',
        `▶ Starting Step ${step.step}/${DEPLOYMENT_STEPS.length}: ${step.name}`,
        step.name
      );

      await sleep(step.duration_ms);

      if (step.script) {
        const scriptOutput = simulateScriptExecution(step.script, deployment.machine_name);
        await addLog(
          deploymentId, 'info',
          `🔧 Executing script: ${step.script}`,
          step.name, step.script, scriptOutput
        );
        await sleep(800);
      }

      // Simulate occasional warnings
      if (step.step === 3) {
        await addLog(deploymentId, 'warn', `⚠ Package manager returned non-critical warning: dependency version mismatch resolved`, step.name);
      }

      await addLog(
        deploymentId, 'info',
        `✅ Step ${step.step} complete: ${step.name}`,
        step.name
      );
    }

    // Success
    await client.query(
      `UPDATE deployments SET status = 'success', completed_at = NOW(), current_step = $1 WHERE id = $2`,
      [DEPLOYMENT_STEPS.length, deploymentId]
    );
    await client.query(
      `UPDATE machines SET status = 'online', os_version = 'Windows 11 Pro 23H2', last_seen = NOW() WHERE id = $1`,
      [deployment.machine_id]
    );
    await addLog(deploymentId, 'info', `🎉 Deployment completed successfully for ${deployment.machine_name}`, 'Finalization');

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    await client.query(
      `UPDATE deployments SET status = 'failed', completed_at = NOW(), error_message = $1 WHERE id = $2`,
      [errorMessage, deploymentId]
    );
    await addLog(deploymentId, 'error', `❌ Deployment failed: ${errorMessage}`, 'Error');
  } finally {
    client.release();
  }
};

export const getDeploymentStats = async () => {
  const result = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'success') as successful,
      COUNT(*) FILTER (WHERE status = 'failed') as failed,
      COUNT(*) FILTER (WHERE status = 'running') as active,
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) as total
    FROM deployments
  `);
  return result.rows[0];
};
