# Migração — CHUÁ Dashboard para VM Própria

Documento de escopo para migrar a plataforma CHUÁ do ambiente Vercel + Supabase para uma VM Linux auto-hospedada com PostgreSQL local e autenticação própria.

---

## Motivação

| Situação atual | Após migração |
|---|---|
| Frontend na Vercel (CDN externo) | Frontend servido pelo Nginx na VM |
| Banco de dados no Supabase (nuvem) | PostgreSQL 17 rodando na VM |
| Auth via Supabase Auth (JWT externo) | Auth própria com bcrypt + JWT |
| Dependência de serviços de terceiros | Infraestrutura 100% autônoma |

---

## Arquitetura de destino

```
VM Linux (Ubuntu 24.04 LTS)
│
├── Nginx (porta 80/443)
│   ├── /          → serve apps/web/dist (build estático React)
│   └── /api/*     → proxy para Node.js (porta 3001)
│
├── apps/api (Node.js + Express + PM2)
│   ├── POST /auth/register   → cadastro com bcrypt
│   ├── POST /auth/login      → retorna JWT próprio
│   ├── POST /auth/refresh    → renova token
│   └── /api/*                → rotas protegidas (middleware JWT)
│
└── PostgreSQL 17 (porta 5432 — acesso local apenas)
    ├── schema: app_auth   → users (substitui auth.users do Supabase)
    └── schema: public     → organizations, canvases, canvas_sections,
                             canvas_items, profiles
```

---

## O que muda em cada camada

### Banco de dados

- Substituir referências a `auth.users` por `app_auth.users`
- Remover políticas RLS que dependem de `auth.uid()` — controle de acesso passa para a API
- Manter: tabelas, enums, índices, triggers de `updated_at`, soft deletes

### Backend (`apps/api`)

| Antes | Depois |
|---|---|
| `@supabase/supabase-js` como client | Driver `pg` conectando direto no PostgreSQL |
| JWT validado pelo Supabase | JWT assinado e validado pela própria API |
| `supabase-admin.ts` | `db.ts` com pool de conexões pg |
| Sem rotas de auth | `src/auth/` com register, login, refresh |

### Frontend (`apps/web`)

| Antes | Depois |
|---|---|
| `@supabase/supabase-js` para auth e queries | `fetch` para `apps/api` com `Authorization: Bearer <token>` |
| `AuthContext.tsx` usa Supabase session | `AuthContext.tsx` usa JWT armazenado em `localStorage` |
| `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` | `VITE_API_URL` apontando para a VM |

### Infraestrutura

- Remover: Vercel, Supabase project
- Adicionar: Nginx, PM2, PostgreSQL 17, Certbot (SSL)

---

## Etapas da migração

### Etapa 1 — Preparar a VM

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx postgresql-17 curl

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 e Claude Code
npm install -g pm2 @anthropic-ai/claude-code
```

### Etapa 2 — Configurar PostgreSQL

```bash
sudo -u postgres psql -c "CREATE USER dashboard WITH PASSWORD 'senha_forte';"
sudo -u postgres psql -c "CREATE DATABASE dashboard_db OWNER dashboard;"
psql -U dashboard -d dashboard_db -f supabase/schema_vm.sql
```

### Etapa 3 — Migrar dados do Supabase

```bash
# Exportar dados do Supabase (rodar no Windows)
pg_dump "postgresql://postgres:[senha]@db.ocblpyycvgsoyjsdinlx.supabase.co:5432/postgres" \
  --schema=public --data-only --no-owner -f dados_exportados.sql

