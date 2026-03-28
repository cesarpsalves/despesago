import { Router } from 'express';
import { superAdminController } from '../controllers/superAdminController.js';
import { isPlatformAdmin } from '../../../shared/middlewares/isPlatformAdmin.js';
import { authMiddleware } from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas daqui pra baixo são apenas para Platform Admins
router.use(isPlatformAdmin);

router.get('/companies', authMiddleware, superAdminController.listAllCompanies);
router.get('/users', authMiddleware, superAdminController.listAllUsers);

// Ações Administrativas de Assinatura
router.post('/companies/:companyId/grant-pro', authMiddleware, superAdminController.grantProCourtesy);

export default router;
