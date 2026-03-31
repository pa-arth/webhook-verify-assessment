export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  webhookSecret: process.env.WEBHOOK_SECRET || 'whsec_test_secret_key_for_development',
  apiKey: process.env.API_KEY || 'ak_test_development_key',
  maxRequestsPerMinute: parseInt(process.env.RATE_LIMIT || '60', 10),
};
