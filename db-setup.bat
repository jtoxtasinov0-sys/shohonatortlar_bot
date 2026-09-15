@echo off
chcp 65001 >nul
title Shohona Tortlar - bazani tayyorlash
echo.
echo ═══════════════════════════════════════════
echo   BAZANI TAYYORLASH (Neon + Prisma)
echo ═══════════════════════════════════════════
echo.

cd /d "%~dp0backend"

echo [1/3] Prisma client yaratilmoqda...
call npx prisma generate
if errorlevel 1 goto error

echo.
echo [2/3] Jadvallar yaratilmoqda...
call npx prisma migrate dev --name init
if errorlevel 1 goto error

echo.
echo [3/3] Boshlang'ich mahsulotlar qo'shilmoqda...
call npm run db:seed
if errorlevel 1 goto error

echo.
echo ═══════════════════════════════════════════
echo   BAZA TAYYOR! Endi start.bat ni bosing.
echo ═══════════════════════════════════════════
pause
exit /b 0

:error
echo.
echo XATOLIK. backend\.env dagi DATABASE_URL to'g'riligini tekshiring.
pause
exit /b 1
