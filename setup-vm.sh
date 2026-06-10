#!/bin/bash
# =====================================================
# CHUÁ Dashboard — Setup completo da VM
# Execute: bash setup-vm.sh
# =====================================================

set -e

echo "🚀 Iniciando setup da VM CHUÁ Dashboard..."

# =====================================================
# 1. CRIAR SKILL DO CLAUDE CODE
# =====================================================
echo "📁 Criando skill chua-senior-dev..."

mkdir -p /home/srv_app/.claude/skills

cat > /home/srv_app/.claude/skills/chua-senior-dev.md << 'EOF'
---
name: chua-senior-dev
description: Engenheiro sênior full-stack do projeto CHUÁ Dashboard. Trabalha com precisão cirúrgica — analisa antes, altera pouco, testa, explica. Use quando precisar implementar features, corrigir bugs, fazer a migração Supabase→PostgreSQL ou qualquer tarefa técnica no projeto.
---

Você é um engenheiro sênior full-stack trabalhando no projeto CHUÁ Dashboard.

## Seu perfil
- Experiente em React, TypeScript, Node.js, PostgreSQL, Nginx, PM2
- Metódico: nunca age sem entender o impacto
- Econômico: lê apenas o necessário, altera o mínimo suficiente
- Direto: plano curto → executa → confirma

## Protocolo obrigatório

### 1. Antes de qualquer tarefa
- Leia o CLAUDE.md do projeto (está em /var/www/dashboard/CLAUDE.md)
- Use `rg` ou `grep` para localizar arquivos relevantes
- NUNCA abra arquivos inteiros desnecessariamente
- Apresente um plano em 3-5 bullet points antes de executar

### 2. Ao alterar código
- Máximo 3 arquivos por vez
- Edits cirúrgicos — nunca reescreva o arquivo inteiro
- Nunca remova lógica sem confirmar com o usuário
- Após mudanças relevantes, rode `npm run build`

### 3. Ao responder
- Seja direto e curto
- Mostre apenas o diff/trecho alterado, não o arquivo completo
- Se encontrar algo errado fora do escopo, mencione em uma linha no final

## Contexto do projeto

Stack: React 18 + Vite + TypeScript | Node.js + Express | PostgreSQL 17 | Nginx + PM2

Projeto em: /var/www/dashboard

Proibido usar: Supabase, Vercel, RLS, acesso direto ao banco pelo frontend

Auth: bcryptjs + jsonwebtoken
Banco: driver `pg` com pool de conexões
Frontend: fetch com `Authorization: Bearer <token>`

## Formato de resposta

**Plano:**
- bullet 1
- bullet 2

**Execução:**
[código ou comandos]

**Resultado:**
[o que mudou e como testar]
EOF

echo "✅ Skill criada em /home/srv_app/.claude/skills/chua-senior-dev.md"

# =====================================================
# 2. INSTALAR DEPENDÊNCIAS DO SISTEMA
# =====================================================
echo "📦 Instalando dependências do sistema..."

sudo apt update -qq
sudo apt install -y postgresql postgresql-contrib nginx git ripgrep

sudo systemctl enable postgresql nginx
sudo systemctl start postgresql nginx

echo "✅ PostgreSQL e Nginx instalados"

# =====================================================
# 3. CONFIGURAR POSTGRESQL
# =====================================================
echo "🗄️ Configurando PostgreSQL..."

sudo -u postgres psql << 'SQLEOF'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'dashboard_user') THEN
    CREATE USER dashboard_user WITH PASSWORD 'Chua@2026!Secure';
  END IF;
END
$$;
SQLEOF

sudo -u postgres psql -c "CREATE DATABASE dashboard_db OWNER dashboard_user;" 2>/dev/null || echo "Banco já existe, continuando..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE dashboard_db TO dashboard_user;"

echo "✅ PostgreSQL configurado"

# =====================================================
# 4. CLONAR O REPOSITÓRIO
# =====================================================
echo "📥 Clonando repositório..."

sudo mkdir -p /var/www/dashboard
sudo chown srv_app:srv_app /var/www/dashboard

if [ -d "/var/www/dashboard/.git" ]; then
  echo "Repositório já existe, fazendo pull..."
  cd /var/www/dashboard && git pull origin main
else
  git clone https://github.com/infra-afk/Filipe06 /var/www/dashboard
fi

echo "✅ Repositório clonado em /var/www/dashboard"

# =====================================================
# 5. APLICAR SCHEMA NO BANCO
# =====================================================
echo "🗄️ Aplicando schema..."

psql postgresql://dashboard_user:Chua@2026!Secure@localhost:5432/dashboard_db \
  -f /var/www/dashboard/supabase/schema_vm.sql

echo "✅ Schema aplicado"

# =====================================================
# 6. CRIAR ARQUIVOS .env
# =====================================================
echo "⚙️ Criando arquivos .env..."

cat > /var/www/dashboard/apps/api/.env << 'EOF'
PORT=3001
DATABASE_URL=postgresql://dashboard_user:Chua@2026!Secure@localhost:5432/dashboard_db
JWT_SECRET=chua_jwt_secret_2026_ultra_secure_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost
NODE_ENV=production
EOF

cat > /var/www/dashboard/apps/web/.env << 'EOF'
VITE_API_URL=
EOF

echo "✅ Arquivos .env criados"

# =====================================================
# 7. INSTALAR PM2
# =====================================================
echo "⚙️ Instalando PM2..."

npm install -g pm2
pm2 startup | tail -1 | sudo bash

echo "✅ PM2 instalado"

# =====================================================
# 8. CONFIGURAR NGINX
# =====================================================
echo "🌐 Configurando Nginx..."

sudo tee /etc/nginx/sites-available/dashboard << 'EOF'
server {
    listen 80;
    server_name _;

    root /var/www/dashboard/apps/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Authorization $http_authorization;
        proxy_pass_header Authorization;
    }

    location /auth/ {
        proxy_pass http://localhost:3001/auth/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Authorization $http_authorization;
        proxy_pass_header Authorization;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Nginx configurado"

# =====================================================
# RESUMO
# =====================================================
echo ""
echo "============================================"
echo "✅ Setup base concluído!"
echo "============================================"
echo ""
echo "Próximos passos no Claude Code:"
echo "  1. cd /var/www/dashboard"
echo "  2. claude"
echo "  3. Use /chua-senior-dev para iniciar a migração do código"
echo ""
echo "Banco: postgresql://dashboard_user@localhost:5432/dashboard_db"
echo "Projeto: /var/www/dashboard"
echo "============================================"
EOF
