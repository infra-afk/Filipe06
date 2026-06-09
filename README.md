# CHUÁ — Solicitações de Dashboard 

Plataforma de gestão operacional com Canvas Estratégico, Kanban de dashboards e registro de documentação para auditoria.

---

## Stack Técnica

### Frontend
| Tecnologia | O que faz no projeto |
|---|---|
| **React 18** | Biblioteca principal para construção das interfaces. Usa componentes funcionais com hooks (`useState`, `useEffect`, `useContext`, `useCallback`). |
| **Vite** | Ferramenta de build e servidor de desenvolvimento. Substitui o Create React App — inicia em menos de 1 segundo e faz hot-reload instantâneo ao salvar arquivos. |
| **TypeScript** | Adiciona tipagem estática ao JavaScript. Evita erros em tempo de execução, autocompleta variáveis e garante contratos entre componentes (ex: interface `KanbanCard`). |
| **Tailwind CSS** | Framework de CSS utilitário. As classes são escritas diretamente no HTML (`px-4 py-2 rounded-xl`) sem criar arquivos `.css` separados. Gera apenas o CSS que é usado. |
| **Recharts** | Biblioteca de gráficos para React. Usada para barras, linhas e indicadores visuais nos dashboards. Baseada em SVG e D3. |
| **@dnd-kit** | Drag-and-drop acessível. Usado no Kanban para arrastar cards entre colunas com suporte a teclado e touch. |
| **React Router v6** | Gerencia as rotas da SPA (`/kanban`, `/canvases`, `/formulario`). Usa `useNavigate` para redirecionamentos e `NavLink` para o menu lateral. |
| **Lucide React** | Biblioteca de ícones SVG. Leves, consistentes e customizáveis por tamanho e cor. |

### Backend
| Tecnologia | O que faz no projeto |
|---|---|
| **Node.js** | Ambiente de execução JavaScript no servidor. Processa requisições da API fora do navegador. |
| **Express** | Framework minimalista para criar rotas HTTP (`GET /api/canvases`, `POST /api/items`, etc.). Lida com middlewares de autenticação e tratamento de erros. |
| **TypeScript** | Mesma tipagem do frontend aplicada ao backend. Garante que os dados que chegam pela API têm o formato correto antes de chegar ao banco. |
| **Zod** | Validação de schemas em runtime. Toda requisição passa por um schema Zod antes de ser processada — se o payload estiver errado, retorna erro 400 com mensagem clara. |

### Banco de Dados e Autenticação
| Tecnologia | O que faz no projeto |
|---|---|
| **Supabase** | Plataforma backend-as-a-service. Fornece banco de dados, autenticação e API REST/realtime prontos para uso sem configurar servidor próprio. |
| **PostgreSQL** | Banco de dados relacional usado pelo Supabase. Armazena usuários, canvases, cards e toda estrutura do projeto. |
| **Supabase Auth** | Sistema de autenticação com email e senha. Gera JWT (token) que é validado em cada requisição ao backend. |
| **RLS (Row Level Security)** | Regra no banco que impede um usuário de ler ou alterar dados de outro. Mesmo que alguém descubra a chave pública, não consegue acessar dados alheios. |

### Deploy e Infraestrutura
| Tecnologia | O que faz no projeto |
|---|---|
| **Vercel** | Plataforma de deploy para frontend. Faz o build do Vite automaticamente, distribui via CDN global e disponibiliza em HTTPS. Deploy feito via CLI (`npx vercel --prod`). URL atual: `filipe06-web-3jso.vercel.app` |
| **GitHub** | Repositório do código. Cada `git push origin main` atualiza o histórico e dispara o deploy na Vercel. |

---

## Como rodar localmente

### 1. Banco de dados (Supabase)

