import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const clients = new Map<string, RateLimitEntry>();

/**
 * Simple in-memory rate limiter based on IP address.
 * Allows config.maxRequestsPerMinute requests per 60-second window.
 */
export function rateLimit(req: Request, res: Response, next: NextFunction): void {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60_000;

  let entry = clients.get(clientIp);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    clients.set(clientIp, entry);
  }

  entry.count++;

  if (entry.count > config.maxRequestsPerMinute) {
    res.status(429).json({ error: 'Too many requests' });
    return;
  }

  res.setHeader('X-RateLimit-Remaining', config.maxRequestsPerMinute - entry.count);
  next();
}
