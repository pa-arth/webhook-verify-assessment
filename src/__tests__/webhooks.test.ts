import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createHmac } from 'node:crypto';
import { app } from '../index.js';
import { eventStore } from '../lib/store.js';

const WEBHOOK_SECRET = 'whsec_test_secret_key_for_development';

/**
 * Compute the HMAC signature the same way the webhook sender does:
 * sign the raw request body bytes, not a re-serialized object.
 */
function signPayload(rawBody: string, secret: string): string {
  return createHmac('sha256', secret).update(rawBody).digest('hex');
}

describe('Webhook signature verification', () => {
  beforeEach(() => {
    eventStore.clear();
  });

  it('returns 401 when signature header is missing', async () => {
    const res = await request(app)
      .post('/webhooks')
      .set('x-webhook-id', 'evt_001')
      .set('x-webhook-timestamp', new Date().toISOString())
      .send({ type: 'payment.completed', payload: { amount: 100 } });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Missing webhook signature');
  });

  it('returns 401 when signature is invalid', async () => {
    const res = await request(app)
      .post('/webhooks')
      .set('x-webhook-id', 'evt_002')
      .set('x-webhook-timestamp', new Date().toISOString())
      .set('x-webhook-signature', 'deadbeef'.repeat(8))
      .send({ type: 'payment.completed', payload: { amount: 100 } });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid signature');
  });

  it('accepts webhook with valid signature', async () => {
    // The sender signs the raw JSON bytes exactly as transmitted
    const body = '{"type": "payment.completed", "payload": {"amount": 4999, "currency": "usd"}}';
    const signature = signPayload(body, WEBHOOK_SECRET);

    const res = await request(app)
      .post('/webhooks')
      .set('Content-Type', 'application/json')
      .set('x-webhook-id', 'evt_003')
      .set('x-webhook-timestamp', new Date().toISOString())
      .set('x-webhook-signature', signature)
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
  });

  it('stores the event after valid signature verification', async () => {
    const body = '{"type": "invoice.paid", "payload": {"invoiceId": "inv_123", "total": 2500}}';
    const signature = signPayload(body, WEBHOOK_SECRET);

    const res = await request(app)
      .post('/webhooks')
      .set('Content-Type', 'application/json')
      .set('x-webhook-id', 'evt_004')
      .set('x-webhook-timestamp', new Date().toISOString())
      .set('x-webhook-signature', signature)
      .send(body);

    expect(res.status).toBe(200);
    expect(eventStore.count()).toBe(1);
    const stored = eventStore.getById('evt_004');
    expect(stored).toBeDefined();
    expect(stored!.type).toBe('invoice.paid');
  });

  it('returns 401 when signed with wrong secret', async () => {
    const body = '{"type":"test","payload":{}}';
    const wrongSignature = signPayload(body, 'wrong_secret_key');

    const res = await request(app)
      .post('/webhooks')
      .set('Content-Type', 'application/json')
      .set('x-webhook-id', 'evt_005')
      .set('x-webhook-timestamp', new Date().toISOString())
      .set('x-webhook-signature', wrongSignature)
      .send(body);

    expect(res.status).toBe(401);
  });

  it('accepts webhook with unicode body and valid signature', async () => {
    // Sender signs raw bytes including unicode characters
    const body = '{"type": "customer.updated", "payload": {"name": "Jos\u00e9 Garc\u00eda", "address": "\u6771\u4eac\u90fd\u6e0b\u8c37\u533a", "note": "em-dash: \u2014"}}';
    const signature = signPayload(body, WEBHOOK_SECRET);

    const res = await request(app)
      .post('/webhooks')
      .set('Content-Type', 'application/json')
      .set('x-webhook-id', 'evt_006')
      .set('x-webhook-timestamp', new Date().toISOString())
      .set('x-webhook-signature', signature)
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
  });

  it('returns stored events via GET /events', async () => {
    eventStore.add({
      id: 'evt_list_001',
      type: 'test.event',
      payload: { data: 'hello' },
      timestamp: new Date().toISOString(),
    });

    const res = await request(app)
      .get('/events')
      .set('x-api-key', 'ak_test_development_key');

    expect(res.status).toBe(200);
    expect(res.body.events).toHaveLength(1);
    expect(res.body.events[0].id).toBe('evt_list_001');
  });
});
