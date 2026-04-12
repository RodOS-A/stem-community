import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { AIProvider, ConversationHistory } from '@stem/core';
import { STEM_TUTOR_PROMPT } from '@stem/core';

export const data = new SlashCommandBuilder()
  .setName('pregunta')
  .setDescription('Haz una pregunta de matemática o ciencias')
  .addStringOption((opt) =>
    opt
      .setName('texto')
      .setDescription('Tu pregunta STEM')
      .setRequired(true)
      .setMaxLength(500)
  );

export async function execute(
  interaction: ChatInputCommandInteraction,
  ai: AIProvider,
  history: ConversationHistory
): Promise<void> {
  await interaction.deferReply();

  const question = interaction.options.getString('texto', true);
  const userId = interaction.user.id;

  const previous = history.get(userId);
  history.add(userId, 'user', question);

  try {
    const response = await ai.chat(
      [...previous, { role: 'user', content: question }],
      STEM_TUTOR_PROMPT
    );
    history.add(userId, 'assistant', response);
    await interaction.editReply(response);
  } catch {
    await interaction.editReply('Lo siento, ocurrió un error. Por favor intenta de nuevo.');
  }
}
