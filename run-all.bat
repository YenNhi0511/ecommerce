@echo off
REM Script to run all 3 instances of Next.js
REM User: 3000, Admin: 3001, Seller: 3002

echo Starting TechZone E-Commerce with 3 instances...
echo.
echo [1] User (localhost:3000)
echo [2] Admin (localhost:3001)
echo [3] Seller (localhost:3002)
echo.
echo Starting... This will open 3 terminal windows
echo.

REM Start 3 instances in separate terminal windows
start "TechZone - User (3000)" cmd /k "cd %CD% && npm run dev:user"
timeout /t 2 /nobreak
start "TechZone - Admin (3001)" cmd /k "cd %CD% && npm run dev:admin"
timeout /t 2 /nobreak
start "TechZone - Seller (3002)" cmd /k "cd %CD% && npm run dev:seller"

echo.
echo All instances started! Check the terminal windows above.
echo.
pause
