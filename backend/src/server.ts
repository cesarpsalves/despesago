import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Orchestrator backend running at http://localhost:${PORT}`);
});
