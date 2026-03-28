import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

// Endpoint profissional para solicitação de redefinición de senha
router.post('/reset-password/request', authController.requestPasswordReset);

// Endpoint profissional para login via Magic Link
router.post('/magic-link', authController.signInWithMagicLink);

// Endpoint para retornar o perfil completo do usuário logado
router.get('/me', authMiddleware, authController.getMe);

export default router;
