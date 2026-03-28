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

// Identificação da Empresa vinculada
router.get('/me', authMiddleware, companyController.getMe);

export default router;
