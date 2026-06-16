#!/usr/bin/env bash
# CHUÁ — Instalação (Linux/macOS)
set -e

echo "============================================"
echo "   CHUÁ - Solicitações de Dashboard"
echo "   Instalação (Linux)"
echo "============================================"
echo

if ! command -v docker >/dev/null 2>&1; then
  echo "[ERRO] Docker não encontrado."
  echo "Instale o Docker: https://docs.docker.com/engine/install/"
  exit 1
fi

# Usa "docker compose" (v2) ou "docker-compose" (v1), o que existir
if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DC="docker-compose"
else
  echo "[ERRO] Plugin 'docker compose' não encontrado."
  exit 1
fi

echo "Subindo a aplicação... (a 1ª vez pode demorar alguns minutos)"
echo
$DC up -d --build

echo
echo "============================================"
echo "   PRONTO!"
echo
echo "   Abra no navegador:  http://localhost:8080"
echo "   Login: adm@chua.local"
echo "   Senha: admin123"
echo "============================================"
echo
echo "Para PARAR:  $DC stop"
