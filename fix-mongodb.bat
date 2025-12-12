@echo off
echo ================================================
echo   MONGODB CONNECTION DIAGNOSTIC
echo ================================================
echo.

echo [Step 1/4] Testing MongoDB Connection...
node test-mongodb.js
if %errorlevel% equ 0 (
    echo.
    echo ✅ MongoDB is working! No fix needed.
    echo.
    pause
    exit /b 0
)

echo.
echo ❌ MongoDB Connection Failed!
echo.
echo [Step 2/4] Checking Internet Connection...
ping -n 1 8.8.8.8 >nul
if %errorlevel% neq 0 (
    echo ❌ No internet connection detected
    echo Please check your network and try again
    pause
    exit /b 1
)
echo ✅ Internet connection OK

echo.
echo [Step 3/4] Opening MongoDB Atlas...
echo Please follow these steps:
echo.
echo 1. Login to: https://cloud.mongodb.com
echo 2. Select your project
echo 3. Go to: Network Access (left sidebar)
echo 4. Click: "Add IP Address"
echo 5. Click: "Allow Access from Anywhere"
echo 6. Confirm: Add 0.0.0.0/0
echo 7. Wait 1-2 minutes for changes to apply
echo.
start https://cloud.mongodb.com/v2#/org/675b8f1c43e06e4aa8b7f6ba/projects

echo.
set /p ready="Press ENTER after you've added IP whitelist... "

echo.
echo [Step 4/4] Testing connection again...
node test-mongodb.js
if %errorlevel% equ 0 (
    echo.
    echo ================================================
    echo   ✅ MONGODB IS NOW WORKING!
    echo ================================================
    echo.
    echo You can now start your server:
    echo   npm run dev:admin
    echo.
) else (
    echo.
    echo ================================================
    echo   ❌ STILL NOT WORKING
    echo ================================================
    echo.
    echo Additional steps to try:
    echo 1. Check if cluster is paused (resume it)
    echo 2. Verify username/password in .env
    echo 3. Create new database user
    echo 4. Wait 5 minutes and try again
    echo.
    echo Need help? Check: doc\MONGODB_TROUBLESHOOTING.md
    echo.
)

pause
