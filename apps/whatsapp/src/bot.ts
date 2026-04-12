import 'dotenv/config';
import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  type ConnectionState,
  type BaileysEventMap,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { createProvider, ConversationHistory } from '@stem/core';
import { handleWhatsAppMessage } from './handlers/message.js';

const ai = createProvider();
const history = new ConversationHistory(
  process.env.WHATSAPP_DB_PATH ?? 'whatsapp_conversations.json'
);

async function connectToWhatsApp(): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState(process.env.AUTH_PATH ?? 'auth_info_baileys');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    browser: ['StemBot', 'Chrome', '1.0.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection, lastDisconnect }: Partial<ConnectionState>) => {
    if (connection === 'close') {
      const code = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      console.log(`Conexión cerrada (código ${code}). Reconectando: ${shouldReconnect}`);
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('✅ StemBot WhatsApp listo!');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }: BaileysEventMap['messages.upsert']) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const from = msg.key.remoteJid;
      if (!from) continue;

      const body =
        msg.message.conversation ??
        msg.message.extendedTextMessage?.text ??
        '';

      if (!body) continue;

      await handleWhatsAppMessage(
        from,
        body,
        async (text) => {
          try {
            await sock.sendMessage(from, { text });
          } catch (err) {
            console.error('Failed to send WhatsApp message:', err);
          }
        },
        ai,
        history
      );
    }
  });
}

connectToWhatsApp();
