# Dashboard Executivo + Canvas Operacional

Dashboard executivo para gestão de indicadores empresariais com Canvas Operacional estratégico.

## Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + Recharts + @dnd-kit
- **Backend**: Node.js + Express + TypeScript + Zod
- **Banco/Auth**: Supabase (PostgreSQL + Auth + RLS)

---

## Configuração inicial

### 1. Banco de dados (Supabase)

Acesse o [Supabase Dashboard](https://supabase.com/dashboard), abra o projeto, vá em **SQL Editor** e execute o arquivo:

```
supabase/schema.sql
```

Isso cria as tabelas, índices, RLS e triggers automaticamente.

### 2. Variáveis de ambiente

Copie `.env.example` para `.env` na raiz do projeto e preencha:

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...   # Project API Keys → anon/public
VITE_API_URL=http://localhost:3000

SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_ANON_KEY=eyJ...        # Project API Keys → anon/public
SUPABASE_SERVICE_ROLE_KEY=eyJ...# Project API Keys → service_role (manter em segredo)
PORT=3000
FRONTEND_URL=http://localhost:5173
```

> As chaves ficam em: **Supabase → Project Settings → API**

### 3. Instalar e rodar

```bash
npm install
npm run dev
```

---

## URLs

| Serviço  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:5173         |
| API      | http://localhost:3000         |
| Health   | http://localhost:3000/health  |

---

## Autenticação

O login usa **Supabase Auth** (email + senha). Crie o usuário em:

> Supabase → Authentication → Users → Add user

Ou habilite o cadastro e registre pelo login.

---

## Telas disponíveis

| Rota                  | Descrição                       |
|-----------------------|---------------------------------|
| `/login`              | Autenticação via Supabase Auth  |
| `/dashboard`          | Visão geral com gráficos        |
| `/canvases`           | Lista de canvases operacionais  |
| `/canvas/:id`         | Canvas com drag-and-drop        |
| `/objetivos`          | Objetivos estratégicos          |
| `/indicadores`        | Tabela de indicadores           |
| `/vendas`             | Análise de vendas               |
| `/despesas`           | Controle de despesas            |
| `/devolucoes`         | Análise de devoluções           |
| `/dre`                | DRE simplificada                |
| `/alertas`            | Alertas ativos                  |
| `/decisoes`           | Decisões recomendadas           |
| `/agentes`            | Agentes de IA                   |
| `/automacoes`         | Automações                      |
| `/configuracoes`      | Configurações                   |

---

## Canvas Operacional

### O que é

Uma tela visual onde você monta o canvas estratégico/operacional da empresa, com seções organizadas em grade:

**Linha 1:** Objetivos · Indicadores · Pessoas · Decisões  
**Linha 2:** Dados (linha inteira)  
**Linha 3:** Análises · Alertas · Agentes · Automações

### Funcionalidades

- Criar canvases com seed automático (seções e itens padrão)
- Adicionar, editar e remover itens em cada seção
- Reordenar itens com drag-and-drop (ordem salva automaticamente)
- Persistência completa no Supabase com RLS
- Loading states, empty states e mensagens de erro

### API do Canvas

| Método | Rota                                    | Descrição                  |
|--------|-----------------------------------------|----------------------------|
| GET    | `/api/canvases`                         | Listar canvases do usuário  |
| POST   | `/api/canvases`                         | Criar canvas (+ seed)       |
| GET    | `/api/canvases/:id`                     | Buscar canvas completo      |
| PATCH  | `/api/canvases/:id`                     | Atualizar canvas            |
| DELETE | `/api/canvases/:id`                     | Remover canvas              |
| POST   | `/api/canvases/:id/items`               | Criar item em seção         |
| PATCH  | `/api/canvases/:id/items/reorder`       | Reordenar itens             |
| PATCH  | `/api/items/:itemId`                    | Editar item                 |
| DELETE | `/api/items/:itemId`                    | Remover item                |

Todas as rotas exigem `Authorization: Bearer <supabase_jwt>`.

---

## Segurança

- RLS ativa em todas as tabelas — usuário só acessa o próprio conteúdo
- `SUPABASE_SERVICE_ROLE_KEY` usada apenas no backend, nunca exposta no frontend
- Payloads validados com Zod em todas as rotas
- JWT do Supabase validado em cada requisição ao backend

---

## Estrutura de pastas

```
apps/
  api/
    src/
      lib/supabase-admin.ts       # clientes Supabase (admin + por usuário)
      middleware/auth.ts          # validação JWT
      modules/canvas/
        canvas.routes.ts          # rotas /api/canvases
        items.routes.ts           # rotas /api/items
        canvas.repository.ts      # queries no Supabase
        canvas.schemas.ts         # validação Zod
        default-canvas.ts         # seed padrão
  web/
    src/
      contexts/AuthContext.tsx    # sessão Supabase
      lib/
        supabase.ts               # cliente Supabase (anon)
        api.ts                    # cliente HTTP para a API
      features/canvas/
        types.ts
        hooks/useCanvas.ts        # estado + mutações
        components/
          CanvasGrid.tsx          # layout + DnD context
          CanvasSection.tsx       # seção com itens
          CanvasItem.tsx          # item arrastável
          ItemEditorModal.tsx     # modal criar/editar
          DeleteConfirmDialog.tsx # confirmação remoção
        pages/
          CanvasListPage.tsx      # /canvases
          CanvasPage.tsx          # /canvas/:id
supabase/
  schema.sql                      # tabelas, RLS, triggers
```

---

## Scripts

```bash
npm run dev        # roda frontend + backend em paralelo
npm run build      # build de produção
```
