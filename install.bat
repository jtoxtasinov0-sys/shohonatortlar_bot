@echo off
chcp 65001 >nul
title Shohona Tortlar - paketlarni o'rnatish
echo.
echo ═══════════════════════════════════════════
echo   SHOHONA TORTLAR - paketlarni o'rnatish
echo ═══════════════════════════════════════════
echo.

echo [1/3] Backend...
cd /d "%~dp0backend"
call npm install
if errorlevel 1 goto error

echo.
echo [2/3] Mini App...
cd /d "%~dp0miniapp"
call npm install
if errorlevel 1 goto error

echo.
echo [3/3] Admin Panel...
cd /d "%~dp0admin"
call npm install
if errorlevel 1 goto error

echo.
echo ═══════════════════════════════════════════
echo   TAYYOR! Endi backend/.env faylini
echo   to'ldiring va db-setup.bat ni ishga tushiring.
echo ═══════════════════════════════════════════
pause
exit /b 0

:error
echo.
echo XATOLIK yuz berdi. Node.js o'rnatilganini tekshiring.
pause
exit /b 1
