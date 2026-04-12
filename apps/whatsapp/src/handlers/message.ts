import type { AIProvider, ConversationHistory } from '@stem/core';
import { STEM_TUTOR_PROMPT } from '@stem/core';

const PREFIX = '!stem';
const ERROR_RESPONSE = 'Lo siento, ocurrió un error al procesar tu pregunta. Por favor intenta de nuevo.';

export async function handleWhatsAppMessage(
  from: string,
  body: string,
  send: (text: string) => Promise<void>,
  ai: AIProvider,
  history: ConversationHistory
): Promise<void> {
  const trimmed = body.trim();
  if (!trimmed.toLowerCase().startsWith(PREFIX)) return;

  const content = trimmed.slice(PREFIX.length).trim();

  if (content.toLowerCase() === 'limpiar') {
    history.clear(from);
    await send('🧹 Historial limpiado. ¡Empecemos de nuevo!');
    return;
  }

  if (!content) {
    await send(
      '¡Hola! Soy StemBot 🤖\n\n' +
      'Úsame así:\n' +
      '*!stem [tu pregunta]*\n\n' +
      'Ejemplo: _!stem ¿Cuánto es la derivada de x²?_\n\n' +
      '_!stem limpiar_ → reinicia la conversación'
    );
    return;
  }

  const previous = history.get(from);

  try {
    const response = await ai.chat(
      [...previous, { role: 'user', content }],
      STEM_TUTOR_PROMPT
    );
    history.add(from, 'user', content);       // only persist if AI succeeded
    history.add(from, 'assistant', response);
    await send(response);
  } catch {
    await send(ERROR_RESPONSE);
  }
}
