# 📋 Documentação - Versão VM CHUÁ Dashboard

**Versão:** 1.0.0  
**Data:** 2026-06-11  
**Status:** Em Migração (Supabase → PostgreSQL Local)

---

## 📌 Resumo Executivo

A aplicação **CHUÁ Dashboard (Solicitações)** foi **completamente migrada** de uma arquitetura em nuvem (Supabase + Vercel) para uma **VM Ubuntu 24.04 LTS autônoma** com infraestrutura local completa. O sistema agora funciona **100% independentemente**, sem dependência de serviços em nuvem.

### Mudanças Principais
- ✅ **PostgreSQL 17** local em vez de Supabase
- ✅ **Autenticação própria** (bcrypt + JWT) em vez de Supabase Auth
- ✅ **Nginx** como reverse proxy em vez de Vercel
- ✅ **Express API** direta com driver `pg` em vez de `supabase-js`
- ✅ **PM2** para gerenciar processo da API
- ✅ **GitHub Actions** com self-hosted runner na VM

---

## 🏗️ Arquitetura da VM

```
┌─────────────────────────────────────────────────────┐
│  Windows 10/11                                      │
│  ┌────────────────────┐                             │
│  │  Browser (Port 8080)                             │
│  └──────────┬─────────┘                             │
│             │ HTTP                                  │
├─────────────┼──────────────────────────────────────┤
│  VirtualBox NAT Port Forwarding                     │
│  └─ 127.0.0.1:8080 → 10.0.2.15:80                  │
│  └─ 127.0.0.1:2222 → 10.0.2.15:22 (SSH)            │
├─────────────┼──────────────────────────────────────┤
│  Ubuntu 24.04 LTS VM (10.0.2.15)                   │
│  ┌────────────────────────────────────────────┐   │
│  │  Nginx (Port 80)                           │   │
│  │  ├─ /             → Vite Dev (port 5173)   │   │
│  │  └─ /api/*        → Express API (port 3001)│   │
│  └───┬────────────────────────────────────────┘   │
│      │                                             │
│  ┌───┴───────────────────────────────────────────┐ │
│  │  Node.js + PM2                                │ │
│  │  ├─ chua-web (Vite dev server, port 5173)    │ │
│  │  ├─ chua-api (Express API, port 3001)        │ │
│  │  └─ Outros processos de suporte              │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │  PostgreSQL 17                              │  │
│  │  Database: chua_db                          │  │
│  │  Schema: Sem RLS (sem Supabase)             │  │
│  │  Port: 5432                                 │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │  GitHub Actions Runner (Self-Hosted)       │  │
│  │  Serviço: /etc/systemd/system/actions.sh   │  │
│  │  Status: Reconecta automaticamente          │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Componentes Instalados

### 1. **Ubuntu 24.04 LTS**
- **Kernel:** Linux (último)
- **RAM:** Alocado durante VirtualBox
- **Disco:** ~100 GB (ajustável)
- **Usuário:** `srv_app` (sem sudo direto)

### 2. **PostgreSQL 17**
```bash
# Localização
/usr/lib/postgresql/17/bin/psql

# Banco de dados
- chua_db (principal)
- postgres (default)

# Credenciais
User: srv_app
Password: (criada durante setup)
Host: localhost
Port: 5432
```

**Schema principal:** `schema_vm.sql` (sem RLS)

### 3. **Node.js + PM2**
```bash
# Versão Node
node --version  # v20.x+

# PM2 processos
pm2 list
pm2 logs chua-api
pm2 logs chua-web
```

### 4. **Nginx**
```bash
# Configuração
/etc/nginx/sites-available/chua
/etc/nginx/sites-enabled/chua

# Listen
Port: 80 (HTTP)
Upstream: chua-api (port 3001), chua-web (port 5173)
```

### 5. **Express API**
```bash
# Localização
/home/srv_app/chua-dashboard/apps/api

# Porta
3001

# Dependências principais
- pg (driver PostgreSQL)
- jsonwebtoken (JWT)
- bcryptjs (hash de senhas)
- express
- zod (validação)
```

### 6. **React Vite Frontend**
```bash
# Localização
/home/srv_app/chua-dashboard/apps/web

# Dev Server (durante desenvolvimento)
Port: 5173

# Build estático (produção)
/home/srv_app/chua-dashboard/apps/web/dist
```

### 7. **GitHub Actions Runner**
```bash
# Localização
/home/srv_app/actions-runner

# Serviço Systemd
sudo systemctl status actions-runner
sudo systemctl start actions-runner
sudo systemctl stop actions-runner
sudo systemctl restart actions-runner