Acesse o [Supabase Dashboard](https://supabase.com/dashboard), abra o projeto, vá em **SQL Editor** e execute:

```
supabase/schema.sql
```

Isso cria as tabelas, índices, RLS e triggers automaticamente.

### 2. Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...        # Project API Keys → anon/public
VITE_API_URL=http://localhost:3000

SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_ANON_KEY=eyJ...             # Project API Keys → anon/public
SUPABASE_SERVICE_ROLE_KEY=eyJ...     # Project API Keys → service_role (nunca expor no frontend)
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

## Deploy na Vercel

```bash
# Primeira vez (linka ao projeto)
cd apps/web
npx vercel link --project filipe06-web-3jso --yes

# Deploy de produção (use sempre este comando após alterações)
cd "C:\Users\Filipe\Desktop\Dashboard Gestão"
git add -A
git commit -m "descrição das alterações"
git push origin main
cd apps/web
npx vercel --prod --yes
```

---

## URLs

| Serviço | URL |
|---|---|
| Produção | https://filipe06-web-3jso.vercel.app |
| Frontend local | http://localhost:5173 |
| API local | http://localhost:3000 |
| Health check | http://localhost:3000/health |

---

## Telas disponíveis

| Rota | Descrição |
|---|---|
| `/login` | Autenticação via Supabase Auth |
| `/canvases` | Canvas Operacional — wizard de 9 etapas para mapear um dashboard |
| `/kanban` | Kanban de dashboards com drag-and-drop, WIP limits e rastreabilidade |
| `/formulario` | Registro formal para auditoria com resumo executivo auto-gerado |
| `/configuracoes` | Tema (claro/escuro/automático) e preferências |

---

## Funcionalidades principais

### Canvas Operacional
- Wizard de 9 etapas: Objetivos → Indicadores → Vendas → Despesas → Devoluções → DRE → Alertas → Decisões → Agentes IA
- Título, Responsável e Solicitante definidos em Objetivos e propagados para todas as etapas
- Validação: todas as etapas devem ser preenchidas antes de gerar o briefing
- Pesquisa de dashboards já existentes no Kanban antes de criar um novo
- "Gerar Briefing" cria o card no Kanban e redireciona automaticamente

### Kanban
- 5 colunas padrão (Entrada → Em Análise → Em Desenvolvimento → Em Revisão → Concluído)
- Drag-and-drop com **confirmação de movimentação** — registra a data da etapa automaticamente
- WIP limits por coluna
- Aba "Briefing do Canvas" editável em cada card — documentação completa para auditoria
- Arquivamento de cards concluídos → aparecem no Relatório
- Filtros por prioridade, responsável e busca textual

### Formulário (Auditoria)
- Registro formal de todos os dashboards (ativos + arquivados)
- **Resumo Executivo** auto-gerado a partir dos dados do Canvas, editável e salvo por card
- Timeline visual de rastreabilidade com datas de cada etapa
- Tabela completa do Canvas Operacional (9 seções)
- Exportação/impressão para PDF
- Rodapé com campos de assinatura (Elaborado / Revisado / Aprovado)

---

## Segurança

- RLS ativa em todas as tabelas — usuário só acessa o próprio conteúdo
- `SUPABASE_SERVICE_ROLE_KEY` usada apenas no backend, nunca exposta no frontend
- Payloads validados com Zod em todas as rotas da API
- JWT do Supabase validado em cada requisição

---

## Estrutura de pastas

```
apps/
  api/                              # Backend Node.js + Express
    src/
      lib/supabase-admin.ts         # Clientes Supabase (admin + por usuário)
      middleware/auth.ts            # Validação JWT
      modules/canvas/
        canvas.routes.ts            # Rotas /api/canvases
        items.routes.ts             # Rotas /api/items
        canvas.repository.ts        # Queries no Supabase
        canvas.schemas.ts           # Validação Zod
        default-canvas.ts           # Seed padrão
  web/                              # Frontend React + Vite
    src/
      store/
        kanbanStore.ts              # Estado global dos cards (localStorage)
      contexts/
        AuthContext.tsx             # Sessão Supabase
        ThemeContext.tsx            # Tema claro/escuro/automático
      pages/
        CanvasOperacional.tsx       # Wizard de 9 etapas
        Kanban.tsx                  # Board com drag-and-drop
        Formulario.tsx              # Registro de auditoria
        Configuracoes.tsx           # Preferências e tema
      components/
        Sidebar.tsx                 # Menu lateral com logo CHUÁ
supabase/
  schema.sql                        # Tabelas, RLS e triggers
```

---

## Scripts

```bash
npm run dev        # Roda frontend + backend em paralelo
npm run build      # Build de produção (gera apps/web/dist)
```
