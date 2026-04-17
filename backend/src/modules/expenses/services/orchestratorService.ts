import { receiptAgent } from './agents/receiptAgent.js';
import { insightAgent } from './agents/insightAgent.js';
import { behaviorAgent } from './agents/behaviorAgent.js';
import { createScopedClient } from '../../../shared/db/supabaseClient.js';

export interface ExpenseData {
  amount: number;
  date: string;
  merchant: string;
  category: string;
  document?: string | null;
  confidence: number;
  cost_center_id?: string;
  receipt_url?: string | null;
}

export const extractReceiptData = async (imageBase64: string): Promise<ExpenseData> => {
  if (!imageBase64) {
    throw new Error("missing_image_data");
  }

  const expenseData = await receiptAgent.extract(imageBase64);
  return expenseData;
};

export const processExpense = async (input: { imageBase64: string, cost_center_id?: string }, authHeader: string) => {
  console.log('--- Starting REAL AI Orchestration Flow ---');
  const supabase = createScopedClient(authHeader);

  // 0. Get user context (Required for company_id/user_id)
  const { data: userProfile, error: userError } = await supabase
    .from('users')
    .select('id, company_id')
    .single();

  if (userError || !userProfile) {
    throw new Error("user_not_found");
  }

  // 1. Extraction (REAL Receipt Agent AI)
  const expenseData = await extractReceiptData(input.imageBase64);
  console.log('1. AI Extracted:', expenseData);

  // Link cost center
  if (input.cost_center_id) {
    expenseData.cost_center_id = input.cost_center_id;
  }
  
  // 1.5 Handle Image Storage
  let receipt_url = null;
  try {
    const fileName = `${userProfile.company_id}/${Date.now()}-${userProfile.id}.jpg`;
    const imageBuffer = Buffer.from(input.imageBase64, 'base64');
    
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
    } else {
      console.warn('Image upload failed, continuing without image:', uploadError);
    }
  } catch (err) {
    console.warn('Storage error:', err);
  }

  const finalExpenseData = {
    amount: expenseData.amount,
    merchant: expenseData.merchant,
    category: expenseData.category || 'Outros',
    date: expenseData.date,
    document: expenseData.document || null,
    cost_center_id: expenseData.cost_center_id,
    company_id: userProfile.company_id,
    user_id: userProfile.id,
    receipt_url: receipt_url,
    status: 'pending'
  };

  // 2. Validation
  if (!finalExpenseData.amount || !finalExpenseData.date || !finalExpenseData.merchant) {
    throw new Error("invalid_expense_data");
  }

  // 3. Persistence
  const { data: savedExpense, error: insertError } = await supabase
    .from('expenses')
    .insert([finalExpenseData])
    .select()
    .single();

  if (insertError) {
    console.error('DB Error:', insertError);
    throw new Error("database_insert_failed");
  }

  // 4. Insight (Async optimization)
  try {
    const insight = await insightAgent.generate(savedExpense, []);
    console.log('4. Insight:', insight);
  } catch (e) {
    console.warn('Insight failed, silent fail:', e);
  }

  return {
    message: "Despesa processada com realismo AI",
    expense: savedExpense
  };
};
