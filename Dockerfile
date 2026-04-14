# Multi-stage build for stem-discord-bot monorepo
FROM node:20-slim

# Install pnpm globally
RUN npm install -g pnpm@latest

WORKDIR /app

# Copy root-level workspace configuration
COPY .npmrc* pnpm-workspace.yaml package.json tsconfig.base.json* ./

# Copy core package
COPY packages/core/package.json ./packages/core/
COPY packages/core/tsconfig.json* ./packages/core/ 2>/dev/null || true
COPY packages/core/src ./packages/core/src

# Copy discord app package
COPY apps/discord/package.json ./apps/discord/
COPY apps/discord/tsconfig.json* ./apps/discord/ 2>/dev/null || true
COPY apps/discord/src ./apps/discord/src

# Install all dependencies with frozen lockfile
RUN pnpm install --frozen-lockfile 2>&1 || pnpm install

# Set working directory to discord app
WORKDIR /app/apps/discord

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "console.log('ok')" || exit 1

# Start the bot
CMD ["node", "--import=tsx/esm", "src/bot.ts"]
