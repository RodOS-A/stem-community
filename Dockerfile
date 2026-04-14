FROM node:20-slim
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
WORKDIR /app/apps/discord
CMD ["node", "--import=tsx/esm", "src/bot.ts"]
