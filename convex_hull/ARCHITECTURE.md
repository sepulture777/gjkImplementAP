# System Architecture

## Overview
Application Stack: **React Frontend** → **FastAPI Backend** → **Convex Hull Algorithms**

---

## Flow

```
User Browser (React + TypeScript)
    ↓ HTTP REST API
FastAPI Server (Python)
    ↓ Function Calls
Algorithm Layer (andrews.py, quickhull.py)
```

---

## Components

### Frontend (React + TypeScript + Vite)
- `App.tsx` - Mode switcher (Visualization / Performance)
- `Canvas.tsx` - Visualization rendering
- `Controls.tsx` - User controls for visualization
- `Performance.tsx` - Performance testing UI
- `api.ts` - HTTP client for backend
- `theme.ts` - Centralized colors

### Backend (FastAPI + Uvicorn)
- `API/main.py` - REST endpoints
- Endpoints: `/api/compute`, `/upload/`, `/api/generate-points*`

### Algorithms (Pure Python)
- `algorithms/andrews.py` - Andrews' Monotone Chain algorithm
- `algorithms/quickhull.py` - QuickHull algorithm
- `algorithms/adapter.py` - Converts algorithm output to visualization format

---

## Key Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/compute` | Run algorithm (step_mode=true for viz, false for perf) |
| `POST /upload/` | Upload dataset file and run performance test |
| `GET /api/generate-points-performance` | Generate random points for testing |

---