FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --fetch-timeout=600000 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000 --fetch-retries=5
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
RUN mkdir -p public
COPY package*.json ./
EXPOSE 3000
CMD ["npm", "start"]
