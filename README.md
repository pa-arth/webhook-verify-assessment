# Webhook Signature Verification Service

A microservice that receives webhook events from an external payment provider, verifies their HMAC-SHA256 signatures, and stores them for downstream processing.

## Setup

```bash
npm install
```

## Running

```bash
npm run dev    # development with hot reload
npm start      # production (build first)
```

## Running Tests

```bash
npm test
```

## The Problem

Webhook events from our payment provider are being rejected with "Invalid signature" errors in production. The signature verification works for some payloads but fails for others. The webhook secret is correct — we've verified it matches what the provider has configured.

The test suite has 3 failing tests related to signature verification. Fix the webhook handler so all tests pass.

## Architecture

```
src/
  index.ts              — App entry, registers middleware + routes
  config.ts             — Environment variables and webhook secret
  types.ts              — Shared TypeScript types
  middleware/
    auth.ts             — API key authentication
    rateLimit.ts        — Simple in-memory rate limiter
    bodyParser.ts       — JSON body parser configuration
  routes/
    webhooks.ts         — Webhook handler with HMAC verification
    health.ts           — Health check endpoint
    events.ts           — List received events
  lib/
    crypto.ts           — HMAC helper functions
    store.ts            — In-memory event store
```

## API Endpoints

- `GET /health` — Health check
- `POST /webhooks` — Receive webhook events (requires valid HMAC signature)
- `GET /events` — List stored events (requires API key)
