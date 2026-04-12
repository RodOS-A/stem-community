import Groq from 'groq-sdk';
import type { AIProvider, Message } from './provider.js';

export class GroqProvider implements AIProvider {
  private client: Groq;

  constructor(apiKey: string) {
    this.client = new Groq({ apiKey });
  }

  async chat(messages: Message[], systemPrompt: string): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 800,
      temperature: 0.7,
    });
    return completion.choices[0]?.message?.content ?? 'No pude generar una respuesta.';
  }
}

export function createProvider(): AIProvider {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY no está configurado en las variables de entorno.');
  return new GroqProvider(apiKey);
}
