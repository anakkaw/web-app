@echo off
echo [1/4] Initializing Git repository...
git init

echo [2/4] Adding files...
git add .

echo [3/4] Committing changes...
git commit -m "Initial commit: Multi-agency project budget system"

echo [4/4] Connecting to GitHub and pushing...
git remote add origin https://github.com/anakkaw/project-budget.git
git branch -M main
git push -u origin main

echo.
echo Process complete! Please check your GitHub repository.
pause
