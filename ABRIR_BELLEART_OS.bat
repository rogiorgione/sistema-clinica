@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo [ERRO] Node.js nao foi encontrado.
  echo Instale o Node.js 18 ou superior e execute este arquivo novamente.
  pause
  exit /b 1
)

if not exist "backend\node_modules" (
  echo Instalando dependencias do backend...
  call npm install --prefix backend
  if errorlevel 1 goto :install_error
)

if not exist "frontend\node_modules" (
  echo Instalando dependencias do frontend...
  call npm install --prefix frontend
  if errorlevel 1 goto :install_error
)

echo Iniciando a API do BELLEART OS...
start "BELLEART OS - Backend" cmd /k "cd /d ""%~dp0backend"" && npm start"

echo Iniciando o frontend do BELLEART OS...
start "BELLEART OS - Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo Abrindo o navegador...
timeout /t 4 /nobreak >nul
start "" "http://localhost:5173"
exit /b 0

:install_error
echo.
echo [ERRO] Nao foi possivel instalar as dependencias.
pause
exit /b 1
