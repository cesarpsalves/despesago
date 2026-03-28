import type { Request, Response, NextFunction } from 'express';

// Middleware para extrair o JWT e jogar no context (req)
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  // Apenas passa para frente. Quem valida a assinatura é o Postgres local + Supabase Auth via RLS.
  // req.headers.authorization já conterá o "Bearer ..." intacto para passarmos para o createScopedClient
  next();
};
