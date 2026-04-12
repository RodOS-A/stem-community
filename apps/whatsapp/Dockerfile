FROM node:20-slim AS base
RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/core/package.json ./packages/core/
COPY apps/whatsapp/package.json ./apps/whatsapp/

RUN pnpm install --frozen-lockfile

COPY packages/core/ ./packages/core/
COPY apps/whatsapp/ ./apps/whatsapp/

WORKDIR /app/apps/whatsapp
CMD ["node", "--import=tsx/esm", "src/bot.ts"]
