# FoodRush — Food Delivery Platform

A fully microservices-based food delivery platform built with NestJS, Next.js, PostgreSQL, MongoDB, Redis, and RabbitMQ.

## Architecture

```
api-gateway          → Port 3000  (reverse proxy + JWT guard)
auth-service         → Port 3001  (register, login, JWT issuance)
user-service         → Port 3002  (profiles, addresses — PostgreSQL)
restaurant-service   → Port 3003  (restaurants, menus — MongoDB)
cart-service         → Port 3004  (shopping cart — Redis)
order-service        → Port 3005  (order lifecycle — PostgreSQL)
payment-service      → Port 3006  (Stripe payments — PostgreSQL)
delivery-service     → Port 3007  (driver tracking, WebSockets — PostgreSQL)
notification-service → Port 3008  (email notifications — RabbitMQ consumer)

customer-app         → Port 4000  (Next.js customer frontend)
restaurant-app       → Port 4001  (Next.js restaurant dashboard)
admin-app            → Port 4002  (Next.js admin panel)
```

## Running with Docker

```bash
docker-compose up --build
```

This starts all services, databases (5× PostgreSQL, MongoDB, Redis), RabbitMQ, and all three frontends.

## Running Locally (per service)

```bash
cd services/auth-service
npm install
npm run start:dev
```

## Environment Variables

Copy `.env.example` for each service. Key variables:
- `JWT_SECRET` — `foodrush_jwt_super_secret_2024`
- `STRIPE_SECRET_KEY` — your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` — from Stripe CLI / dashboard
- `RABBITMQ_URL` — `amqp://guest:guest@localhost:5672`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| API Gateway | NestJS + Axios proxy |
| Microservices | NestJS (8 services) |
| Auth | JWT + bcrypt |
| SQL Databases | PostgreSQL + TypeORM |
| Document DB | MongoDB + Mongoose |
| Cache/Cart | Redis + ioredis |
| Messaging | RabbitMQ + @nestjs/microservices |
| Payments | Stripe |
| Real-time | Socket.io + @nestjs/websockets |
| Frontend | Next.js 14 + Tailwind CSS |
| State | Zustand + React Query |
| Containers | Docker + docker-compose |
