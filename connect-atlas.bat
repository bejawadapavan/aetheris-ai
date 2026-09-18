@echo off
title Connect MongoDB Atlas - Aetheris AI
color 0b
echo =======================================================
echo     Aetheris AI - MongoDB Atlas Cloud Connection
echo =======================================================
echo.
echo Please paste your MongoDB Atlas connection string:
echo (e.g. mongodb+srv://username:password@cluster0.abcde.mongodb.net/aetheris_db?retryWrites=true^&w=majority)
echo.
set /p ATLAS_URI="Enter Atlas URI: "
if "%ATLAS_URI%"=="" (
    echo No URI provided. Exiting...
    pause
    exit /b
)

node server\scripts\connect-atlas.js "%ATLAS_URI%"
pause
