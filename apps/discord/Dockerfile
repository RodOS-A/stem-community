FROM node:20-alpine AS base
RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/core/package.json ./packages/core/
COPY apps/discord/package.json ./apps/discord/

RUN pnpm install --frozen-lockfile

COPY packages/core/ ./packages/core/
COPY apps/discord/ ./apps/discord/

WORKDIR /app/apps/discord
CMD ["node", "--import=tsx/esm", "src/bot.ts"]
