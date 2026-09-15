@echo off
chcp 65001 >nul
title Shohona Tortlar - ishga tushirish

echo.
echo  🍰 Shohona Tortlar ishga tushmoqda...
echo.
echo   Backend    : http://localhost:5000
echo   Mini App   : http://localhost:5173
echo   Admin Panel: http://localhost:5174
echo.

start "SHT Backend"  cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 >nul
start "SHT Mini App" cmd /k "cd /d %~dp0miniapp && npm run dev"
start "SHT Admin"    cmd /k "cd /d %~dp0admin && npm run dev"

echo  3 ta oyna ochildi. Yopish uchun har birida Ctrl+C bosing.
timeout /t 5 >nul
