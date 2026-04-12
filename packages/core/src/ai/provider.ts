export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  chat(messages: Message[], systemPrompt: string): Promise<string>;
}
