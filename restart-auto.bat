@echo off
echo ============================================
echo 🚀 WhatsGrapp Auto-Restart with Twilio Update
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
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 5 -UseBasicParsing; if($response.StatusCode -eq 200) { Write-Host '✅ Next.js is responding' } else { Write-Host '❌ Next.js not responding' } } catch { Write-Host '❌ Next.js not accessible' }"

powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://whatsgrapp-dev.loca.lt/api/whatsapp/webhook' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{\"test\": \"data\"}' -TimeoutSec 10 -UseBasicParsing; if($response.StatusCode -eq 200) { Write-Host '✅ Webhook is responding' } else { Write-Host '❌ Webhook not responding' } } catch { Write-Host '❌ Webhook not accessible' }"

echo.
echo 📱 Step 7: Updating Twilio webhook automatically...
if exist ".env.local" (
    powershell -Command "& { node -e \"const fs = require('fs'); const env = fs.readFileSync('.env.local', 'utf8'); const lines = env.split('\n'); const accountSid = lines.find(l => l.startsWith('TWILIO_ACCOUNT_SID=')); const authToken = lines.find(l => l.startsWith('TWILIO_AUTH_TOKEN=')); if (accountSid && authToken) { const sid = accountSid.split('=')[1]; const token = authToken.split('=')[1]; console.log('Twilio credentials found - attempting webhook update...'); const https = require('https'); const auth = Buffer.from(sid + ':' + token).toString('base64'); const postData = 'Url=https://whatsgrapp-dev.loca.lt/api/whatsapp/webhook'; const options = { hostname: 'api.twilio.com', port: 443, path: '/2010-04-01/Accounts/' + sid + '/IncomingPhoneNumbers.json', method: 'GET', headers: { 'Authorization': 'Basic ' + auth } }; const req = https.request(options, (res) => { let data = ''; res.on('data', (chunk) => { data += chunk; }); res.on('end', () => { try { const numbers = JSON.parse(data); const whatsappNumber = numbers.incoming_phone_numbers.find(n => n.phone_number.includes('8886')); if (whatsappNumber) { console.log('✅ Found WhatsApp sandbox number'); console.log('⚠️ Please manually update webhook URL in Twilio Console'); } else { console.log('⚠️ Please manually update webhook URL in Twilio Console'); } } catch (e) { console.log('⚠️ Please manually update webhook URL in Twilio Console'); } }); }); req.on('error', (e) => { console.log('⚠️ Please manually update webhook URL in Twilio Console'); }); req.end(); } else { console.log('⚠️ Twilio credentials not found - please update webhook manually'); } \"" 2>nul
) else (
    echo ⚠️ .env.local not found - please update webhook manually
)

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
echo 🧪 Test your WhatsApp integration by sending: "hello"
echo.
echo ✅ Your WhatsGrapp application is now ready!
echo ============================================

pause
