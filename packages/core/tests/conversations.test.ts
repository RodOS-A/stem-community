import { describe, it, expect, beforeEach } from 'vitest';
import { ConversationHistory } from '../src/db/conversations.js';

describe('ConversationHistory', () => {
  let history: ConversationHistory;

  beforeEach(() => {
    history = new ConversationHistory(':memory:');
  });

  it('stores and retrieves messages for a user', () => {
    history.add('user_abc', 'user', '¿Qué es una derivada?');
    history.add('user_abc', 'assistant', 'Una derivada mide la tasa de cambio.');

    const msgs = history.get('user_abc');
    expect(msgs).toHaveLength(2);
    expect(msgs[0]).toEqual({ role: 'user', content: '¿Qué es una derivada?' });
    expect(msgs[1]).toEqual({ role: 'assistant', content: 'Una derivada mide la tasa de cambio.' });
  });

  it('limits history to last 10 messages per user', () => {
    for (let i = 0; i < 12; i++) {
      history.add('user_abc', 'user', `Mensaje ${i}`);
    }
    const msgs = history.get('user_abc');
    expect(msgs).toHaveLength(10);
    expect(msgs[0].content).toBe('Mensaje 2');
    expect(msgs[9].content).toBe('Mensaje 11');
  });

  it('clears history for a specific user', () => {
    history.add('user_abc', 'user', 'Hola');
    history.clear('user_abc');
    expect(history.get('user_abc')).toHaveLength(0);
  });

  it('does not mix history between users', () => {
    history.add('user_1', 'user', 'Mensaje de user_1');
    history.add('user_2', 'user', 'Mensaje de user_2');

    expect(history.get('user_1')).toHaveLength(1);
    expect(history.get('user_2')).toHaveLength(1);
    expect(history.get('user_1')[0].content).toBe('Mensaje de user_1');
  });
});
