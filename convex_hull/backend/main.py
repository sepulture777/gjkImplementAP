"""
FastAPI backend for Convex Hull Visualizer.
Simple, single-user, local-only API.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Tuple
import sys
import os
import random

# Add parent directory to path to import algorithms
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from algorithms.andrews import andrews_algorithm
from algorithms.quickhull import quickhull_algorithm

app = FastAPI(title="Convex Hull Visualizer API")

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Point = Tuple[float, float]


# Request/Response Models
class ComputeRequest(BaseModel):
    algorithm: str
    points: List[Point]


class GeneratePointsRequest(BaseModel):
    count: int
    x_max: float = 1000.0
    y_max: float = 1000.0


# Endpoints
@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "message": "Convex Hull Visualizer API",
        "status": "running",
        "algorithms": ["andrews", "quickhull"]
    }


@app.post("/api/compute")
def compute_algorithm(request: ComputeRequest):
    """
    Compute all steps for the selected algorithm at once.
    
    Returns all steps so the frontend can play them back locally.
    No session management - simple and stateless.
    """
    if not request.points:
        raise HTTPException(status_code=400, detail="No points provided")
    
    if len(request.points) < 3:
        return {
            "total_steps": 1,
            "steps": [{
                "step": 0,
                "hull": request.points,
                "description": "Less than 3 points - hull is just the points",
                "active": request.points,
                "phase": "complete"
            }],
            "points": request.points,
            "algorithm": request.algorithm
        }
    
    try:
        if request.algorithm == "andrews":
            steps = andrews_algorithm(request.points, step_mode=True)
        elif request.algorithm == "quickhull":
            steps = quickhull_algorithm(request.points, step_mode=True)
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Unknown algorithm: {request.algorithm}. Available: andrews, quickhull"
            )
        
        return {
            "total_steps": len(steps),
            "steps": steps,
            "points": request.points,
            "algorithm": request.algorithm
        }
    
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Algorithm error: {str(e)}")


@app.post("/api/generate-points")
def generate_points(request: GeneratePointsRequest):
    """
    Generate random points for visualization.
    Simple uniform distribution.
    """
    if request.count < 1:
        raise HTTPException(status_code=400, detail="Count must be at least 1")
    
    if request.count > 10000:
        raise HTTPException(status_code=400, detail="Count too large (max 10000)")
    
    points = [
        (
            round(random.uniform(0, request.x_max), 2),
            round(random.uniform(0, request.y_max), 2)
        )
        for _ in range(request.count)
    ]
    
    return {"points": points}


@app.get("/api/algorithms")
def list_algorithms():
    """List available algorithms"""
    return {
        "algorithms": [
            {
                "id": "andrews",
                "name": "Andrew's Monotone Chain",
                "description": "Sorts points and builds lower/upper hull separately",
                "implemented": True
            },
            {
                "id": "quickhull",
                "name": "QuickHull",
                "description": "Divide-and-conquer approach similar to quicksort",
                "implemented": False
            }
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)


