/**
 * Insight Agent (REAL AI)
 * Logic to generate short human-readable financial insights
 */
export const insightAgent = {
  generate: async (currentExpense: any, history: any[]): Promise<string | null> => {
    if (!history || history.length === 0) return null;

    try {
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2, // Low temperature for consistent, analytical responses
        messages: [
          {
            role: "system",
            content: `
Você é um consultor financeiro pessoal ultra-inteligente.

Sua tarefa é gerar UM ÚNICO insight curto e impactante (máximo 15 palavras) sobre a nova despesa do usuário em comparação com o histórico dele.

Regras:
- Use um tom profissional mas encorajador.
- Foque em tendências (ex: "Seu gasto com café subiu 20% este mês").
- Se não houver dados suficientes, seja neutro.
- Responda SEMPRE em Português do Brasil.
            `
          },
          {
            role: "user",
            content: JSON.stringify({
              currentExpense,
              history
            })
          }
        ]
      });

      const text = response.choices[0]?.message?.content?.trim();

      if (!text || text.length === 0) return null;

      return text;
    } catch (error: any) {
      console.error('Insight Generation AI Failed:', error.message);
      // Fails gracefully returning null so the orchestrator flow is not broken
      return null;
    }
  }
};