# Importar na VM
psql -U dashboard -d dashboard_db -f dados_exportados.sql
```

### Etapa 4 — Adaptar o schema (`schema_vm.sql`)

Arquivo gerado a partir de `supabase/schema.sql` com as seguintes alterações:

- Criar schema `app_auth` com tabela `users` (email, password_hash, full_name, avatar_url)
- Substituir todas as referências `auth.users` → `app_auth.users`
- Remover políticas RLS baseadas em `auth.uid()` — segurança via middleware da API
- Manter enums, índices, triggers e constraints

### Etapa 5 — Reescrever autenticação na API

Criar módulo `apps/api/src/auth/`:

```
src/auth/
├── auth.routes.ts      → POST /auth/register, /auth/login, /auth/refresh
├── auth.service.ts     → bcrypt + jsonwebtoken
└── auth.schemas.ts     → validação Zod dos payloads
```

Atualizar `src/middleware/auth.ts` para verificar JWT próprio (não mais Supabase).

### Etapa 6 — Atualizar o frontend

- Remover dependência `@supabase/supabase-js`
- Reescrever `src/lib/` com cliente HTTP simples (`api.ts`, `auth.ts`)
- Atualizar `AuthContext.tsx` para usar tokens próprios
- Atualizar `.env` com `VITE_API_URL` apontando para a VM

### Etapa 7 — Configurar Nginx

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    root /var/www/dashboard/apps/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header Authorization $http_authorization;
        proxy_pass_header Authorization;
    }
}
```

### Etapa 8 — SSL com Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

### Etapa 9 — Subir a API com PM2

```bash
cd /var/www/dashboard
npm install
npm run build

cd apps/api
pm2 start npm --name "dashboard-api" -- start
pm2 save
pm2 startup
```

### Etapa 10 — Smoke test

```bash
# Health check da API
curl http://localhost:3001/health

# Testar auth
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"senha"}'

# Testar frontend
curl -I http://localhost
```

---

## Variáveis de ambiente após migração

### `apps/api/.env`

```env
PORT=3001
DATABASE_URL=postgresql://dashboard:senha_forte@localhost:5432/dashboard_db
JWT_SECRET=chave_secreta_longa_e_aleatoria
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://seu-dominio.com
```

### `apps/web/.env`

```env
VITE_API_URL=http://seu-dominio.com
```

---

## Estrutura de pastas após migração

```
apps/
  api/
    src/
      auth/
        auth.routes.ts         # POST /auth/register, /login, /refresh
        auth.service.ts        # bcrypt + JWT
        auth.schemas.ts        # Zod
      db.ts                    # Pool pg
      middleware/auth.ts       # Validação JWT próprio
      modules/canvas/          # Rotas e queries (sem mudança de lógica)
  web/
    src/
      lib/
        api.ts                 # fetch com Authorization header
        auth.ts                # login/register/logout
      contexts/
        AuthContext.tsx        # JWT em localStorage
supabase/
  schema.sql                   # Schema original (Supabase)
  schema_vm.sql                # Schema adaptado para PostgreSQL puro
```

---

## Dependências a remover

```bash
# API
npm uninstall @supabase/supabase-js --workspace=apps/api

# Web
npm uninstall @supabase/supabase-js --workspace=apps/web
```

## Dependências a adicionar

```bash
# API
npm install pg jsonwebtoken bcryptjs --workspace=apps/api
npm install -D @types/pg @types/jsonwebtoken @types/bcryptjs --workspace=apps/api
```

---

## Critérios de conclusão

- [ ] VM acessível via HTTPS com certificado válido
- [ ] Login e cadastro funcionando com JWT próprio
- [ ] Canvas Operacional criando e salvando dados no PostgreSQL local
- [ ] Kanban com drag-and-drop persistindo no banco
- [ ] Formulário de auditoria carregando dados históricos migrados
- [ ] PM2 reiniciando a API automaticamente após reboot
- [ ] Supabase project desativado sem impacto no app

---

## Referências

- VM: Ubuntu 24.04 LTS (VirtualBox)
- Banco original: `db.ocblpyycvgsoyjsdinlx.supabase.co` (org: `chua`)
- Schema original: `supabase/schema.sql`
- Stack: React 18 + Vite + TypeScript + Node.js + Express + PostgreSQL 17 + Nginx
