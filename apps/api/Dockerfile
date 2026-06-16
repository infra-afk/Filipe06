# ── API CHUÁ (Node + Express + TypeScript) ──────────────────────────────────
# Build context = raiz do repositório (ver docker-compose.yml)
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN npm install
COPY apps/api ./apps/api
RUN npm run build --workspace=apps/api

# ── Imagem final ────────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV UPLOADS_DIR=/app/uploads
# node_modules (com workspaces) e o build compilado
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
RUN mkdir -p /app/uploads
WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/index.js"]
