# ── Web CHUÁ (React + Vite → Nginx) ─────────────────────────────────────────
# Build context = raiz do repositório (ver docker-compose.yml)
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN npm install
COPY apps/web ./apps/web
RUN npm run build --workspace=apps/web

# ── Servidor estático (Nginx) ───────────────────────────────────────────────
FROM nginx:alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
