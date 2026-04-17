import { receiptAgent } from './agents/receiptAgent.js';
import { insightAgent } from './agents/insightAgent.js';
import { behaviorAgent } from './agents/behaviorAgent.js';
import { createScopedClient } from '../../../shared/db/supabaseClient.js';

export interface ExpenseData {
  amount: number;
  date: string;
  merchant: string;
  category: string;
  confidence: number;
  cost_center_id?: string;
}

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
  if (!input.imageBase64) {
    throw new Error("missing_image_data");
  }

  const expenseData = await receiptAgent.extract(input.imageBase64);
  console.log('1. AI Extracted:', expenseData);

  // Link cost center and user/company info
  if (input.cost_center_id) {
    expenseData.cost_center_id = input.cost_center_id;
  }
  
  const finalExpenseData = {
    ...expenseData,
    company_id: userProfile.company_id,
    user_id: userProfile.id
  };

  // 2. Validation (Standardized + Defensive)
  if (!expenseData.amount || !expenseData.date || !expenseData.merchant) {
    throw new Error("invalid_expense_data");
  }

  // Defend against OCR hallucinations inflating the database or crashing charts
  if (expenseData.amount < 1 || expenseData.amount > 10000) {
    throw new Error("invalid_amount_detected");
  }

  // 3. Persistence (In the explicitly configured app_expense schema)
  const { data: savedExpense, error: insertError } = await supabase
    .from('expenses')
    .insert([finalExpenseData])
    .select()
    .single();

  if (insertError) {
    console.error('DB Error:', insertError);
    throw new Error("database_insert_failed");
  }
  console.log('2. Persisted:', savedExpense.id);

  // 4. Fetch History for Analysis (Last 20)
  const { data: rawHistory } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
    .limit(20);

  // CRITICAL: Filter out the current expense from history to avoid self-detection
  const cleanHistory = (rawHistory || []).filter((e: any) => e.id !== savedExpense.id);

  // Early Return if history is too small for meaningful AI/Heuristic analysis
  if (cleanHistory.length < 3) {
    return {
      success: true,
      expense: savedExpense,
      analysis: {
        insight: null,
        behavior: null
      }
    };
  }

  // 5. Insight Generation (REAL AI)
  const insight = await insightAgent.generate(savedExpense, cleanHistory);
  console.log('3. Insight Generated');

  // 6. Behavior Analysis (Hybrid Rules)
  const alert = await behaviorAgent.analyze(savedExpense, cleanHistory);
  console.log('4. Behavior Analyzed');

  return {
    success: true,
    expense: savedExpense,
    analysis: {
      insight,
      behavior: alert
    }
  };
};
