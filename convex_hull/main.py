"""
Test script for convex hull algorithms (legacy).

For the web visualization, use:
    ./run.sh
    
Or manually:
    cd /path/to/convex_hull && uvicorn API.main:app --reload
"""

from data.generator import generate_points
from algorithms.andrews import andrews_algorithm


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
    for step in steps:
        print(f"  Step {step['step']}: {step['description']}")
        print(f"    Hull: {step['hull'][:3]}{'...' if len(step['hull']) > 3 else ''}")
        print(f"    Active: {step['active']}")
        print(f"    Phase: {step['phase']}")
        print()


if __name__ == "__main__":
    main()
