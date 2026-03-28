import { Router } from 'express';
import { authController } from '../controllers/authController.js';

const router = Router();

// Endpoint profissional para solicitação de redefinición de senha
router.post('/reset-password/request', authController.requestPasswordReset);

// Endpoint profissional para login via Magic Link
router.post('/magic-link', authController.signInWithMagicLink);

export default router;
