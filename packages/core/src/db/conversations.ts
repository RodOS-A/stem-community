import type { Message } from '../ai/provider.js';

const MAX_HISTORY = 10;

// Map of userId -> array of messages
type ConversationStore = Map<string, Message[]>;

export class ConversationHistory {
  private store: ConversationStore;

  constructor(dbPath?: string) {
    // Using in-memory store. dbPath parameter is accepted but ignored
    // In production, this would use better-sqlite3 with the dbPath
    this.store = new Map();
  }

  add(userId: string, role: 'user' | 'assistant', content: string): void {
    if (!this.store.has(userId)) {
      this.store.set(userId, []);
    }

    const messages = this.store.get(userId)!;
    messages.push({ role, content });

    // Keep only the last MAX_HISTORY messages
    if (messages.length > MAX_HISTORY) {
      this.store.set(userId, messages.slice(-MAX_HISTORY));
    }
  }

  get(userId: string): Message[] {
    return this.store.get(userId) ?? [];
  }

  clear(userId: string): void {
    this.store.delete(userId);
  }
}
