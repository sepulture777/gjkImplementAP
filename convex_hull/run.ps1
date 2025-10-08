try {
    $null = Get-Command python -ErrorAction Stop
} catch {
    Write-Host "Error: Python is not installed"
    exit 1
}

try {
    $null = Get-Command node -ErrorAction Stop
} catch {
    Write-Host "Error: Node.js is not installed"
    exit 1
}

try {
    $null = Get-Command npm -ErrorAction Stop
} catch {
    Write-Host "Error: npm is not installed"
    exit 1
}

try {
    python -c "import fastapi" 2>$null
} catch {
    Write-Host "Installing Python dependencies..."
    python -m pip install -r requirements.txt
}

if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "Installing Node dependencies..."
    Push-Location frontend
    npm install | Out-Null
    Pop-Location
}

$backend = Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "API.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000" -NoNewWindow -PassThru
Start-Sleep -Seconds 2

Write-Host "Starting backend on http://localhost:8000"

Push-Location frontend
$frontend = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow -PassThru
Pop-Location

Start-Sleep -Seconds 1

Write-Host "Starting frontend on http://localhost:5173"
Write-Host ""
Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:5173"
Write-Host ""
Write-Host "Press Ctrl+C to stop"

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    if ($backend) { Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue }
    if ($frontend) { Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue }
    Write-Host ""
    Write-Host "Shutting down..."
}
