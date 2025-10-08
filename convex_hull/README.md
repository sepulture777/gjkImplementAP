# Convex Hull How To Run


## Prerequisites

- **Python** 3.10+ (tested with Python 3.11)
- **Node.js** 18+ (tested with Node.js 20.x)
- **npm** (should come with Node.js)

## Quick Start (Using Run Scripts)

### Linux/macOS
```bash
chmod +x run.sh
./run.sh
```

### Windows
```powershell
.\run.ps1
```

The scripts will:
- Automatically install Python dependencies (`requirements.txt`)
- Automatically install Node dependencies (`package.json`)
- Start the backend on `http://localhost:8000`
- Start the frontend on `http://localhost:5173`

Press `Ctrl+C` to stop both servers.

---

## Manual Start

### 1. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 3. Start Backend Server
```bash
python -m uvicorn API.main:app --reload --host 0.0.0.0 --port 8000
```
Backend will be available at `http://localhost:8000`

### 4. Start Frontend Server (in a new terminal)
```bash
cd frontend
npm run dev
```
Frontend will be available at `http://localhost:5173`

---

## Usage

Open `http://localhost:5173` in your browser.

### Visualization Mode
- Generate random points or click canvas to add points manually
- Select algorithm (Andrews or QuickHull)
- Run visualization
- Control playback speed and step through manually

### Performance Testing Mode
- **Upload File**: Upload a dataset file and run tests
- **Generate Points**: Generate random points in memory and run tests
- View results with runtime metrics
- Expand results to see exact hull point coordinates

---