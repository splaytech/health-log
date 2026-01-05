import { Request, Response, NextFunction } from 'express';

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY || 'change-me-in-production';

  console.log(`[AUTH] ${req.method} ${req.path} - API Key: ${apiKey ? '***' + String(apiKey).slice(-4) : 'missing'}`);

  if (!apiKey || apiKey !== expectedKey) {
    console.log(`[AUTH] Unauthorized - Expected: ***${expectedKey.slice(-4)}`);
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }

  next();
};
