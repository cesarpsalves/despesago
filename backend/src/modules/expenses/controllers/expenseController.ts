import type { Request, Response } from 'express';
import { processExpense, extractReceiptData } from '../services/orchestratorService.js';

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
  extract: async (req: Request, res: Response) => {
    try {
      const { imageBase64 } = req.body;
      const data = await extractReceiptData(imageBase64);
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error('Extraction Failed:', error.message);
      return res.status(400).json({ success: false, error: error.message });
    }
  },
  create: async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization || '';
      const supabase = (await import('../../../shared/db/supabaseClient.js')).createScopedClient(authHeader);
      
      // Get user context to find the company_id automatically
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('company_id, id')
        .single();
      
      if (userError || !userProfile) throw new Error('Usuário não identificado.');
      
      const { imageBase64, ...bodyData } = req.body;
      let receipt_url = null;

      if (imageBase64) {
        try {
          const fileName = `${userProfile.company_id}/${Date.now()}-${userProfile.id}.jpg`;
          const imageBuffer = Buffer.from(imageBase64, 'base64');
          
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('receipts')
            .upload(fileName, imageBuffer, {
              contentType: 'image/jpeg',
              upsert: true
            });

          if (!uploadError && uploadData) {
            const { data: { publicUrl } } = supabase
              .storage
              .from('receipts')
              .getPublicUrl(fileName);
            receipt_url = publicUrl;
          }
        } catch (err) {
          console.warn('Manual storage error:', err);
        }
      }

      const expenseData = {
        ...bodyData,
        company_id: userProfile.company_id,
        user_id: userProfile.id,
        receipt_url: receipt_url
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select()
        .single();
      
      if (error) throw error;

      return res.status(201).json({
        success: true,
        expense: data
      });
    } catch (error: any) {
      console.error('Manual Creation Failed:', error.message);
      return res.status(400).json({ error: error.message });
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
