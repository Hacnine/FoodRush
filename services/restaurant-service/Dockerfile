FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN for i in 1 2 3 4 5; do npm install --fetch-timeout=600000 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000 --fetch-retries=5 && break; echo "Retry $i/5..."; sleep 20; done
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3003
CMD ["node", "dist/main"]
