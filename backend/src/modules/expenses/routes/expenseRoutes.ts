import { Router } from 'express';
import { z } from 'zod';
import { expenseController } from '../controllers/expenseController.js';
import { authMiddleware } from '../../../shared/middlewares/authMiddleware.js';
import { planLimitsMiddleware } from '../../../shared/middlewares/planLimitsMiddleware.js';
import { validateRequest } from '../../../shared/middlewares/validateRequest.js';

const router = Router();

const processExpenseSchema = z.object({
  imageBase64: z.string().min(10, "Base64 string is required")
});


router.post('/process', authMiddleware, planLimitsMiddleware, validateRequest(processExpenseSchema), expenseController.process);
router.get('/', authMiddleware, expenseController.list);

export default router;
