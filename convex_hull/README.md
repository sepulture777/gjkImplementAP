# Convex Hull Visualizer

Interactive step-by-step visualization of convex hull algorithms.

## 🎯 Overview

This project provides a web-based visualization tool for understanding how convex hull algorithms work. Watch as algorithms process points step-by-step, with clear visual feedback and descriptions.

## ✨ Features

- **Interactive Point Manipulation**: Add/remove points by clicking on canvas
- **Random Point Generation**: Generate test data with customizable parameters
- **Step-by-Step Playback**: Watch algorithms execute one step at a time
- **Multiple Algorithms**: 
  - ✅ Andrew's Monotone Chain (implemented)
  - 🔜 QuickHull (coming soon)
- **Visual Feedback**: Active points highlighted, hull drawn in real-time
- **Algorithm Descriptions**: Each step explained in plain language

## 🏗️ Architecture

```
Backend (FastAPI)      Frontend (React - Coming Soon)
┌─────────────────┐    ┌─────────────────┐
│  API Endpoints  │◄───│  Canvas         │
│  - /compute     │    │  - Render       │
│  - /generate    │    │  - Interact     │
│  - /algorithms  │    │                 │
│                 │───►│  Controls       │
│  Algorithms     │    │  - Play/Pause   │
│  - Andrews      │    │  - Step Fwd/Bwd │
│  - QuickHull*   │    │  - Speed        │
└─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- pip

### Installation & Running

```bash
# Navigate to the project directory
cd convex_hull

# Install dependencies (automatic on first run)
pip install -r requirements.txt
cd frontend && npm install && cd ..

# Start both backend and frontend
./run.sh
```

The application will be available at:
- **Frontend**: http://localhost:5173 ← **Open this!**
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Manual Start (Alternative)

```bash
# Terminal 1 - Backend
uvicorn API.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## 📡 API Endpoints

### Health Check
```bash
GET /
```

Returns API status and available algorithms.

### Generate Random Points
```bash
POST /api/generate-points
Content-Type: application/json

{
  "count": 50,
  "x_max": 1000.0,
  "y_max": 1000.0
}
```

Returns:
```json
{
  "points": [[x1, y1], [x2, y2], ...]
}
```

### Compute Algorithm Steps
```bash
POST /api/compute
Content-Type: application/json

{
  "algorithm": "andrews",
  "points": [[10, 10], [50, 5], [20, 80], ...]
}
```

Returns:
```json
{
  "total_steps": 25,
  "algorithm": "andrews",
  "points": [[original points]],
  "steps": [
    {
      "step": 0,
      "hull": [[points on hull so far]],
      "description": "Added point (10, 10) to lower hull (1/10)",
      "active": [[points being processed]],
      "phase": "lower_hull"
    },
    ...
  ]
}
```

### List Algorithms
```bash
GET /api/algorithms
```

Returns available algorithms and their implementation status.

## 🧮 Algorithms

### Andrew's Monotone Chain

**Status**: ✅ Implemented

**Complexity**: O(n log n)

**How it works**:
1. Sort points by x-coordinate (then y if tied)
2. Build lower hull from left to right
3. Build upper hull from right to left
4. Combine both hulls

**Step Types**:
- `lower_hull`: Building the lower convex hull
- `upper_hull`: Building the upper convex hull  
- `complete`: Final combined hull

### QuickHull

**Status**: 🔜 Coming Soon

**Complexity**: O(n log n) average, O(n²) worst case

**How it works**:
1. Find leftmost and rightmost points
2. Divide points into two sets
3. Find point farthest from the line
4. Recursively process subsets
5. Merge results

## 🧪 Testing the Backend

### Test with curl

Generate points:
```bash
curl -X POST http://localhost:8000/api/generate-points \
  -H "Content-Type: application/json" \
  -d '{"count": 10}' | python -m json.tool
```

Compute convex hull:
```bash
curl -X POST http://localhost:8000/api/compute \
  -H "Content-Type: application/json" \
  -d '{"algorithm": "andrews", "points": [[10,10], [50,5], [20,80], [90,70], [40,40]]}' \
  | python -m json.tool
```

### Test with Python

```python
import requests

# Generate points
response = requests.post(
    "http://localhost:8000/api/generate-points",
    json={"count": 20, "x_max": 500, "y_max": 500}
)
points = response.json()["points"]

# Compute hull
response = requests.post(
    "http://localhost:8000/api/compute",
    json={"algorithm": "andrews", "points": points}
)
result = response.json()

print(f"Total steps: {result['total_steps']}")
for step in result['steps'][:3]:  # First 3 steps
    print(f"Step {step['step']}: {step['description']}")
```

### Legacy Test Script

```bash
python main.py
```

Runs the algorithm without the API (console output only).

## 📂 Project Structure

```
convex_hull/
├── algorithms/
│   ├── __init__.py
│   ├── base.py              # Algorithm interface documentation
│   ├── andrews.py           # Andrew's algorithm (step-by-step)
│   └── quickhull.py         # QuickHull (placeholder)
├── API/
│   └── main.py              # FastAPI application (3 endpoints)
├── data/
│   ├── __init__.py
│   └── generator.py         # Random point generator
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main component
│   │   ├── Canvas.tsx       # Visualization canvas
│   │   ├── Controls.tsx     # Playback controls
│   │   ├── api.ts           # API client
│   │   ├── types.ts         # TypeScript definitions
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
├── main.py                  # Legacy test script
├── requirements.txt         # Python dependencies
├── run.sh                   # Quick start script (starts both servers)
└── README.md               # This file
```

## 🔧 Development

### Adding a New Algorithm

1. Create a new file in `algorithms/` (e.g., `graham_scan.py`)
2. Follow the pattern in `base.py`:

```python
def algorithm_name(points: List[Point], step_mode: bool = False):
    if step_mode:
        return [
            {
                "step": 0,
                "hull": [...],
                "description": "...",
                "active": [...],
                "phase": "..."
            },
            ...
        ]
    else:
        return final_hull
```

3. Import in `API/main.py`
4. Add to the `/api/compute` endpoint
5. Update `/api/algorithms` endpoint

### Running Tests

```bash
# Test individual algorithm
python -c "from algorithms.andrews import andrews_algorithm; \
           points = [(0,0), (1,1), (0,1), (1,0)]; \
           print(andrews_algorithm(points))"

# Test with step mode
python main.py
```

## 🎨 Frontend

The React frontend provides:
- ✅ Interactive canvas for point manipulation (click to add points)
- ✅ Play/pause/step controls for algorithm playback
- ✅ Speed control slider (0.5x to 3x)
- ✅ Algorithm selector dropdown
- ✅ Real-time visualization with highlighted active points
- ✅ Random point generation
- ✅ Step-by-step descriptions
- ✅ Progress tracking

### Frontend Stack
- React 18 + TypeScript
- Vite (fast build tool)
- HTML Canvas API for rendering
- Fetch API for backend communication

## 📝 Notes

- **Single-user only**: No session management, designed for local use
- **Stateless API**: All steps computed at once, frontend plays them back
- **Educational focus**: Optimized for understanding, not performance

## 🤝 Contributing

This is an academic project. Feel free to:
- Add new algorithms
- Improve visualizations
- Add tests
- Enhance documentation

## 📄 License

Academic/Educational use.

---

**Status**: ✅ Complete and fully functional!

**Try it now**: `./run.sh` then open http://localhost:5173


