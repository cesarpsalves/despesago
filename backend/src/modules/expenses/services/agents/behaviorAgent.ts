/**
 * Behavior Agent (Hybrid / Rule-Based) - Final Production Version
 * Detects unusual spending behavior, duplicates, and new categories using fast heuristics.
 */
export const behaviorAgent = {
  analyze: async (current: any, history: any[]): Promise<string | null> => {
    // We need some history to make comparisons
    if (!history || history.length < 5) return null;

    const alerts: string[] = [];
    const currentAmount = Number(current.amount);

    // 1. DUPLICIDADE (High Priority)
    const duplicate = history.find((e) => {
      const sameMerchant = e.merchant === current.merchant;
      const sameAmount = Number(e.amount) === currentAmount;

      const timeDiff =
        Math.abs(new Date(e.date).getTime() - new Date(current.date).getTime());

      const within24h = timeDiff < 1000 * 60 * 60 * 24;

      return sameMerchant && sameAmount && within24h;
    });

    if (duplicate) {
      alerts.push("Possível despesa duplicada detectada.");
    }

    // 2. VALOR ABSURDO (High Priority Proteção Extra)
    if (currentAmount > 1000) {
      alerts.push("Despesa incomumente alta detectada.");
    }

    // 3. MÉDIA DA CATEGORIA (Aumento Repentino - Medium Priority)
    const sameCategory = history.filter(
      (e) => e.category === current.category
    );

    if (sameCategory.length > 0) {
      const avg =
        sameCategory.reduce((acc, e) => acc + Number(e.amount), 0) /
        sameCategory.length;

      if (currentAmount > avg * 1.8) {
        alerts.push("Gasto muito acima da média para esta categoria.");
      }
    }

    // 4. CATEGORIA INCOMUM (Low Priority)
    const categoryUsage = sameCategory.length;
    if (categoryUsage <= 1) {
      alerts.push("Esta categoria é incomum para o seu perfil de gastos.");
    }

    // Return the highest priority alert (first one defined)
    return alerts.length > 0 ? alerts[0]! : null;
  }
};
