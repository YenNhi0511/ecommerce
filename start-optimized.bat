@echo off
echo ================================================
echo   SYSTEM OPTIMIZATION AND FIX SCRIPT
echo ================================================
echo.

echo [1/5] Killing all Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo [2/5] Cleaning build cache...
if exist ".next" rmdir /s /q ".next"
echo Build cache cleaned.

echo [3/5] Verifying environment variables...
findstr /C:"JWT_SECRET" .env >nul
if %errorlevel% equ 0 (
    echo ✓ JWT_SECRET found
) else (
    echo ✗ JWT_SECRET missing! Please check .env file
    pause
    exit /b 1
)

findstr /C:"MONGODB_URI" .env >nul
if %errorlevel% equ 0 (
    echo ✓ MONGODB_URI found
) else (
    echo ✗ MONGODB_URI missing! Please check .env file
    pause
    exit /b 1
)

echo [4/5] Installing dependencies (if needed)...
if not exist "node_modules" (
    echo Installing packages...
    call npm install
) else (
    echo ✓ Dependencies already installed
)

echo [5/5] Starting servers...
echo.
echo Choose which server to start:
echo   1. Admin (Port 3001) - RECOMMENDED
echo   2. User (Port 3000)
echo   3. Seller (Port 3002)
echo   4. All servers
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" (
    echo Starting Admin server on port 3001...
    start cmd /k "npm run dev:admin"
) else if "%choice%"=="2" (
    echo Starting User server on port 3000...
    start cmd /k "npm run dev:user"
) else if "%choice%"=="3" (
    echo Starting Seller server on port 3002...
    start cmd /k "npm run dev:seller"
) else if "%choice%"=="4" (
    echo Starting all servers...
    start cmd /k "npm run dev:all"
) else (
    echo Invalid choice
    pause
    exit /b 1
)

echo.
echo ================================================
echo   System started successfully!
echo ================================================
echo.
echo Admin URL: http://localhost:3001
echo User URL:  http://localhost:3000
echo Seller URL: http://localhost:3002
echo.
echo Default Admin Credentials:
echo Email: admin@techzone.com
echo Password: admin123
echo.
echo Press any key to exit...
pause >nul
