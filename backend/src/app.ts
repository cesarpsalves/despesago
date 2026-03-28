import express from 'express';
import cors from 'cors';
import expenseRoutes from './modules/expenses/routes/expenseRoutes.js';
import companyRoutes from './modules/company/routes/companyRoutes.js';
import billingRoutes from './modules/billing/routes/billingRoutes.js';
import authRoutes from './modules/auth/routes/authRoutes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Routes
app.use('/expenses', expenseRoutes);
app.use('/company', companyRoutes);
app.use('/billing', billingRoutes);
app.use('/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Orchestrator is running' });
});

export default app;
