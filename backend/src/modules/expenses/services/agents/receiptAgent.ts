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
- MERCHANT NAME: The merchant name MUST be extracted from the VERY TOP HEADER of the receipt. DO NOT use text from the "Itinerário", "Destino", or "Entrega" sections at the bottom. The merchant is usually the company name next to the CNPJ at the top.
- DATE: For blurry or messy dates, look for standard Brazilian patterns (DD/MM/YYYY) usually near the top header or bottom footer timestamps. Guess logically if a digit is slightly distorted. Return strictly as YYYY-MM-DD.
- Translate category to Portuguese (e.g. Alimentos, Combustível, Geral, etc.)
- DOCUMENT: If you find a CNPJ or CPF for the merchant (usually at the very top), extract it. IMPORTANT: You MUST return it strictly formatted with mask (XX.XXX.XXX/XXXX-XX or XXX.XXX.XXX-XX).

Return ONLY JSON:
{
  "amount": number,
  "date": string,
  "merchant": string,
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
