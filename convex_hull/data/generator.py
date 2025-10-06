import random
import os
import time

def generate_points(n: int, x_range=(0, 100), y_range=(0, 100)):
    """
    Erzeugt n zufällige 2D-Punkte

    Argumente:
        n: Anzahl der Punkte
        x_range: Bereich für die x-Koordinaten (min, max)
        y_range: Bereich für die y-Koordinaten (min, max)

    Returns:
        list[tuple[float, float]]: Liste mit (x, y)-Punkten
    """
    points = [
        (random.uniform(*x_range), random.uniform(*y_range))
        for _ in range(n)
    ]
    return points


def save_points_to_file(points, filename: str, folder: str = "datasets"):
    """
    Speichert Punkte im Format:
        n
        x,y
        ...
    """
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, filename)

    with open(path, "w") as f:
        f.write(f"{len(points)}\n")
        for x, y in points:
            f.write(f"{x:.3f},{y:.3f}\n")

    print(f"Datei erstellt: {path} ({len(points)} Punkte)")


if __name__ == "__main__":
    sizes = [1_000, 10_000, 100_000, 1_000_000, 10_000_000]

    for n in sizes:
        pts = generate_points(n)
        timestamp = time.strftime("%Y%m%d%H%M%S")
        save_points_to_file(pts, f"points_{n}_{timestamp}.txt")
