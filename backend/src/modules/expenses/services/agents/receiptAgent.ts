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
You are an expert receipt OCR system.

Extract structured data from the receipt image.

Rules:
- Prioritize accuracy over guessing
- If multiple values appear, choose the most likely total amount
- Prefer "TOTAL" or "AMOUNT" fields
- Ignore irrelevant text
- Normalize date format (YYYY-MM-DD)
- Merchant must be clean and readable
- Translate category to Portuguese (e.g. Alimentos, Combustível, Geral, etc.)

Return ONLY JSON:
{
  "amount": number,
  "date": string,
  "merchant": string,
  "category": string,
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
        confidence: confidence
      };
    } catch (error: any) {
      console.error('Receipt Extraction AI Failed:', error.message);
      throw new Error("extraction_failed");
    }
  }
};
