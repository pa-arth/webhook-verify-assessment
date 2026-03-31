import type { StoredEvent, WebhookEvent } from '../types.js';

class EventStore {
  private events: StoredEvent[] = [];

  add(event: WebhookEvent): StoredEvent {
    const stored: StoredEvent = {
      ...event,
      receivedAt: new Date().toISOString(),
      verified: true,
    };
    this.events.push(stored);
    return stored;
  }

  list(limit = 50, offset = 0): StoredEvent[] {
    return this.events.slice(offset, offset + limit);
  }

  count(): number {
    return this.events.length;
  }

  getById(id: string): StoredEvent | undefined {
    return this.events.find(e => e.id === id);
  }

  clear(): void {
    this.events = [];
  }
}

export const eventStore = new EventStore();
