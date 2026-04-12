import type { AIProvider, ConversationHistory } from '@stem/core';
import { STEM_TUTOR_PROMPT } from '@stem/core';

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

  const response = await ai.chat(
    [...previous, { role: 'user', content: question }],
    STEM_TUTOR_PROMPT
  );

  history.add(userId, 'assistant', response);
  await reply(response);
}
