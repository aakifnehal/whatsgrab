@echo off
echo ============================================
echo 🚀 WhatsGrapp Complete Restart
echo ============================================

echo.
echo 🔄 Stopping all processes...
taskkill /f /im node.exe >nul 2>&1
echo ✅ Processes stopped

echo.
echo 🧹 Clearing caches...
if exist ".next" rmdir /s /q ".next" >nul 2>&1
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache" >nul 2>&1
echo ✅ Caches cleared

echo.
echo 🌐 Starting Next.js...
start /b cmd /c "npm run dev"
timeout /t 8 /nobreak >nul
echo ✅ Next.js started

echo.
echo 🔗 Starting LocalTunnel...
start /b cmd /c "npx localtunnel --port 3000 --subdomain whatsgrapp-dev"
timeout /t 5 /nobreak >nul
echo ✅ Tunnel started

echo.
echo 🔍 Testing services...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 5 -UseBasicParsing | Out-Null; Write-Host '✅ Local server OK' } catch { Write-Host '❌ Local server failed' }"
powershell -Command "try { Invoke-WebRequest -Uri 'https://whatsgrapp-dev.loca.lt/api/whatsapp/webhook' -Method POST -TimeoutSec 10 -UseBasicParsing | Out-Null; Write-Host '✅ Webhook OK' } catch { Write-Host '❌ Webhook failed' }"

echo.
echo ============================================
echo 🎉 RESTART COMPLETE!
echo ============================================
echo.
echo 📍 Your URLs:
echo   🖥️  Local:    http://localhost:3000
echo   🌐 Public:   https://whatsgrapp-dev.loca.lt
echo   📱 Webhook:  https://whatsgrapp-dev.loca.lt/api/whatsapp/webhook
echo.
echo ⚠️  UPDATE TWILIO WEBHOOK:
echo   🔗 Go to: https://console.twilio.com/
echo   📍 Navigate: Develop → Messaging → Try it out → Send a WhatsApp message
echo   🔄 Change webhook URL to: https://whatsgrapp-dev.loca.lt/api/whatsapp/webhook
echo.
echo 🧪 Test by sending "hello" to your WhatsApp sandbox number
echo.
pause
