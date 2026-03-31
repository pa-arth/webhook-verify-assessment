import { Router } from 'express';
import type { Request, Response } from 'express';
import { computeHmacSignature, verifySignature } from '../lib/crypto.js';
import { eventStore } from '../lib/store.js';
import { config } from '../config.js';
import type { WebhookEvent } from '../types.js';

const router = Router();

/**
 * POST /webhooks — Receive and verify webhook events.
 *
 * The sender computes: HMAC-SHA256(raw request body bytes, secret)
 * and sends it in the X-Webhook-Signature header.
 *
 * We verify by recomputing the signature and comparing.
 */
router.post('/webhooks', (req: Request, res: Response) => {
  const signature = req.headers['x-webhook-signature'] as string | undefined;
  const webhookId = req.headers['x-webhook-id'] as string | undefined;
  const timestamp = req.headers['x-webhook-timestamp'] as string | undefined;

  if (!signature) {
    res.status(401).json({ error: 'Missing webhook signature' });
    return;
  }

  if (!webhookId || !timestamp) {
    res.status(400).json({ error: 'Missing required webhook headers' });
    return;
  }

  // Verify the HMAC signature
  const body = JSON.stringify(req.body);
  const expectedSignature = computeHmacSignature(body, config.webhookSecret);

  if (!verifySignature(expectedSignature, signature)) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  // Parse and store the event
  const event: WebhookEvent = {
    id: webhookId,
    type: req.body.type || 'unknown',
    payload: req.body.payload || req.body,
    timestamp: timestamp,
  };

  const stored = eventStore.add(event);

  res.status(200).json({
    received: true,
    eventId: stored.id,
  });
});

export { router as webhooksRouter };
