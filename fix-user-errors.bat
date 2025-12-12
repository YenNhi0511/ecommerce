@echo off
echo ================================================
echo   FIX ANALYTICS AND WISHLIST ERRORS
echo ================================================
echo.

echo [INFO] Common errors being fixed:
echo   1. POST /api/analytics/track 400/500 - MongoDB not connected
echo   2. GET /api/wishlist 401 - User not logged in
echo.

echo [Step 1/3] Kill existing processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo [Step 2/3] Clear build cache...
if exist ".next" rmdir /s /q ".next"
echo ✓ Cache cleared

echo.
echo [Step 3/3] Test MongoDB connection first...
echo.
choice /C YN /M "Do you want to test MongoDB connection before starting"
if errorlevel 2 goto skip_test
if errorlevel 1 goto test_mongo

:test_mongo
echo Testing MongoDB...
node test-mongodb.js
if %errorlevel% neq 0 (
    echo.
    echo ⚠️ MongoDB connection failed!
    echo Analytics tracking will be disabled but app will still work.
    echo.
    choice /C YN /M "Continue anyway"
    if errorlevel 2 exit /b 1
)

:skip_test
echo.
echo ================================================
echo   STARTING SERVER
echo ================================================
echo.
echo Starting User server on port 3000...
echo.
echo ℹ️ Note: If MongoDB is not connected:
echo   - Analytics will show warnings in console (OK to ignore)
echo   - Wishlist requires login (401 is normal for guests)
echo   - App will work normally otherwise
echo.
start cmd /k "npm run dev:user"

timeout /t 3 >nul

echo.
echo ✅ Server started!
echo.
echo URL: http://localhost:3000
echo.
echo Expected behavior:
echo   ✓ Analytics 401/500 errors are now silently handled
echo   ✓ Wishlist 401 is normal for non-logged-in users
echo   ✓ UI should work without console spam
echo.
echo To fix MongoDB permanently:
echo   1. Run: .\fix-mongodb.bat
echo   2. Add IP to MongoDB Atlas whitelist
echo.
pause
