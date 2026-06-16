@echo off
chcp 65001 >nul
title CHUA - Parar
echo Parando a aplicacao CHUA...
docker compose stop
echo.
echo Aplicacao parada. Para ligar de novo, rode INSTALAR.bat
echo (os dados continuam salvos).
echo.
pause
