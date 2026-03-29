import express from 'express';
import cors from 'cors';
import expenseRoutes from './modules/expenses/routes/expenseRoutes.js';
import companyRoutes from './modules/company/routes/companyRoutes.js';
import billingRoutes from './modules/billing/routes/billingRoutes.js';
import authRoutes from './modules/auth/routes/authRoutes.js';
import platformRoutes from './modules/platform/routes/superAdminRoutes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/platform', platformRoutes);


// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Orchestrator is running' });
});

export default app;
