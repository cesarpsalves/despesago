import sharp from "sharp";
import { OpenAI } from "openai";
import config from "../../../../config/env.js";
import type { ExpenseData } from '../orchestratorService.js';

/**
 * Pre-processes the image to drastically improve OCR accuracy for OpenAI Vision.
 * Translates low-quality, bad-lit photos into clean inputs.
 */
async function preprocessImage(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, "base64");

  const processed = await sharp(buffer)
    .grayscale()             // remove color noise, boosts text contrast
    .normalize()             // stretches contrast to limits
    .sharpen()               // improves edges for blurry notes
    .resize({ width: 1000 }) // standardizes size for consistent AI token estimation
    .toBuffer();

  return processed.toString("base64");
}

/**
 * Receipt Reader Agent (REAL AI - PRO OCR)
 * Extracts structured data from base64 images using pre-processed vision inputs
 */
export const receiptAgent = {
  extract: async (rawImageBase64: string): Promise<ExpenseData> => {
    try {
      const openai = new OpenAI({
        apiKey: config.openai.apiKey
      });

      // 1. Clean the image before it touches AI
      const cleanImage = await preprocessImage(rawImageBase64);

      // 2. Strong OCR-focused Prompt
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `
You are an AI specialized in extracting structured data from Brazilian receipts, invoices (NFC-e), and payment proofs.

Rules:

1. MERCHANT:
- Extract the BUSINESS NAME (razao social or nome fantasia).
- Prefer the name CLOSEST to the CNPJ.
- Ignore labels like: "Cliente:", "Consumidor:", "Vendedor:", "Entregar para:".
- If only a personal name is found, return null.

2. DOCUMENT (CNPJ/CPF):
- Extract the CNPJ or CPF of the merchant.
- Accept both formatted and unformatted numbers.
- Normalize to:
  - CNPJ: XX.XXX.XXX/XXXX-XX
  - CPF: XXX.XXX.XXX-XX
- If multiple exist, choose the one closest to the merchant name.

3. DATE:
- Extract the ISSUE DATE of the document.
- Prioritize labels like:
  - "Data de emissão"
  - "Emissão"
- If not found, use the most prominent date near totals.
- Convert to YYYY-MM-DD.

4. AMOUNT:
- Extract the FINAL TOTAL amount.
- Prioritize labels:
  - "TOTAL"
  - "VALOR TOTAL"
  - "VALOR A PAGAR"
- Ignore:
  - subtotal
  - discount
  - change (troco)
- Return as a number (e.g., 19.95).

5. CATEGORY:
Map based on merchant or items:
- "Alimentos": supermercados, restaurantes, padarias
- "Transporte": combustível, Uber, ônibus
- "Saúde": farmácia, hospital
- "Serviços": serviços diversos
- "Outros": fallback

6. OCR TOLERANCE:
- Fix common OCR errors:
  - O → 0
  - I → 1
- Ignore broken lines.

7. CONFIDENCE:
- Return a value between 0 and 1 based on extraction certainty.

Return ONLY JSON:

{
  "amount": number,
  "date": string,
  "merchant": string | null,
  "category": string,
  "document": string | null,
  "confidence": number
}
            `
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract data from this clean receipt image."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${cleanImage}`
                }
              }
            ]
          }
        ]
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("empty_ai_response");

      const parsed = JSON.parse(content);
      let confidence = Number(parsed.confidence || 0.8);
      if (confidence > 1) confidence = confidence / 100;

      return {
        amount: Number(parsed.amount),
        date: String(parsed.date),
        merchant: String(parsed.merchant),
        category: String(parsed.category || 'Other'),
        document: parsed.document || null,
        confidence: confidence
      };
    } catch (error: any) {
      console.error('Receipt Extraction AI Failed:', error.message);
      throw new Error("extraction_failed");
    }
  }
};
