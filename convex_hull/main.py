from data.generator import generate_points
from algorithms.andrews import andrews_algorithm
from algorithms.quick import quickhull_algorithm

def main():
    
    # Punkte generieren
    print ("Generiere Punkte...")
    points = generate_points(100, x_range=(0, 1000), y_range=(0, 1000))
    print(f"Generierte {len(points)} Punkte. Starte Algorithmus...")
    # Andrew’s Algorithmus

    hull = andrews_algorithm(points)
    print("Fertige Huelle:", hull)

    # Step-by-step
    steps = andrews_algorithm(points, step_mode=True)
    print(f"{len(steps)} Schritte.")
    for i, s in enumerate(steps):
        print(f"Step {i+1}: {s}")
    
    
    # Quick Hull Algorithmus
    quickhull_algorithm(points, step_mode=True, verbose=False)
if __name__ == "__main__":
    main()
