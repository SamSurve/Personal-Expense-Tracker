@echo off
setlocal

echo =========================================
echo Personal Expense Tracker - Startup Script
echo =========================================

cd /d "%~dp0"

if not exist "backend\lib" (
    mkdir "backend\lib"
)
if not exist "backend\bin" (
    mkdir "backend\bin"
)

:: Check for MySQL Connector JAR
set JAR_FOUND=0
for %%i in (backend\lib\mysql-connector*.jar) do (
    set JAR_FOUND=1
)

if %JAR_FOUND%==0 (
    echo [ERROR] MySQL Connector JAR not found in backend\lib\
    echo Please download mysql-connector-j-8.x.x.jar and place it in the backend\lib directory.
    echo See RUN_INSTRUCTIONS.md for details.
    pause
    exit /b 1
)

:: Check if MySQL port 3306 is listening; if not, launch mysqld
netstat -ano | findstr :3306 >nul 2>&1
if %errorlevel% neq 0 (
    if exist "E:\mariadb-10.6.16-winx64\bin\mysqld.exe" (
        echo [0/3] Starting MySQL Database Server on port 3306...
        start "MySQL Server" /B "E:\mariadb-10.6.16-winx64\bin\mysqld.exe" --datadir="E:\mariadb-10.6.16-winx64\data" --port=3306
        timeout /t 3 /nobreak >nul
    )
)

echo.
echo [1/3] Compiling Java Backend...
dir /s /B backend\src\*.java > sources.txt
javac -cp "backend\lib\*" -d backend\bin @sources.txt
if %errorlevel% neq 0 (
    echo [ERROR] Java compilation failed!
    del sources.txt
    pause
    exit /b %errorlevel%
)
del sources.txt
echo Compilation successful.

echo.
echo [2/3] Starting Java Backend API on port 8080...
:: Start Java server in a new window so it runs in the background
start "Expense Tracker API" cmd /c "java -cp "backend\bin;backend\lib\*" com.expensetracker.api.HttpServerApp & pause"
echo Backend started in a separate window.

echo.
echo [3/3] Starting Next.js Frontend...
if not exist "node_modules" (
    echo Installing npm dependencies...
    npm install
)
npm run dev
