import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleMention } from '../src/handlers/message.js';

const mockReply = vi.fn().mockResolvedValue(undefined);
const mockAI = {
  chat: vi.fn().mockResolvedValue('La integral es la operación inversa de la derivada.'),
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

describe('handleMention', () => {
  it('calls AI with user question and system prompt', async () => {
    await handleMention('user_123', '¿Qué es una integral?', mockReply, mockAI as any, mockHistory as any);

    expect(mockAI.chat).toHaveBeenCalledWith(
      [{ role: 'user', content: '¿Qué es una integral?' }],
      expect.stringContaining('StemBot')
    );
    expect(mockReply).toHaveBeenCalledWith('La integral es la operación inversa de la derivada.');
  });

  it('includes conversation history in AI call', async () => {
    mockHistory.get.mockReturnValue([
      { role: 'user', content: 'Pregunta anterior' },
      { role: 'assistant', content: 'Respuesta anterior' },
    ]);

    await handleMention('user_123', 'Nueva pregunta', mockReply, mockAI as any, mockHistory as any);

    expect(mockAI.chat).toHaveBeenCalledWith(
      [
        { role: 'user', content: 'Pregunta anterior' },
        { role: 'assistant', content: 'Respuesta anterior' },
        { role: 'user', content: 'Nueva pregunta' },
      ],
      expect.any(String)
    );
  });

  it('saves both user message and AI response to history', async () => {
    await handleMention('user_123', '¿Qué es pi?', mockReply, mockAI as any, mockHistory as any);

    expect(mockHistory.add).toHaveBeenCalledWith('user_123', 'user', '¿Qué es pi?');
    expect(mockHistory.add).toHaveBeenCalledWith('user_123', 'assistant', 'La integral es la operación inversa de la derivada.');
  });

  it('does nothing when content is empty', async () => {
    await handleMention('user_123', '   ', mockReply, mockAI as any, mockHistory as any);

    expect(mockAI.chat).not.toHaveBeenCalled();
    expect(mockReply).not.toHaveBeenCalled();
  });
});
