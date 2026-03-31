import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Compute an HMAC-SHA256 signature for the given data.
 */
export function computeHmacSignature(data: string | Buffer, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Compare two signature strings in constant time to prevent timing attacks.
 * Returns true if they match, false otherwise.
 */
export function verifySignature(expected: string, actual: string): boolean {
  if (expected.length !== actual.length) return false;

  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(actual, 'hex'));
  } catch {
    return false;
  }
}
