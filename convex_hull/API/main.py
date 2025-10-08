"""
FastAPI backend for Convex Hull Visualizer.
Simple, single-user, local-only API.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Tuple
import sys
import os
import random
import time
import csv
import json

# Add parent directory to path to import algorithms
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from algorithms.andrews import andrews_algorithm
from algorithms.quickhull import quickhull_algorithm
from algorithms.adapter import adapt_for_visualization
from algorithms.models import Point

app = FastAPI(title="Convex Hull Visualizer API")

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
                "hull": request.points,
                "active": []
            }],
            "points": request.points,
            "algorithm": request.algorithm
        }
    
    try:
        if request.algorithm == "andrews":

            # Get raw steps from algorithm (List[List[Point]])
            start_time = time.perf_counter()
            raw_steps = andrews_algorithm(request.points, step_mode=True)
            end_time = time.perf_counter()
            # Convert to visualization format

            viz_steps = adapt_for_visualization(raw_steps, request.points, algorithm="andrews")
        elif request.algorithm == "quickhull":
            start_time = time.perf_counter()
            raw_steps = quickhull_algorithm(request.points, step_mode=True)
            end_time = time.perf_counter()
            # print("\n" + "=================")
            # print("RAW STEPS:")
            # print("=================")
            # print(json.dumps(raw_steps, indent=2))
            # print("=================" + "\n")
            viz_steps = adapt_for_visualization(raw_steps, request.points, algorithm="quickhull")
            # print("\n" + "=================")
            # print("VISUALIZATION STEPS:")
            # print("=================")
            # print(json.dumps(viz_steps, indent=2))
            # print("=================" + "\n")
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Unknown algorithm: {request.algorithm}. Available: andrews, quickhull"
            )

        computation_time = end_time - start_time

        return {
            "total_steps": len(viz_steps),
            "steps": viz_steps,
            "points": request.points,
            "algorithm": request.algorithm,
            "computation_time_seconds": computation_time
        }
    
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Algorithm error: {str(e)}")


@app.post("/api/generate-points")
def generate_points(request: GeneratePointsRequest, seed: int = None):
    """
    Generate random points for visualization. 
    Benutzt die generate_points Funktion aus der data/generator.py Datei.
    """
    if request.count < 1:
        raise HTTPException(status_code=400, detail="Count should beat least 1")
    
    # maximum 10000 points for visualization, visualization makes no sense for more than that
    if request.count > 10000:
        raise HTTPException(status_code=400, detail="Count too large for visualization")

    if seed is not None:
        random.seed(seed)
    # Wir benutzen die x_max und y_max von unserem im Frontend definierten Canvas Dimensions
    # Damit wir nicht über den Canvas hinaus gehen (alle Punkte sollen hier innerhalb des Canvas liegen)
    points = [
        (
            round(random.uniform(0, request.x_max), 2),
            round(random.uniform(0, request.y_max), 2)
        )
        for _ in range(request.count)
    ]
    
    return {"points": points}

@app.get("/api/generate-points-performance")
def generate_points_performance(count: int = 1000, seed: int = None):
    """
    Generate a large number of random points for performance testing.
    This endpoint is not meant for visualization.
    """
    if count < 1:
        raise HTTPException(status_code=400, detail="Count should be at least 1")

    if seed is not None:
        random.seed(seed)

    points = [
        (
            random.uniform(0, 10000),
            random.uniform(0, 10000)
        )
        for _ in range(count)
    ]


    return {
        "points": points
    }

@app.get("/api/algorithms")
def list_algorithms():

    """List available algorithms"""
    return {
        "algorithms": [
            {
                "id": "andrews",
                "name": "Andrews",
                "description": "Sorts points and builds lower/upper hull separately",
                "implemented": True
            },
            {
                "id": "quickhull",
                "name": "QuickHull",
                "description": "Divide-and-conquer approach similar to quicksort",
                "implemented": True
            }
        ]
    }


@app.post("/upload/")
async def upload_file(
    file: UploadFile = File(...),
    algorithm: str = Form("andrews")
):
    """
    Lädt eine Punktdatei hoch und berechnet den Convex Hull.
    Datei-Format:
        Zeile 1: n
        Zeilen 2..n+1: x,y
    """
    try:
        # Datei lesen
        content = await file.read()
        text = content.decode("utf-8").strip()
        lines = text.splitlines()
        n = int(lines[0].strip())

        # Punkte parsen
        points: List[Point] = []
        for line in lines[1:]:
            if not line.strip():
                continue
            x_str, y_str = line.strip().split(",")
            points.append((float(x_str), float(y_str)))

        if len(points) != n:
            return JSONResponse(
                status_code=400,
                content={"error": f"Expected {n} points, but got {len(points)}."}
            )

        # Timer starten
        start_time = time.perf_counter()

        # Algorithmus ausführen
        if algorithm.lower() == "andrews":
            hull = andrews_algorithm(points)
        elif algorithm.lower() == "quickhull":
            hull = quickhull_algorithm(points)
        else:
            return JSONResponse(
                status_code=400,
                content={"error": f"Unknown algorithm: {algorithm}"}
            )

        duration = time.perf_counter() - start_time

        os.makedirs("logs", exist_ok=True)
        csv_path = os.path.join("logs", "results.csv")

        with open(csv_path, mode="a", newline="") as csvfile:
            writer = csv.writer(csvfile)
            # Kopfzeile einmalig schreiben, falls Datei neu ist
            if csvfile.tell() == 0:
                writer.writerow(["dataset","timestamp", "algorithm", "points", "runtime_seconds"])
            writer.writerow([
                file.filename,
                time.strftime("%Y-%m-%d %H:%M:%S"),
                algorithm,
                len(points),
                duration
            ])

        return {
            "algorithm": algorithm,
            "input_points": len(points),
            "hull_points": hull,
            "runtime_seconds": round(duration, 6)
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)


