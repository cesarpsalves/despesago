import type { Request, Response } from 'express';
import { processExpense } from '../services/orchestratorService.js';

export const expenseController = {
  process: async (req: Request, res: Response) => {
    try {
      console.log('--- Incoming Request: POST /expenses/process ---');
      const authHeader = req.headers.authorization || '';
      const result = await processExpense(req.body, authHeader);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Orchestration Failed:', error.message);
      
      const statusCode = (error.message === 'database_insert_failed') ? 500 : 400;
      
      return res.status(statusCode).json({ 
        success: false, 
        error: error.message 
      });
    }
  },
  list: async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization || '';
      const supabase = (await import('../../../shared/db/supabaseClient.js')).createScopedClient(authHeader);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return res.status(200).json(data);
    } catch (error: any) {
      console.error('List Failed:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }
};
