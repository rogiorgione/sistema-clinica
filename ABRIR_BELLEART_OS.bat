@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ========================================
echo  BELLEART OS - inicializacao segura
echo ========================================

where node >nul 2>&1
if errorlevel 1 (
  echo [ERRO] Node.js nao foi encontrado. Instale Node.js 18 ou superior.
  pause
  exit /b 1
)

for %%D in (backend frontend) do (
  if not exist "%%D\node_modules" (
    echo [INFO] Instalando dependencias de %%D...
    call npm install --prefix %%D
    if errorlevel 1 goto :install_error
  )
)

echo [INFO] Liberando portas antigas 3001 e 5173 quando necessario...
for %%P in (3001 5173) do (
  for /f "tokens=5" %%A in ('netstat -ano ^| findstr /R /C:":%%P .*LISTENING"') do (
    echo [INFO] Encerrando processo %%A na porta %%P...
    taskkill /PID %%A /F >nul 2>&1
  )
)

echo [INFO] Iniciando backend em http://localhost:3001/api ...
start "BELLEART OS - Backend" /min cmd /k "cd /d ""%~dp0backend"" && npm start"

echo [INFO] Aguardando backend responder...
timeout /t 3 /nobreak >nul

echo [INFO] Iniciando frontend em http://localhost:5173 ...
start "BELLEART OS - Frontend" /min cmd /k "cd /d ""%~dp0frontend"" && npm run dev -- --host 0.0.0.0"

echo [INFO] Abrindo uma janela do navegador...
timeout /t 4 /nobreak >nul
start "" "http://localhost:5173"

echo [OK] BELLEART OS iniciado. Feche as janelas Backend/Frontend para encerrar.
exit /b 0

:install_error
echo [ERRO] Nao foi possivel instalar as dependencias.
pause
exit /b 1
