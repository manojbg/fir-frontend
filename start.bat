@echo off
REM Create log directory if it doesn't exist
set "LOG_DIR=D:\Projects\fir-frontend\logs\react"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

REM Format date as YYYY-MM-DD
for /f %%i in ('powershell -Command "Get-Date -Format yyyy-MM-dd"') do set DATE=%%i
set "LOG_FILE=%LOG_DIR%\react-%DATE%.log"

REM Go to project directory
cd /d D:\Projects\fir-frontend

REM Start React app and log output
npm start >> "%LOG_FILE%" 2>&1