FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.30.0 --activate

# ------- Build API -------
FROM base AS build-api
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api ./api
COPY web/package.json ./web/package.json
RUN pnpm install --frozen-lockfile --filter bootcamp-treinos-api...
RUN pnpm --filter bootcamp-treinos-api run build

# ------- Build WEB -------
FROM base AS build-web
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY web ./web
COPY api/package.json ./api/package.json
RUN pnpm install --frozen-lockfile --filter bootcamp-treinos-frontend...
RUN pnpm --filter bootcamp-treinos-frontend run build

# ------- Production -------
FROM base AS production
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY nginx.conf /etc/nginx/nginx.conf

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/
COPY web/package.json ./web/
RUN pnpm install --frozen-lockfile --prod --ignore-scripts --filter bootcamp-treinos-api... --filter bootcamp-treinos-frontend...

COPY --from=build-api /app/api/dist ./api/dist
COPY api/prisma ./api/prisma

COPY --from=build-web /app/web/.next ./web/.next
COPY --from=build-web /app/web/public ./web/public

COPY start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 80

CMD ["./start.sh"]