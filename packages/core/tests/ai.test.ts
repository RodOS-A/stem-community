// packages/core/tests/ai.test.ts
import { describe, it, expect } from 'vitest';
import { createProvider } from '../src/ai/groq.js';

describe('GroqProvider', () => {
  it('returns a non-empty string for a math question', async () => {
    const ai = createProvider();
    const response = await ai.chat(
      [{ role: 'user', content: '¿Cuánto es 2 + 2? Responde solo el número.' }],
      'Eres un asistente de matemáticas.'
    );
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });
});

describe('createProvider', () => {
  it('throws when GROQ_API_KEY is not set', () => {
    const original = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;

    expect(() => createProvider()).toThrow('GROQ_API_KEY');

    process.env.GROQ_API_KEY = original;
  });
});
