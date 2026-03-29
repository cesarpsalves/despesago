import { Router } from 'express';
import { companyController } from '../controllers/companyController.js';
import { authMiddleware } from '../../../shared/middlewares/authMiddleware.js';
import { planLimitsMiddleware } from '../../../shared/middlewares/planLimitsMiddleware.js';

const router = Router();

// Onboarding: O usuário já deve estar logado no Auth, mas ainda sem a entidade Empresa/Usuário
router.post('/onboarding', authMiddleware, companyController.onboarding);

// Invite: Admin convidando seus funcionários
router.post('/invite', authMiddleware, planLimitsMiddleware, companyController.inviteEmployee);

// Centros de custo
router.get('/cost-centers', authMiddleware, companyController.listCostCenters);
router.post('/cost-centers', authMiddleware, companyController.createCostCenter);
router.put('/cost-centers/:id', authMiddleware, companyController.updateCostCenter);
router.delete('/cost-centers/:id', authMiddleware, companyController.deleteCostCenter);

// Gestão de Membros
router.patch('/members/:memberId/cost-center', authMiddleware, companyController.assignMemberToCostCenter);

// Identificação da Empresa vinculada
router.get('/me', authMiddleware, companyController.getMe);

// Dashboard consolidado (Novo: Premium Performance)
router.get('/dashboard/summary', authMiddleware, companyController.dashboardSummary);

export default router;
