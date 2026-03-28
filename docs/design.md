# DespesaGo Design System 🎨

Este documento define os padrões visuais e de interação do **DespesaGo**, garantindo uma experiência de usuário (UX) coesa, profissional e de alta performance.

---

## 🎨 Paleta de Cores (Cores Vivas & Corporativas)

Utilizamos a biblioteca **Tailwind CSS** como base, focando em tons sofisticados que transmitem confiança e modernidade.

- **Primária (Brand/Success):** `Emerald-500` / `Emerald-600`
  - Utilizada para ações positivas, botões principais de sucesso e indicadores de OCR bem-sucedido.
- **Neutros (Background/Texto):** `Slate-900` (Headers/Títulos), `Slate-500` (Textos de suporte), `Slate-50` (Fundo de containers).
  - Garante legibilidade técnica e um ar de "sistema operacional" moderno (Apple-inspired).
- **Ação/Atenção:** `Rose-500` (Erros), `Amber-500` (Pendências de aprovação).

---

## 🔡 Tipografia

- **Fonte Principal:** [Inter](https://rsms.me/inter/)
  - Escolhida por sua alta legibilidade em telas pequenas e estilo neutro mas moderno.
- **Hierarquia:**
  - **H1:** `text-3xl font-extrabold tracking-tight`
  - **H2:** `text-xl font-bold`
  - **Body:** `text-base leading-relaxed`

---

## 🕹️ Componentes Base

### 1. Botões (Buttons)
- **Primary:** Fundo `Slate-900`, texto branco, bordas arredondadas (`rounded-xl`), sombra suave (`shadow-lg`). 
- **Interação:** Efeito de escala suave (`scale-95`) ao clicar via *Framer Motion*.

### 2. Cards & Containers
- Estilo "Glassmorphism" leve: bordas sutis `border-slate-100`, fundo branco sólido, sombras projetadas `shadow-soft`.
- Arredondamento generoso de bordas (`rounded-3xl`) para um visual amigável.

### 3. Estados de Carregamento (Feedback)
- **Skeletons:** Pulsação em tons de Slate para indicar carregamento de dados sem bloquear a visão do usuário.
- **Microinterações:** Spinners discretos e transições de opacidade (`fade-in`) em novos itens na lista de despesas.

---

## 📱 Mobile-First Guidelines

O DespesaGo é projetado prioritariamente para o uso em campo (funcionários escaneando notas no café/almoço).

- **Touch Targets:** Todos os botões interativos possuem no mínimo `44px` de altura/largura.
- **Navegação Inferior (Bottom Tab Bar):** Uso extensivo de uma aba fixa na parte inferior para facilitar o uso com o polegar.
- **Scanner FAB:** O botão de captura deve ser o elemento central e mais destacado da interface mobile.

---

## 🗣️ Tom de Voz (Branding)

- **Profissional, porém direto.**
- **Exemplo Sucesso:** "Recibo processado com sucesso! Já classificamos como 'Alimentação'."
- **Exemplo Erro:** "Houve um problema ao ler a nota. Poderia tentar tirar a foto novamente com mais luz?"

---

*Documento mantido pela equipe de Design & Engineering do DespesaGo.*
