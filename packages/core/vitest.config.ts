import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      GROQ_API_KEY: process.env.GROQ_API_KEY ?? '',
    },
  },
});
