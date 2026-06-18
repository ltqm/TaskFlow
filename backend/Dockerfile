FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++ openssl

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 8089

ENTRYPOINT ["./docker-entrypoint.sh"]
