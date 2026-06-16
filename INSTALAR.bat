@echo off
chcp 65001 >nul
title CHUA - Instalacao
echo ============================================
echo    CHUA - Solicitacoes de Dashboard
echo    Instalacao (Windows)
echo ============================================
echo.

where docker >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Docker nao encontrado.
  echo.
  echo Instale o Docker Desktop ^(instalador next-next^):
  echo    https://www.docker.com/products/docker-desktop/
  echo.
  echo Depois de instalar e ABRIR o Docker Desktop, rode este arquivo de novo.
  echo.
  pause
  exit /b 1
)

echo Subindo a aplicacao... ^(a 1a vez baixa imagens e pode demorar alguns minutos^)
echo.
docker compose up -d --build
if errorlevel 1 (
  echo.
  echo [ERRO] Falha ao subir. Verifique se o Docker Desktop esta ABERTO e tente de novo.
  echo.
  pause
  exit /b 1
)

echo.
echo ============================================
echo    PRONTO!
echo.
echo    Abra no navegador:  http://localhost:8080
echo    Login: adm@chua.local
echo    Senha: admin123
echo ============================================
echo.
echo Dica: para PARAR, rode PARAR.bat
echo.
pause