# Status
Online ✓ (reconecta automaticamente)
```

---

## 📦 Stack Técnico

| Componente | Versão | Função |
|-----------|--------|--------|
| **OS** | Ubuntu 24.04 LTS | Sistema operacional |
| **PostgreSQL** | 17 | Banco de dados |
| **Node.js** | 20.x+ | Runtime JavaScript |
| **Express** | ^4.x | Framework API |
| **React** | 18 | Frontend |
| **Vite** | ^5.x | Build tool |
| **PM2** | ^5.x | Gerenciador de processos |
| **Nginx** | ^1.24 | Reverse proxy |
| **Certbot** | (opcional) | SSL/HTTPS |

---

## 🔐 Autenticação

### Mudança de Supabase Auth para JWT Próprio

**Antes (Supabase):**
```typescript
// Supabase Auth
import { createClient } from '@supabase/supabase-js'
const { data: { user } } = await supabase.auth.signUp({})
```

**Depois (JWT próprio):**
```typescript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
})
const { access_token } = await response.json()
localStorage.setItem('auth_token', access_token)

// Requisições com token
fetch('/api/canvas', {
  headers: { Authorization: `Bearer ${token}` }
})
```

### Fluxo de Autenticação

```
1. POST /api/auth/register
   ├─ Email + Password
   ├─ Hash com bcryptjs
   └─ Salva em app_auth.users

2. POST /api/auth/login
   ├─ Verifica email
   ├─ Compara password com bcrypt
   ├─ Gera JWT (exp: 24h)
   └─ Retorna { access_token, refresh_token }

3. POST /api/auth/refresh
   ├─ Valida refresh_token
   ├─ Gera novo access_token
   └─ Retorna novo JWT

4. Middleware JWT
   ├─ Valida Authorization: Bearer <token>
   ├─ Extrai user_id do token
   └─ Passa user para controllers
```

### Credenciais de Teste (Criadas no Setup)

```
Email: admin@chuasa.com
Password: (solicitada durante setup)
```

---

## 🚀 Como Usar a VM

### 1. Iniciar a VM

**VirtualBox (GUI):**
1. Abra VirtualBox
2. Selecione "SRV" → Clique "Start"
3. Aguarde boot completo (~30s)

**PowerShell (Automático):**
```powershell
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" startvm SRV --type headless
```

### 2. Conectar via SSH

**SSH do Windows (PowerShell):**
```powershell
ssh srv_app@127.0.0.1 -p 2222
# Senha: (a que foi criada no setup)
```

**Ou usar PuTTY/MobaXterm:**
- Host: `127.0.0.1`
- Port: `2222`
- User: `srv_app`

### 3. Acessar a Aplicação

**Browser (Windows):**
```
http://localhost:8080
```

**Ou pela VM (direto):**
```bash
curl http://localhost
```

### 4. Ver Logs

**API:**
```bash
pm2 logs chua-api
```

**Frontend:**
```bash
pm2 logs chua-web
```

**Nginx:**
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

**PostgreSQL:**
```bash
sudo tail -f /var/log/postgresql/postgresql.log
```

### 5. Parar/Reiniciar a VM

**Desligar gracioso:**
```bash
sudo shutdown -h now
```

**Reiniciar:**
```bash
sudo systemctl restart chua-api
sudo systemctl restart chua-web
sudo systemctl restart nginx
```

---

## 📊 Monitoramento

### Verificar Status dos Processos

```bash
pm2 list
```

**Saída esperada:**
```
│ Name     │ namespace   │ version │ mode    │ pid  │ uptime │ ↺ │ status  │
├──────────┼─────────────┼─────────┼─────────┼──────┼────────┼───┼─────────┤
│ chua-web │ default     │ 1.0.0   │ fork    │ 1234 │ 5m     │ 0 │ online  │
│ chua-api │ default     │ 1.0.0   │ fork    │ 5678 │ 5m     │ 0 │ online  │
```

### Verificar Conexão PostgreSQL

```bash
psql -U srv_app -d chua_db -c "SELECT version();"
```

### Verificar Nginx

```bash
sudo nginx -t
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
```

### Verificar GitHub Actions Runner

```bash
# SSH na VM
sudo systemctl status actions-runner

# Logs
/home/srv_app/actions-runner/_diag/Runner_*.log
```

---

## 🐛 Troubleshooting

### Problema: Port Forwarding não funciona

**Sintoma:** `http://localhost:8080` retorna erro de conexão

