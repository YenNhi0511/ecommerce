@echo off
echo ================================================
echo   FIX FUNNEL DISPLAY ISSUES
echo ================================================
echo.

echo [INFO] Issues fixed:
echo   1. Drop-off showing at wrong position
echo   2. Percentage 0%% with actual users
echo   3. Product Views = 0 but 100%%
echo   4. Wrong conversion rate calculations
echo.

echo [Step 1/3] Clear cache...
if exist ".next" rmdir /s /q ".next"
echo ✓ Cache cleared

echo.
echo [Step 2/3] Check MongoDB connection...
node test-mongodb.js
if %errorlevel% neq 0 (
    echo.
    echo ⚠️ MongoDB not connected!
    echo Funnel will show zeros. Please fix MongoDB first.
    echo.
    choice /C YN /M "Continue anyway"
    if errorlevel 2 exit /b 1
)

echo.
echo [Step 3/3] Starting admin server...
start cmd /k "npm run dev:admin"

timeout /t 3 >nul

echo.
echo ✅ Server started!
echo.
echo URL: http://localhost:3001/admin/analytics
echo.
echo What was fixed:
echo ✓ Drop-off now shows ONLY between stages (not after last stage)
echo ✓ Drop-off includes percentage
echo ✓ Percentage calculated correctly (users/first_stage * 100)
echo ✓ Drop-off calculated per stage (current - next)
echo ✓ Number display only if count ^> 0
echo.
echo Expected funnel (if data exists):
echo   Product Views: X users (100%%)
echo   ⚠️ Drop-off: Y users (Z%%)
echo   Add to Cart: A users (B%%)
echo   ⚠️ Drop-off: C users (D%%)
echo   Checkout: E users (F%%)
echo   ⚠️ Drop-off: G users (H%%)
echo   Order Complete: I users (J%%)
echo   (No drop-off here)
echo.
pause
