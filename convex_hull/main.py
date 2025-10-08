"""
Test script for convex hull algorithms (legacy).

For the web visualization, use:
    ./run.sh
    
Or manually:
    cd /path/to/convex_hull && uvicorn API.main:app --reload
"""

from data.generator import generate_points
from algorithms.andrews import andrews_algorithm
from scipy.spatial import ConvexHull
import numpy as np

def main():
    print("=" * 60)
    print("CONVEX HULL ALGORITHM TEST")
    print("=" * 60)
    print()
    
    # Punkte generieren
    print("Generiere Punkte...")
    points = generate_points(10, x_range=(0, 100), y_range=(0, 100))
    print(f"Generierte {len(points)} Punkte:")
    for i, p in enumerate(points):
        print(f"  {i+1}. {p}")
    print()
    
    # Andrew's Algorithmus - Final Hull
    print("🔹 Running Andrews algorithm (final hull)...")
    hull = andrews_algorithm(points)
    print(f"✓ Fertige Huelle ({len(hull)} Punkte):")
    for p in hull:
        print(f"  {p}")
    print()

    # Step-by-step
    print("🔹 Running Andrews algorithm (step-by-step)...")
    steps = andrews_algorithm(points, step_mode=True)
    print(f"✓ {len(steps)} Schritte:")
    for i, step in enumerate(steps):
        print(f"  Step {i + 1}: {step[:5]}{'...' if len(step) > 5 else ''}")

    # Comparison with scipit andrews implementation
    try:
        print("🔹 Running SciPy ConvexHull for comparison...")
        np_points = np.array(points)
        hull_scipy = ConvexHull(np_points)
        hull_points = [tuple(np_points[vertex]) for vertex in hull_scipy.vertices]

        print(f"✓ SciPy Huelle ({len(hull_points)} Punkte):")
        for p in hull_points:
            print(f"  {p}")
            print()

        if set(hull) == set(hull_points):
            print("✓ Die Hüllen stimmen überein!")
        else:
            print("✗ Die Hüllen stimmen NICHT überein!")
    except ImportError:
        print("SciPy ist nicht installiert. Überspringe Vergleich.")
    print()
    print("Test abgeschlossen.")




if __name__ == "__main__":
    main()
