import { Router } from 'express';
import { billingController } from '../controllers/billingController.js';
import { authMiddleware } from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

// Endpoint para gerar a primeira assinatura/fatura
router.post('/subscribe', authMiddleware, billingController.subscribe);

// Endpoint público para escutar notificações do servidor do Asaas
router.post('/webhook', billingController.webhook);

export default router;
