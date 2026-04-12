import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { data as preguntaData } from './pregunta.js';
import { data as retoData } from './reto.js';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId || !guildId) {
  throw new Error('DISCORD_TOKEN, DISCORD_CLIENT_ID y DISCORD_GUILD_ID son requeridos en .env');
}

const rest = new REST().setToken(token);

await rest.put(
  Routes.applicationGuildCommands(clientId, guildId),
  { body: [preguntaData.toJSON(), retoData.toJSON()] }
);

console.log('✅ Slash commands registrados en el servidor.');
