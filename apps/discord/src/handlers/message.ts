import type { AIProvider, ConversationHistory } from '@stem/core';
import { STEM_TUTOR_PROMPT } from '@stem/core';

const ERROR_RESPONSE = 'Lo siento, ocurrió un error al procesar tu pregunta. Por favor intenta de nuevo.';

export async function handleMention(
  userId: string,
  content: string,
  reply: (text: string) => Promise<void>,
  ai: AIProvider,
  history: ConversationHistory
): Promise<void> {
  const question = content.trim();
  if (!question) return;

  const previous = history.get(userId);
  history.add(userId, 'user', question);

  try {
    const response = await ai.chat(
      [...previous, { role: 'user', content: question }],
      STEM_TUTOR_PROMPT
    );
    history.add(userId, 'assistant', response);
    await reply(response);
  } catch {
    // Send error message to user but don't persist it to history
    await reply(ERROR_RESPONSE);
  }
}
