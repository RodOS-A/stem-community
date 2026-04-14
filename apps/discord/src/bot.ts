import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  Events,
  ActivityType,
  ChatInputCommandInteraction,
} from 'discord.js';
import { createProvider, ConversationHistory } from '@stem/core';
import { handleMention } from './handlers/message.js';
import * as preguntaCmd from './commands/pregunta.js';
import * as retoCmd from './commands/reto.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

const ai = createProvider();
const history = new ConversationHistory(process.env.DISCORD_DB_PATH ?? 'discord_conversations.db');

client.once(Events.ClientReady, (c) => {
  console.log(`✅ StemBot Discord listo como ${c.user.tag}`);
  c.user.setActivity('preguntas STEM', { type: ActivityType.Listening });
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.mentions.has(client.user!)) return;

  const content = message.content.replace(/<@!?\d+>/g, '').trim();
  await message.channel.sendTyping();

  await handleMention(
    message.author.id,
    content,
    (text) => message.reply({ content: text }).then(() => undefined),
    ai,
    history
  );
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'pregunta') {
    await preguntaCmd.execute(interaction as ChatInputCommandInteraction, ai, history);
  } else if (interaction.commandName === 'reto') {
    await retoCmd.execute(interaction as ChatInputCommandInteraction, ai);
  }
});

client.login(process.env.DISCORD_TOKEN);
