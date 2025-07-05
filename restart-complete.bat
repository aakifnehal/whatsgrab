@echo off
echo ============================================
echo 🚀 WhatsGrapp Complete Restart Script
echo ============================================

echo.
echo 🔄 Step 1: Stopping all running processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im cmd.exe /fi "windowtitle eq*localtunnel*" >nul 2>&1
echo ✅ All processes stopped

echo.
echo 🧹 Step 2: Clearing caches...
if exist ".next" (
    rmdir /s /q ".next" >nul 2>&1
    echo ✅ Next.js cache cleared
)
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache" >nul 2>&1
    echo ✅ Node modules cache cleared
)

echo.
echo 📦 Step 3: Installing/updating dependencies...
call npm install --silent
echo ✅ Dependencies updated

echo.
echo 🌐 Step 4: Starting Next.js server...
start /b cmd /c "npm run dev >nul 2>&1"
timeout /t 8 /nobreak >nul
echo ✅ Next.js started on http://localhost:3000

echo.
echo 🔗 Step 5: Starting LocalTunnel...
start /b cmd /c "npx localtunnel --port 3000 --subdomain whatsgrapp-dev"
timeout /t 5 /nobreak >nul
echo ✅ LocalTunnel started on https://whatsgrapp-dev.loca.lt

echo.
echo 🔍 Step 6: Verifying services...
echo Checking localhost:3000...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 5 -UseBasicParsing; if($response.StatusCode -eq 200) { Write-Host '✅ Next.js is responding' } else { Write-Host '❌ Next.js not responding' } } catch { Write-Host '❌ Next.js not accessible' }"

echo.
echo Checking tunnel...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://whatsgrapp-dev.loca.lt' -TimeoutSec 10 -UseBasicParsing; if($response.StatusCode -eq 200) { Write-Host '✅ Tunnel is working' } else { Write-Host '❌ Tunnel not responding' } } catch { Write-Host '❌ Tunnel not accessible' }"

echo.
echo 📱 Step 7: Testing WhatsApp webhook...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://whatsgrapp-dev.loca.lt/api/whatsapp/webhook' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{\"test\": \"data\"}' -TimeoutSec 10 -UseBasicParsing; if($response.StatusCode -eq 200) { Write-Host '✅ Webhook is responding' } else { Write-Host '❌ Webhook not responding' } } catch { Write-Host '❌ Webhook not accessible' }"

echo.
echo ============================================
echo 🎉 RESTART COMPLETE!
echo ============================================
echo.
echo 📋 Service URLs:
echo   🖥️  Local:     http://localhost:3000
echo   🌐 Public:    https://whatsgrapp-dev.loca.lt
echo   📱 Webhook:   https://whatsgrapp-dev.loca.lt/api/whatsapp/webhook
echo.
echo ⚠️  IMPORTANT: Update your Twilio webhook URL to:
echo    https://whatsgrapp-dev.loca.lt/api/whatsapp/webhook
echo.
echo 🔗 Twilio Console: https://console.twilio.com/
echo    Navigate to: Develop → Messaging → Try it out → Send a WhatsApp message
echo    Update the webhook URL in Sandbox Configuration
echo.
echo 📊 To view logs in real-time, open new terminal and run:
echo    npm run dev
echo.
echo ✅ Your WhatsGrapp application is now ready!
echo ============================================

pause
