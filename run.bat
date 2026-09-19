@echo off
title Aetheris AI 3.0 Launcher
color 0b
echo =======================================================
echo          AETHERIS AI 3.0 - MULTILINGUAL STUDIO
echo =======================================================
echo.
echo Starting Express Backend on ports 5000 and 8000...
start "Aetheris Backend" cmd /k "node server/server.js"

echo Starting Vite Frontend on port 5173...
start "Aetheris Frontend" cmd /k "cd client && npm run dev -- --host 0.0.0.0"

echo Starting Cloudflare Mobile Tunnel...
start "Aetheris Mobile Tunnel" cmd /k "C:\Users\bejaw\cloudflared.exe tunnel --url http://localhost:5173"

echo.
echo =======================================================
echo All services launched!
echo Local Web:    http://localhost:5173
echo Mobile Wi-Fi: http://172.16.4.96:5173
echo =======================================================
pause
