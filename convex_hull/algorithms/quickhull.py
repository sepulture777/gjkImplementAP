"""
QuickHull (ordered-hull) implementation

This version keeps `hull` as an ordered list and inserts the farthest
point between the two endpoints it was computed from. It produces
step snapshots (ordered lists) compatible with the visualizer.
"""

from typing import List, Tuple, Optional, Any

Point = Tuple[float, float]

# Ordered hull stored as a list of Points
hull: List[Point] = []


def findSide(p1: Point, p2: Point, p: Point) -> int:
    val = (p[1] - p1[1]) * (p2[0] - p1[0]) - (p2[1] - p1[1]) * (p[0] - p1[0])
    if val > 0:
        return 1
    if val < 0:
        return -1
    return 0


def lineDist(p1: Point, p2: Point, p: Point) -> float:
    return abs((p[1] - p1[1]) * (p2[0] - p1[0]) - (p2[1] - p1[1]) * (p[0] - p1[0]))


def quickHull(a: List[Point], n: int, p1: Point, p2: Point, side: int, steps: Optional[List[Any]] = None) -> None:
    """Recursive QuickHull that inserts the farthest point into the ordered hull."""
    ind = -1
    max_dist = 0.0

    # Record step showing the line being subdivided and points being tested
    if steps is not None and n > 0:
        steps.append({
            'hull': hull.copy(),
            'active': [],
            'dividing_line': [p1, p2],
            'test_points': [a[i] for i in range(n) if findSide(p1, p2, a[i]) == side]
        })

    for i in range(n):
        temp = lineDist(p1, p2, a[i])

        if (findSide(p1, p2, a[i]) == side) and (temp > max_dist):
            ind = i
            max_dist = temp

    # If no point is found, ensure endpoints exist in hull and snapshot
    if ind == -1:
        if p1 not in hull:
            hull.append(p1)
        if p2 not in hull:
            hull.append(p2)
        if steps is not None:
            steps.append({'hull': hull.copy(), 'active': []})
        return

    # Found farthest point
    farthest = a[ind]

    # Insert farthest between p1 and p2 in the ordered hull
    try:
        idx = hull.index(p2)
        hull.insert(idx, farthest)
        if steps is not None:
            steps.append({'hull': hull.copy(), 'active': [farthest]})
    except ValueError:
        # If p2 not present, append to hull
        hull.append(farthest)
        if steps is not None:
            steps.append({'hull': hull.copy(), 'active': [farthest]})

    # Partition remaining points into two sets
    left_set: List[Point] = []
    right_set: List[Point] = []

    for p in a:
        if p == farthest:
            continue
        # Check which side of the new lines the points are on
        if findSide(p1, farthest, p) == side:
            left_set.append(p)
        if findSide(farthest, p2, p) == side:
            right_set.append(p)

    # Recurse on the two parts with the correct side
    quickHull(left_set, len(left_set), p1, farthest, side, steps)
    quickHull(right_set, len(right_set), farthest, p2, side, steps)


def printHull(a: List[Point], n: int, steps: Optional[List[Any]] = None) -> None:
    if n < 3:
        print("Convex hull not possible")
        return

    # find min/max x
    min_x = 0
    max_x = 0
    for i in range(1, n):
        if a[i][0] < a[min_x][0]:
            min_x = i
        if a[i][0] > a[max_x][0]:
            max_x = i

    # initialize ordered hull with endpoints
    global hull
    hull = [a[min_x], a[max_x]]
    if steps is not None:
        steps.append(hull.copy())

    quickHull(a, n, a[min_x], a[max_x], 1, steps)
    quickHull(a, n, a[min_x], a[max_x], -1, steps)

    print("\n\nQuick Hull: \nThe points in Convex Hull are:")
    for p in hull:
        print("(", p[0], ",", p[1], ") ", end = " \n")


def quickhull_algorithm(points: List[Point], step_mode: bool = False, verbose: bool = False):
    """Wrapper: returns ordered final hull or step snapshots."""
    global hull
    hull = []

    n = len(points)
    if n < 3:
        if step_mode:
            return [list(points)]
        return list(points)

    # find leftmost and rightmost
    min_x = 0
    max_x = 0
    for i in range(1, n):
        if points[i][0] < points[min_x][0]:
            min_x = i
        if points[i][0] > points[max_x][0]:
            max_x = i

    steps: Optional[List[Any]] = [] if step_mode else None

    # initialize ordered hull with endpoints
    hull = [points[min_x], points[max_x]]
    if steps is not None:
        steps.append({'hull': hull.copy(), 'active': hull.copy()})

    # partition
    upper_points: List[Point] = []
    lower_points: List[Point] = []
    for p in points:
        if p == points[min_x] or p == points[max_x]:
            continue
        dist = (points[max_x][0] - points[min_x][0]) * (p[1] - points[min_x][1]) - (points[max_x][1] - points[min_x][1]) * (p[0] - points[min_x][0])
        if dist > 0:
            upper_points.append(p)
        elif dist < 0:
            lower_points.append(p)

    # build hull
    quickHull(upper_points, len(upper_points), points[min_x], points[max_x], 1, steps)
    quickHull(lower_points, len(lower_points), points[max_x], points[min_x], 1, steps)

    # final ordering (counterclockwise)
    if len(hull) > 2:
        cx = sum(p[0] for p in hull) / len(hull)
        cy = sum(p[1] for p in hull) / len(hull)
        import math
        def angle(p):
            return math.atan2(p[1]-cy, p[0]-cx)
        hull = sorted(hull, key=angle)

    if step_mode:
        steps.append({'hull': hull.copy(), 'active': []})
        if verbose:
            try:
                import pprint
                print("TOTAL STEPS =", len(steps))
                for i, s in enumerate(steps):
                    print(f"\n--- STEP {i} ---")
                    pprint.pprint(s)
            except Exception:
                pass
        return steps
    return hull


