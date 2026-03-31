export interface WebhookEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface StoredEvent extends WebhookEvent {
  receivedAt: string;
  verified: boolean;
}

export interface WebhookHeaders {
  'x-webhook-signature': string;
  'x-webhook-timestamp': string;
  'x-webhook-id': string;
}

declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}
