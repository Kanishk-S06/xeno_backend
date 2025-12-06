import crypto from 'crypto';

export function verifyShopifyWebhook(rawBody: Buffer, hmacHeader: string, secret: string) {
  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody, 'utf8');
    const digest = hmac.digest('base64');
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
  } catch (err) {
    console.warn('hmac verify error', err);
    return false;
  }
}
