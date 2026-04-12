import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { Message } from '../ai/provider.js';

const MAX_HISTORY = 10;

interface StorageData {
  [userId: string]: Message[];
}

export class ConversationHistory {
  private store: StorageData;
  private dbPath: string;
  private isMemory: boolean;

  constructor(dbPath: string = process.env.DB_PATH ?? 'conversations.json') {
    this.dbPath = dbPath;
    this.isMemory = dbPath === ':memory:';
    this.store = this.isMemory ? {} : this.loadFromFile();
  }

  private loadFromFile(): StorageData {
    try {
      if (existsSync(this.dbPath)) {
        const content = readFileSync(this.dbPath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn(`Failed to load conversations from ${this.dbPath}:`, error);
    }
    return {};
  }

  private saveToFile(): void {
    // Skip persistence if in-memory mode
    if (this.isMemory) {
      return;
    }

    try {
      const dir = dirname(this.dbPath);
      if (dir && dir !== '.') {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(this.dbPath, JSON.stringify(this.store, null, 2), 'utf-8');
    } catch (error) {
      console.warn(`Failed to save conversations to ${this.dbPath}:`, error);
    }
  }

  add(userId: string, role: 'user' | 'assistant', content: string): void {
    if (!this.store[userId]) {
      this.store[userId] = [];
    }

    this.store[userId].push({ role, content });

    // Keep only the last MAX_HISTORY messages
    if (this.store[userId].length > MAX_HISTORY) {
      this.store[userId] = this.store[userId].slice(-MAX_HISTORY);
    }

    this.saveToFile();
  }

  get(userId: string): Message[] {
    return this.store[userId] ?? [];
  }

  clear(userId: string): void {
    delete this.store[userId];
    this.saveToFile();
  }
}
