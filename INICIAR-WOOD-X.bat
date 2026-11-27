@echo off
title WOOD-X // Zero-Waste Parametric Studio Server
cd /d "%~dp0"
echo ============================================================
echo   WOOD-X // 100%% ZERO-WASTE PARAMETRIC FURNITURE STUDIO
echo   Iniciando servidor local en: http://localhost:8080/?v=13
echo ============================================================
echo.
start "" "http://localhost:8080/?v=13"
python -m http.server 8080
pause
