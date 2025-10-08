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

## Data Flow

**Visualization Mode:**
1. Frontend sends points + algorithm to `/api/compute?step_mode=true`
2. Backend runs algorithm with all intermediate steps
3. Frontend receives steps array and plays back locally

**Performance Mode:**
1. Frontend sends points + algorithm to `/api/compute?step_mode=false`
2. Backend runs algorithm, returns only final hull + runtime
3. Frontend displays results in table

---

## Design Principles

- **Stateless**: No sessions, all computation on-demand
- **Step Mode**: Flag controls whether to compute visualization steps or only final hull
- **Client-Side Playback**: Visualization steps computed once, played locally in browser
- **No Database**: Pure computation, no data persistence
