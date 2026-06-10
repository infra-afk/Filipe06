# CHUÁ Dashboard — Guia para o Claude

## Stack
- **Frontend:** React 18 + Vite + TypeScript + Tailwind + Recharts + dnd-kit
- **Backend:** Node.js + Express + TypeScript + Zod
- **Banco:** PostgreSQL 17 local (driver `pg`, SEM Supabase)
- **Auth:** bcryptjs + jsonwebtoken (SEM Supabase Auth)
- **Infra:** Nginx + PM2 na VM Ubuntu 24.04 LTS

## Estrutura
```
apps/
  api/src/
    auth/          → register, login, refresh
    db.ts          → pool pg
    middleware/    → auth JWT
    modules/canvas → rotas, queries, schemas
  web/src/
    lib/           → api.ts, auth.ts
    contexts/      → AuthContext, ThemeContext
    pages/         → CanvasOperacional, Kanban, Formulario
    store/         → kanbanStore
supabase/
  schema_vm.sql    → schema PostgreSQL puro (usar este, não schema.sql)
```

## Regras obrigatórias

### Antes de qualquer mudança
1. Leia este arquivo
2. Use `rg` ou `grep` para localizar o que precisa — não abra o projeto inteiro
3. Apresente um plano em bullet points antes de executar
4. Confirme impacto: quais arquivos mudam e por quê

### Durante
5. Altere no máximo 3 arquivos por vez
6. Nunca reescreva um arquivo inteiro se só precisa mudar uma função
7. Nunca remova lógica existente sem perguntar
8. Prefira edits cirúrgicos a rewrites

### Depois
9. Rode `npm run build` após mudanças relevantes
10. Confirme que não quebrou imports

## Proibido
- `@supabase/supabase-js` em qualquer arquivo novo
- `VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY`
- Deploy na Vercel
- Acessar o banco direto do frontend
- RLS (controle de acesso é feito pelo middleware JWT)

## Padrões de código

### API — query no banco
```ts
import { pool } from '../db'
const { rows } = await pool.query('SELECT * FROM canvases WHERE owner_id = $1', [userId])
```

### API — rota protegida
```ts
router.get('/canvases', authMiddleware, async (req, res) => { ... })
```

### Frontend — chamada autenticada
```ts
const res = await fetch('/api/canvases', {
  headers: { Authorization: `Bearer ${getToken()}` }
})
```

### Frontend — login
```ts
const { token, user } = await authLogin(email, password)
localStorage.setItem('token', token)
```

## Variáveis de ambiente

### apps/api/.env
```
PORT=3001
DATABASE_URL=postgresql://dashboard_user:Chua@2026!Secure@localhost:5432/dashboard_db
JWT_SECRET=chua_jwt_secret_2026_ultra_secure_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost
NODE_ENV=production
```

### apps/web/.env
```
VITE_API_URL=
```

## Objetivo atual
Migrar de Supabase + Vercel para VM própria com PostgreSQL local.
Schema adaptado está em `supabase/schema_vm.sql`.
Progresso da migração está em `MIGRATION.md`.
