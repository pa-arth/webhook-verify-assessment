import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

// TODO: add rate limiting per key

/**
 * Middleware that verifies the API key from the X-API-Key header.
 * Used for read endpoints (events list, etc.) — NOT for webhook ingestion.
 */
export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    res.status(401).json({ error: 'Missing API key' });
    return;
  }

  if (apiKey !== config.apiKey) {
    res.status(403).json({ error: 'Invalid API key' });
    return;
  }

  next();
}
