import { Router } from 'express';
import { superAdminController } from '../controllers/superAdminController.js';
import { isPlatformAdmin } from '../../../shared/middlewares/isPlatformAdmin.js';

const router = Router();

// Todas as rotas daqui pra baixo são apenas para Platform Admins
router.use(isPlatformAdmin);

router.get('/companies', superAdminController.listAllCompanies);
router.get('/users', superAdminController.listAllUsers);

export default router;
