# --- Convex Hull Visualizer Startscript (minimal output) ---

if (-not (Test-Path "requirements.txt")) { exit 1 }

try { python -c "import fastapi" 2>$null } catch {
    pip install -r requirements.txt
}

if (-not (Test-Path "frontend/node_modules")) {
    Push-Location frontend
    npm install | Out-Null
    Pop-Location
}

$backend = Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "API.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000" -PassThru
Start-Sleep -Seconds 2

Push-Location frontend
$frontend = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm run dev" -PassThru
Pop-Location

try {
    while ($true) { Start-Sleep -Seconds 1 }
}
finally {
    if ($backend) { Stop-Process -Id $backend.Id -Force }
    if ($frontend) { Stop-Process -Id $frontend.Id -Force }
}
