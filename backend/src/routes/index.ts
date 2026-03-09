import { Router } from 'express';
import * as deploymentsCtrl from '../controllers/deploymentsController';
import * as logsCtrl from '../controllers/logsController';
import * as templatesCtrl from '../controllers/templatesController';
import * as machinesCtrl from '../controllers/machinesController';
import * as scriptsCtrl from '../controllers/scriptsController';

const router = Router();

// Dashboard
router.get('/dashboard/stats', deploymentsCtrl.getDashboardStats);

// Deployments
router.get('/deployments', deploymentsCtrl.getDeployments);
router.post('/deployments', deploymentsCtrl.createDeployment);
router.get('/deployments/:id', deploymentsCtrl.getDeploymentById);
router.post('/deployments/:id/execute', deploymentsCtrl.executeDeployment);
router.post('/deployments/:id/cancel', deploymentsCtrl.cancelDeployment);

// Logs
router.get('/logs', logsCtrl.getAllLogs);
router.get('/deployments/:deployment_id/logs', logsCtrl.getDeploymentLogs);

// Templates
router.get('/templates', templatesCtrl.getTemplates);
router.post('/templates', templatesCtrl.createTemplate);
router.get('/templates/:id', templatesCtrl.getTemplateById);
router.put('/templates/:id', templatesCtrl.updateTemplate);
router.delete('/templates/:id', templatesCtrl.deleteTemplate);

// Machines
router.get('/machines', machinesCtrl.getMachines);
router.post('/machines', machinesCtrl.createMachine);
router.get('/machines/:id', machinesCtrl.getMachineById);
router.put('/machines/:id', machinesCtrl.updateMachine);
router.delete('/machines/:id', machinesCtrl.deleteMachine);

// Scripts
router.get('/scripts', scriptsCtrl.getScripts);
router.get('/scripts/:id', scriptsCtrl.getScriptById);

export default router;
