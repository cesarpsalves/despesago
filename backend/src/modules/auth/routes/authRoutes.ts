import { Router } from 'express';
import { authController } from '../controllers/authController.js';

const router = Router();

// Endpoint profissional para solicitação de redefinição de senha
router.post('/reset-password/request', authController.requestPasswordReset);

export default router;