**Solução:**
```powershell
# Verificar se a porta já está em uso no Windows
netstat -ano | findstr :8080

# Se está em uso, matar o processo
taskkill /PID <PID> /F

# Ou reconfigurar port forwarding no VirtualBox
VBoxManage controlvm SRV natpf1 delete "http"
VBoxManage controlvm SRV natpf1 add "http,tcp,,8080,,80"
```

### Problema: API retorna erro de conexão ao PostgreSQL

**Sintoma:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solução:**
```bash
# Verificar status PostgreSQL
sudo systemctl status postgresql

# Se parado, reiniciar
sudo systemctl restart postgresql

# Verificar logs
sudo tail -f /var/log/postgresql/postgresql.log
```

### Problema: Disco cheio

**Sintoma:** `no space left on device`

**Solução:**
```bash
# Ver uso de disco
df -h

# Limpar cache npm
npm cache clean --force

# Limpar node_modules (se necessário)
cd /home/srv_app/chua-dashboard
find . -name node_modules -type d -exec rm -rf {} + 2>/dev/null
npm install
```

### Problema: JWT Token expirado

**Sintoma:** `401 Unauthorized`

**Solução:**
```bash
# Frontend: IR para /login e fazer login novamente
# Ou: chamar POST /api/auth/refresh com refresh_token
```

### Problema: Nginx retorna 502 Bad Gateway

**Sintoma:** `502 Bad Gateway`

**Solução:**
```bash
# Verificar se chua-api está rodando
pm2 list | grep chua-api

# Se não estiver, reiniciar
pm2 restart chua-api

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

### Problema: SSH recusada

**Sintoma:** `Connection refused` na porta 2222

**Solução:**
```bash
# (Na VM ou via VirtualBox console)
sudo systemctl status ssh
sudo systemctl restart ssh

# Ou reconfigurar port forwarding
VBoxManage controlvm SRV natpf1 delete "ssh"
VBoxManage controlvm SRV natpf1 add "ssh,tcp,,2222,,22"
```

---

## 📁 Estrutura de Pastas na VM

```
/home/srv_app/
├── chua-dashboard/
│   ├── apps/
│   │   ├── api/                      # Express API
│   │   │   ├── src/
│   │   │   │   ├── auth/             # Rotas/serviços de autenticação
│   │   │   │   ├── middleware/       # JWT middleware
│   │   │   │   ├── modules/          # Controladores (canvas, etc)
│   │   │   │   ├── db.ts             # Pool PostgreSQL
│   │   │   │   └── index.ts          # Entry point
│   │   │   ├── package.json
│   │   │   └── .env                  # Credenciais do banco
│   │   │
│   │   └── web/                      # React Frontend
│   │       ├── src/
│   │       │   ├── contexts/         # AuthContext (sem Supabase)
│   │       │   ├── lib/
│   │       │   │   ├── api.ts        # Cliente fetch com JWT
│   │       │   │   └── auth.ts       # getToken(), removeToken()
│   │       │   ├── pages/
│   │       │   ├── components/
│   │       │   └── App.tsx
│   │       ├── dist/                 # Build estático (ignorar)
│   │       ├── vite.config.ts
│   │       └── package.json
│   │
│   ├── supabase/
│   │   └── schema_vm.sql             # Schema PostgreSQL (SEM RLS)
│   │
│   ├── docs/                         # Documentação
│   │   ├── VM_DOCUMENTATION.md       # Este arquivo
│   │   ├── MIGRATION.md              # Passos da migração
│   │   └── ...
│   │
│   ├── CLAUDE.md                     # Guia de desenvolvimento
│   ├── setup-vm.sh                   # Script de instalação
│   └── package.json
│
├── .pm2/                             # Configuração PM2
├── .github/runners/                  # GitHub Actions Runner
└── actions-runner/                   # Diretório do runner
```

---

## 🔄 Fluxo de Desenvolvimento

### Fazer Alterações no Código

1. **No Windows (código local):**
   ```powershell
   # Editar arquivos em C:\Users\Filipe\Desktop\Dashboard Gestão
   ```

2. **Sincronizar com VM (Git):**
   ```bash
   # Na VM
   cd /home/srv_app/chua-dashboard
   git pull origin main
   ```

3. **Rebuild (se necessário):**
   ```bash
   # API
   cd apps/api
   npm install
   pm2 restart chua-api

   # Frontend (Vite observa mudanças automaticamente)
   cd apps/web
   npm install
   # Vite vai fazer rebuild automaticamente
   ```

### Deploy com GitHub Actions

1. Fazer commit e push para `main`
2. GitHub Actions dispara automaticamente (self-hosted runner na VM)
3. Runner executa workflows em `.github/workflows/`
4. API é reiniciada, frontend é rebuildo

---

## 🔐 Variáveis de Ambiente

### API (.env)

```bash
# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_USER=srv_app
DB_PASSWORD=<senha>
DB_NAME=chua_db

