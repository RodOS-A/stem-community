import Groq from 'groq-sdk';
import type { AIProvider, Message } from './provider.js';

export class GroqProvider implements AIProvider {
  private client: Groq;
  private static readonly MODEL = 'llama-3.3-70b-versatile';
  private static readonly MAX_TOKENS = 800;
  private static readonly TEMPERATURE = 0.7;

  constructor(apiKey: string) {
    this.client = new Groq({ apiKey });
  }

  async chat(messages: Message[], systemPrompt: string): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: GroqProvider.MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: GroqProvider.MAX_TOKENS,
      temperature: GroqProvider.TEMPERATURE,
    });
    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Groq returned an empty response');
    return content;
  }
}

export function createProvider(): AIProvider {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY no está configurado en las variables de entorno.');
  return new GroqProvider(apiKey);
}
