FROM node:20-alpine AS base
RUN npm install -g pnpm
WORKDIR /app

FROM base AS builder
COPY package.json pnpm-workspace.yaml tsconfig.base.json* .npmrc* ./
COPY packages/core/package.json ./packages/core/
COPY apps/discord/package.json ./apps/discord/
RUN pnpm install --prod=false --no-frozen-lockfile

COPY packages/core ./packages/core
COPY apps/discord ./apps/discord

FROM base AS production
COPY --from=builder /app /app
WORKDIR /app/apps/discord
CMD ["node", "--import=tsx/esm", "src/bot.ts"]
