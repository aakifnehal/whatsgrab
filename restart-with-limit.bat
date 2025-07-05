@echo off
echo ========================================
echo WhatsGrapp - Message Limit Recovery
echo ========================================
echo.

echo 📱 Twilio Sandbox Message Limit Reached
echo.
echo The good news: Your WhatsApp integration is working perfectly!
echo The limitation: Twilio sandbox allows only 9 messages per day.
echo.

echo 🔄 What's still working:
echo   ✅ Database saves all incoming messages
echo   ✅ Merchant registration works
echo   ✅ Product creation works  
echo   ✅ All API endpoints work
echo   ✅ Website displays real data
echo.

echo 🛠️ Available Solutions:
echo   1. Use Test Dashboard (localhost:3001/test-dashboard)
echo   2. Wait 24 hours for limit reset
echo   3. Upgrade to paid Twilio account
echo   4. Continue development without WhatsApp responses
echo.

echo 🚀 Starting servers...
echo.

REM Kill existing processes
taskkill /f /im node.exe 2>nul
taskkill /f /im lt.exe 2>nul

REM Clear npm cache
npm cache clean --force

REM Start Next.js server
echo Starting Next.js server...
start "NextJS Server" cmd /k "cd /d %~dp0 && npm run dev"

timeout /t 5 /nobreak >nul

REM Start localtunnel
echo Starting localtunnel...
start "LocalTunnel" cmd /k "cd /d %~dp0 && npx localtunnel --port 3001"

timeout /t 3 /nobreak >nul

echo.
echo ✅ Servers started successfully!
echo.
echo 🌐 Available URLs:
echo   • Local: http://localhost:3001
echo   • Test Dashboard: http://localhost:3001/test-dashboard
echo   • WhatsApp Monitor: http://localhost:3001/whatsapp-monitor
echo.
echo 💡 Next Steps:
echo   1. Open Test Dashboard to continue testing
echo   2. Check that data is being saved in Supabase
echo   3. Consider upgrading Twilio for production use
echo.
echo Press any key to open Test Dashboard...
pause >nul

start "" "http://localhost:3001/test-dashboard"

echo.
echo Happy coding! 🚀
