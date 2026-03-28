import config from './config/env.js';
import app from './app.js';
import { OpenAI } from "openai";

const PORT = config.port;

const openai = new OpenAI({
  apiKey: config.openai.apiKey
});

app.listen(PORT, () => {
  console.log(`🚀 Orchestrator backend running at http://localhost:${PORT}`);
  if (!config.isProduction) {
    console.log(`🔗 Usando .env da raiz do projeto`);
  }
});
