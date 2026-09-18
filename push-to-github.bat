@echo off
echo ==========================================
echo Aetheris AI - Push to GitHub Helper
echo ==========================================
echo Make sure you first created the repository at https://github.com/new
echo.
set /p USERNAME="Enter your GitHub username: "
set /p REPONAME="Enter repository name [press Enter for aetheris-ai]: "
if "%REPONAME%"=="" set REPONAME=aetheris-ai

git remote remove origin 2>nul
git remote add origin https://github.com/%USERNAME%/%REPONAME%.git
git branch -M main
git push -u origin main
pause
