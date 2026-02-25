# ─── Development stage ──────────────────────────────────────────────────────
FROM node:22-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Source is bind-mounted in docker-compose dev
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]


# ─── Builder stage ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_TARGET is not needed at build time (nginx handles the proxy)
RUN npm run build


# ─── Production stage (nginx) ────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
