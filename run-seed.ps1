# run-seed.ps1 – Install seed dependencies and run the seeder
# Run this AFTER `docker-compose up` is fully started

Set-Location "$PSScriptRoot\seed"

Write-Host "Installing seed dependencies..." -ForegroundColor Cyan
npm install

Write-Host "`nRunning seed script..." -ForegroundColor Cyan
node seed.js
