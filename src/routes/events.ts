import { Router } from 'express';
import { requireApiKey } from '../middleware/auth.js';
import { eventStore } from '../lib/store.js';

const router = Router();

/**
 * GET /events — List received webhook events.
 * Requires API key authentication.
 * Supports ?limit and ?offset query parameters.
 */
router.get('/events', requireApiKey, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  const events = eventStore.list(limit, offset);
  const total = eventStore.count();

  res.json({
    events,
    pagination: {
      limit,
      offset,
      total,
      hasMore: offset + limit < total,
    },
  });
});

/**
 * GET /events/:id — Get a single event by ID.
 * Requires API key authentication.
 */
router.get('/events/:id', requireApiKey, (req, res) => {
  const event = eventStore.getById(req.params.id);

  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  res.json(event);
});

export { router as eventsRouter };
