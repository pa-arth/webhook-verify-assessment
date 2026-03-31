import express from 'express';
import type { Express } from 'express';

/**
 * Configure JSON body parsing for the application.
 * Sets up standard Express JSON parsing with a size limit.
 */
export function configureBodyParser(app: Express): void {
  app.use(express.json({ limit: '1mb' }));
}
