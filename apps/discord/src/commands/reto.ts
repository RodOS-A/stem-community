import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import type { AIProvider } from '@stem/core';
import { DAILY_CHALLENGE_PROMPT } from '@stem/core';

export const data = new SlashCommandBuilder()
  .setName('reto')
  .setDescription('Genera un reto del día de matemática o ciencias');

export async function execute(
  interaction: ChatInputCommandInteraction,
  ai: AIProvider
): Promise<void> {
  await interaction.deferReply();

  try {
    const challenge = await ai.chat(
      [{ role: 'user', content: 'Genera el reto de hoy.' }],
      DAILY_CHALLENGE_PROMPT
    );
    await interaction.editReply(challenge);
  } catch {
    await interaction.editReply('Lo siento, no pude generar el reto. Por favor intenta de nuevo.');
  }
}
