# CHUÁ — Plataforma de Solicitações de Dashboard

> Plataforma interna para criação, gestão e rastreamento de dashboards operacionais via Canvas, Kanban e Formulário.

---

## Visão Geral

O **Chuá** é uma aplicação web full-stack que permite às equipes:

- Montar briefings de dashboard através de um **Canvas Operacional** guiado em 9 etapas
- Acompanhar o progresso das solicitações em um **quadro Kanban**
- Registrar solicitações via **Formulário** estruturado
- Visualizar **indicadores financeiros e operacionais** em tempo real
- Configurar a plataforma com logo personalizado e dados da empresa

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript + Zod |
| Banco de dados | PostgreSQL 16 (driver `pg`, sem Supabase) |
| Autenticação | JWT (bcryptjs + jsonwebtoken) |
| Infra | Nginx + PM2 em VM Ubuntu 24.04 LTS |
| Gráficos | Recharts |
| Drag & Drop | dnd-kit |

---

## Estrutura do Projeto

```
dashboard/
├── apps/
│   ├── api/                  # Backend Node.js + Express
│   │   └── src/
│   │       ├── auth/         # Registro, login, refresh JWT
│   │       ├── db.ts         # Pool de conexão PostgreSQL
│   │       ├── middleware/   # Middleware JWT
│   │       ├── modules/
│   │       │   └── canvas/   # Rotas, queries e schemas de canvas
│   │       └── index.ts      # Entrypoint da API
│   └── web/                  # Frontend React
│       └── src/
│           ├── components/   # Layout, Sidebar, Topbar
│           ├── contexts/     # AuthContext, ThemeContext
│           ├── data/         # Seed de dados iniciais
│           ├── pages/        # Páginas da aplicação
│           ├── store/        # KanbanStore (localStorage)
│           └── lib/          # api.ts, auth.ts
├── supabase/
│   └── schema_vm.sql         # Schema PostgreSQL puro
├── uploads/                  # Logos e imagens enviadas
└── CLAUDE.md                 # Guia de desenvolvimento
```

---

## Funcionalidades

### Canvas Operacional
- Formulário guiado em 9 etapas: Objetivos, Indicadores, Vendas, Despesas, Devoluções, DRE, Alertas, Decisões e Agentes IA
- Progresso circular em tempo real
- Geração automática de briefing ao concluir
- Envio direto para o Kanban

### Kanban
- Colunas: Entrada → Em Análise → Em Desenvolvimento → Em Revisão → Concluído
- Drag & drop entre colunas
- Cards com briefing completo, rastreabilidade de datas e tags
- Arquivamento de cards concluídos
- Busca integrada no Canvas

### Formulário
- Registro estruturado de nova solicitação de dashboard
- Integração com o Kanban

### Dashboard de Indicadores
- Receita, EBITDA, Margem, Churn, Vendas e Ticket Médio
- Gráficos de linha, barra e área via Recharts
- Dados de vendas, despesas, devoluções e DRE

### Configurações
- Upload de logo personalizado (PNG, JPG, WEBP, SVG — até 5MB)
- Logo refletido em tempo real na Sidebar e no Canvas
- Dados da empresa, integrações e preferências

---

## Instalação e Execução

### Pré-requisitos

- Node.js 20+
- PostgreSQL 16+
- PM2 (`npm install -g pm2`)
- Nginx

### 1. Banco de dados

```bash
psql -U postgres -c "CREATE DATABASE dashboard_db;"
psql -U postgres -c "CREATE USER dashboard_user WITH PASSWORD 'Chua@2026!Secure';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE dashboard_db TO dashboard_user;"
psql -U postgres -d dashboard_db -f supabase/schema_vm.sql
```

### 2. Variáveis de ambiente

**`apps/api/.env`**
```env
PORT=3001
DATABASE_URL=postgresql://dashboard_user:Chua@2026!Secure@localhost:5432/dashboard_db
JWT_SECRET=chua_jwt_secret_2026_ultra_secure_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost
NODE_ENV=production
```

**`apps/web/.env`**
```env
VITE_API_URL=
```

### 3. Instalar dependências e buildar

```bash
# Instalar dependências
npm install

# Build do frontend
npm run build

# Build da API
cd apps/api && npm run build
```

### 4. Iniciar com PM2

```bash
pm2 start ecosystem.config.js
```

### 5. Nginx

Configure o Nginx apontando:
- `/` → `apps/web/dist/` (frontend estático)
- `/api` → `http://127.0.0.1:3001` (API)
- `/auth` → `http://127.0.0.1:3001`
- `/uploads/` → `uploads/` (arquivos enviados)

---

## Usuário Administrador

Para criar o primeiro usuário admin via psql:

```sql
INSERT INTO app_auth.users (email, full_name, password_hash, role)
VALUES (
  'admin@chuasa.com',
  'Administrador',
  crypt('123456', gen_salt('bf')),
  'admin'
);
```

---

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `PORT` | Porta da API | `3001` |
| `DATABASE_URL` | URL de conexão PostgreSQL | — |
| `JWT_SECRET` | Chave secreta JWT | — |
| `JWT_EXPIRES_IN` | Expiração do token | `7d` |
| `FRONTEND_URL` | URL do frontend (CORS) | `http://localhost` |
| `NODE_ENV` | Ambiente | `production` |

---

## Scripts Disponíveis

```bash
npm run build        # Build completo (API + Web)
npm run dev          # Desenvolvimento local
pm2 list             # Ver status dos processos
pm2 logs chua-api    # Ver logs da API
pm2 restart chua-api # Restartar a API
```

---

## Licença

Uso interno — Chuá SA © 2026
