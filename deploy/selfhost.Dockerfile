FROM node:20.12.0 AS builder

WORKDIR /app

RUN npm install -g pnpm@8.5.0

COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm run build

# Use the oven/bun:latest image for the final build
FROM oven/bun:latest

# Set the working directory
WORKDIR /app
RUN mkdir dist
RUN apt-get update && \
  apt-get install -y nginx supervisor

RUN bun install cheerio pino pino-pretty

COPY deploy/supervisord.conf /app/supervisord.conf
COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY deploy/start.sh /app/start.sh
COPY deploy/server.ts /app/server.ts

RUN addgroup --system nginx && \
  adduser --system --no-create-home --disabled-login --ingroup nginx nginx

RUN apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist /usr/share/nginx/html/
COPY --from=builder /app/dist /app/dist

RUN chmod +x /app/start.sh
RUN chmod +x /app/supervisord.conf

EXPOSE 80

CMD ["supervisord", "-c", "/app/supervisord.conf"]
