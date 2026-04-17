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

const createExpenseSchema = z.object({
  amount: z.number().positive(),
  merchant: z.string().min(2),
  date: z.string(),
  document: z.string().optional().nullable(),
  cost_center_id: z.string().uuid().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  imageBase64: z.string().optional().nullable()
});


router.post('/process', authMiddleware, planLimitsMiddleware, validateRequest(processExpenseSchema), expenseController.process);
router.post('/extract', authMiddleware, planLimitsMiddleware, validateRequest(processExpenseSchema), expenseController.extract);
router.post('/', authMiddleware, validateRequest(createExpenseSchema), expenseController.create);
router.get('/', authMiddleware, expenseController.list);

export default router;