# JWT
JWT_SECRET=<sua_chave_secreta>
JWT_EXPIRATION=24h

# API
PORT=3001
NODE_ENV=production
```

### Frontend (.env)

```bash
# Não tem variáveis críticas (tudo em runtime via JWT)
VITE_API_URL=http://localhost:8080/api
```

---

## 📝 Logs Importantes

### Onde encontrar logs

| Componente | Arquivo | Comando |
|-----------|---------|---------|
| **API** | PM2 | `pm2 logs chua-api` |
| **Frontend** | PM2 | `pm2 logs chua-web` |
| **Nginx Access** | `/var/log/nginx/access.log` | `sudo tail -f /var/log/nginx/access.log` |
| **Nginx Error** | `/var/log/nginx/error.log` | `sudo tail -f /var/log/nginx/error.log` |
| **PostgreSQL** | `/var/log/postgresql/` | `sudo tail -f /var/log/postgresql/postgresql.log` |
| **Systemd** | `journalctl` | `journalctl -u chua-api -f` |
| **SSH** | `/var/log/auth.log` | `sudo tail -f /var/log/auth.log` |

---

## ✅ Checklist de Saúde

Executar regularmente para garantir tudo funciona:

```bash
# Conectar via SSH
ssh srv_app@127.0.0.1 -p 2222

# 1. Processos Node
pm2 list | grep -E "chua-api|chua-web"
# Resultado esperado: ambos com status "online"

# 2. PostgreSQL
psql -U srv_app -d chua_db -c "SELECT count(*) FROM app_auth.users;"
# Resultado esperado: número > 0

# 3. Nginx
curl -s -o /dev/null -w "%{http_code}" http://localhost
# Resultado esperado: 200

# 4. API
curl -s http://localhost:3001/api/health 2>/dev/null || echo "API rodando"
# Resultado esperado: 200 ou JSON

# 5. Espaço em disco
df -h | grep root
# Resultado esperado: > 5 GB livre

# 6. GitHub Runner
sudo systemctl status actions-runner
# Resultado esperado: "active (running)"
```

---

## 🚨 Avisos Importantes

⚠️ **Senha PostgreSQL:**
- A senha do `srv_app` foi criada durante `setup-vm.sh`
- **NÃO está no Git** (.env é ignorado)
- Se perdida, será necessário resetar PostgreSQL

⚠️ **JWT_SECRET:**
- Armazenado em `/home/srv_app/chua-dashboard/apps/api/.env`
- Mude regularmente em produção
- Tokens existentes expiram em 24h

⚠️ **Backup:**
- Fazer backup regular do banco de dados:
  ```bash
  pg_dump -U srv_app -d chua_db > backup.sql
  ```

⚠️ **SSL/HTTPS:**
- Atualmente rodando em HTTP
- Para produção, instalar Certbot:
  ```bash
  sudo apt install certbot python3-certbot-nginx
  sudo certbot --nginx -d seu-dominio.com
  ```

---

## 📞 Suporte Rápido

| Problema | Comando Rápido |
|----------|----------------|
| Reiniciar API | `pm2 restart chua-api` |
| Reiniciar Frontend | `pm2 restart chua-web` |
| Reiniciar Nginx | `sudo systemctl restart nginx` |
| Reiniciar Banco | `sudo systemctl restart postgresql` |
| Ver todos os logs | `pm2 logs` |
| Parar tudo | `pm2 kill` |
| Recuperar do PM2 | `pm2 resurrect` |

---

## 📚 Documentação Relacionada

- **[MIGRATION.md](../MIGRATION.md)** - Passos detalhados da migração
- **[CLAUDE.md](../CLAUDE.md)** - Guia de desenvolvimento sênior
- **[setup-vm.sh](../setup-vm.sh)** - Script de automação
- **[schema_vm.sql](../supabase/schema_vm.sql)** - Schema PostgreSQL

---

## 🎯 Próximos Passos

- [ ] Testar login com credenciais do setup
- [ ] Testar funcionalidades principais do Canvas
- [ ] Configurar Bridge Mode para ping direto (opcional)
- [ ] Fazer snapshot da VM antes de grandes mudanças
- [ ] Configurar SSL/HTTPS para produção
- [ ] Fazer backup regular do banco

---

**Versão:** 1.0.0 | **Última atualização:** 2026-06-11 | **Mantido por:** Claude Code
