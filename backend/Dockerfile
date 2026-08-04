# ─── BUILD STAGE ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm & dependencies
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY backend ./backend

RUN pnpm --filter @storyforge/shared build
RUN pnpm --filter storyforge-backend build

# ─── RUNTIME STAGE ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install FFmpeg & system utilities
RUN apk add --no-cache ffmpeg python3 make g++

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY packages/shared/package.json ./packages/shared/

RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/backend/dist ./backend/dist

WORKDIR /app/backend

EXPOSE 5000

USER node

CMD ["node", "dist/index.js"]
