import random

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
