import express from 'express';
import { config } from './config.js';
import { configureBodyParser } from './middleware/bodyParser.js';
import { rateLimit } from './middleware/rateLimit.js';
import { healthRouter } from './routes/health.js';
import { webhooksRouter } from './routes/webhooks.js';
import { eventsRouter } from './routes/events.js';

const app = express();

// Global middleware
configureBodyParser(app);
app.use(rateLimit);

// Routes
app.use(healthRouter);
app.use(webhooksRouter);
app.use(eventsRouter);

// Start server (only when run directly, not during tests)
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`Webhook server listening on port ${config.port}`);
  });
}

export { app };
