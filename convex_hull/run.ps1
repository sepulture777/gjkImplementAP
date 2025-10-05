Write-Host " Starting Convex Hull Visualizer..."
Write-Host ""

# Prüfen, ob wir im richtigen Verzeichnis sind
if (-not (Test-Path "requirements.txt")) {
    Write-Host " Error: Please run this script from the convex_hull directory"
    exit 1
}

# Prüfen, ob FastAPI installiert ist
try {
    python -c "import fastapi" 2>$null
} catch {
    Write-Host " Installing Python dependencies..."
    pip install -r requirements.txt
    Write-Host ""
}

# Prüfen, ob Node-Module vorhanden sind
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host " Installing Node dependencies..."
    Push-Location frontend
    npm install
    Pop-Location
    Write-Host ""
}

# Backend starten
Write-Host " Starting FastAPI backend on http://localhost:8000"
Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "API.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000" -PassThru | ForEach-Object {
    $backend = $_
}

Start-Sleep -Seconds 3

# Frontend starten
Write-Host " Starting React frontend on http://localhost:5173"
Push-Location frontend
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru | ForEach-Object {
    $frontend = $_
}
Pop-Location

Start-Sleep -Seconds 2



# Auf Benutzerabbruch warten
try {
    while ($true) { Start-Sleep -Seconds 1 }
}
finally {
    Write-Host ""
    if ($backend) { Stop-Process -Id $backend.Id -Force }
    if ($frontend) { Stop-Process -Id $frontend.Id -Force }
}
