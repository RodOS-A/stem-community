import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleWhatsAppMessage } from '../src/handlers/message.js';

const mockSend = vi.fn().mockResolvedValue(undefined);
const mockAI = {
  chat: vi.fn().mockResolvedValue('La fórmula cuadrática resuelve ecuaciones de grado 2.'),
};
const mockHistory = {
  add: vi.fn(),
  get: vi.fn().mockReturnValue([]),
  clear: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockHistory.get.mockReturnValue([]);
});

describe('handleWhatsAppMessage', () => {
  it('responds to !stem prefix', async () => {
    await handleWhatsAppMessage(
      '51999999999@s.whatsapp.net',
      '!stem ¿Qué es la fórmula cuadrática?',
      mockSend,
      mockAI as any,
      mockHistory as any
    );

    expect(mockAI.chat).toHaveBeenCalledWith(
      [{ role: 'user', content: '¿Qué es la fórmula cuadrática?' }],
      expect.stringContaining('StemBot')
    );
    expect(mockSend).toHaveBeenCalledWith('La fórmula cuadrática resuelve ecuaciones de grado 2.');
  });

  it('ignores messages without !stem prefix', async () => {
    await handleWhatsAppMessage(
      '51999999999@s.whatsapp.net',
      'Hola, ¿cómo estás?',
      mockSend,
      mockAI as any,
      mockHistory as any
    );

    expect(mockAI.chat).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('sends help message when !stem is sent alone', async () => {
    await handleWhatsAppMessage(
      '51999999999@s.whatsapp.net',
      '!stem',
      mockSend,
      mockAI as any,
      mockHistory as any
    );

    expect(mockAI.chat).not.toHaveBeenCalled();
    expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('!stem [tu pregunta]'));
  });

  it('clears history on !stem limpiar', async () => {
    await handleWhatsAppMessage(
      '51999999999@s.whatsapp.net',
      '!stem limpiar',
      mockSend,
      mockAI as any,
      mockHistory as any
    );

    expect(mockHistory.clear).toHaveBeenCalledWith('51999999999@s.whatsapp.net');
    expect(mockSend).toHaveBeenCalledWith('🧹 Historial limpiado. ¡Empecemos de nuevo!');
    expect(mockAI.chat).not.toHaveBeenCalled();
  });

  it('replies with error message when AI throws', async () => {
    mockAI.chat.mockRejectedValueOnce(new Error('Groq API error'));

    await handleWhatsAppMessage(
      '51999999999@s.whatsapp.net',
      '!stem ¿Qué es pi?',
      mockSend,
      mockAI as any,
      mockHistory as any
    );

    expect(mockSend).toHaveBeenCalledWith(
      expect.stringContaining('Lo siento')
    );
  });
});
