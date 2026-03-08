@echo off
echo ===================================================
echo 🚀 Starting SmartCrew Development Environment...
echo ===================================================
echo.
echo Starting Backend API...
start "SmartCrew Backend" cmd /c "cd backend && npm run dev"

echo Starting Admin Web Dashboard (React)...
start "SmartCrew Frontend" cmd /c "cd frontend && npm run dev"

echo Starting Mobile App Expo Server...
start "SmartCrew Mobile App" cmd /k "cd mobile && npx expo start -c"

echo.
echo ✅ Services are booting up in separate background windows!
echo.
echo - Your Web Dashboard will open at: http://localhost:5173
echo - Your Backend API will run at: http://localhost:5000
echo - Scan the QR code in the Mobile window using Expo Go on your phone.
echo.
echo (Press any key to close this window)
pause >nul
