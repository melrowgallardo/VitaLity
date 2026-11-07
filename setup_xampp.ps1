# ========================================================
# Vitality - XAMPP Auto-Deployment Helper Script
# ========================================================

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Vitality XAMPP Deployment & Setup Helper " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$sourceDir = Join-Path $PSScriptRoot "vitality_api"

if (-not (Test-Path $sourceDir)) {
    Write-Host "[ERROR] Could not locate 'vitality_api' folder at: $sourceDir" -ForegroundColor Red
    exit 1
}

# Common XAMPP installation locations
$possiblePaths = @(
    "C:\xampp\htdocs",
    "D:\xampp\htdocs",
    "E:\xampp\htdocs",
    "C:\tools\xampp\htdocs"
)

$targetHtdocs = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $targetHtdocs = $path
        break
    }
}

if (-not $targetHtdocs) {
    Write-Host "`nCould not automatically locate 'xampp\htdocs' in default drives." -ForegroundColor Yellow
    $userInput = Read-Host "Please enter the full path to your XAMPP htdocs folder (e.g. C:\xampp\htdocs)"
    if ($userInput -and (Test-Path $userInput)) {
        $targetHtdocs = $userInput
    } else {
        Write-Host "[!] Path not found or cancelled. You can manually copy the folder:" -ForegroundColor Yellow
        Write-Host "    FROM: $sourceDir"
        Write-Host "    TO:   <your_xampp_folder>\htdocs\vitality_api`n"
        exit 0
    }
}

$destination = Join-Path $targetHtdocs "vitality_api"

Write-Host "`n[+] Deploying PHP API to: $destination" -ForegroundColor Green
Copy-Item -Path $sourceDir -Destination $destination -Recurse -Force

Write-Host "[SUCCESS] Files successfully copied to XAMPP htdocs!" -ForegroundColor Green
Write-Host "`nYour API is now available at:" -ForegroundColor Cyan
Write-Host "  - Health Check:  http://localhost/vitality_api/api/health.php" -ForegroundColor White
Write-Host "  - Get Vitamins:  http://localhost/vitality_api/api/get_vitamins.php" -ForegroundColor White
Write-Host "  - Add Vitamin:   http://localhost/vitality_api/api/add_vitamin.php" -ForegroundColor White
Write-Host "  - Toggle Status: http://localhost/vitality_api/api/toggle_completed.php" -ForegroundColor White
Write-Host "  - Delete Record: http://localhost/vitality_api/api/delete_vitamin.php" -ForegroundColor White

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Ensure Apache & MySQL are running in XAMPP Control Panel."
Write-Host "2. Import 'schema.sql' into phpMyAdmin (http://localhost/phpmyadmin)."
Write-Host "3. Start the React frontend: 'cd frontend; npm run dev'`n"

