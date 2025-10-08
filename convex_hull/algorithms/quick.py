# quick hull algorithm
# python program to implement Quick Hull algorithm
# to find convex hull.

# Stores the result (points of convex hull)
hull = set()


def _str_to_point(s: str):
    """Convert internal "$"-joined string back to a Point tuple."""
    x, y = s.split("$")
    return (float(x), float(y))


def _current_hull_points():
    """Return current hull as list[Point]. Order is arbitrary (set backed)."""
    return [_str_to_point(s) for s in hull]

# Returns the side of point p with respect to line
# joining points p1 and p2.
def findSide(p1, p2, p):
    val = (p[1] - p1[1]) * (p2[0] - p1[0]) - (p2[1] - p1[1]) * (p[0] - p1[0])

    if val > 0:
        return 1
    if val < 0:
        return -1
    return 0

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

    for i in range(n):
        temp = lineDist(p1, p2, a[i])

        # record measurement snapshot (current ordered hull + candidate)
        if steps is not None:
            steps.append(hull.copy() + [a[i]])

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
            steps.append(hull.copy())
        return

    # Found farthest point
    farthest = a[ind]

    # Insert farthest between p1 and p2 in the ordered hull
    try:
        idx = hull.index(p2)
        hull.insert(idx, farthest)
        if steps is not None:
            steps.append(hull.copy())
    except ValueError:
        # If p2 not present, append to hull
        hull.append(farthest)
        if steps is not None:
            steps.append(hull.copy())

    # Partition remaining points into two sets
    left_set: List[Point] = []
    right_set: List[Point] = []

    for p in a:
        if p == farthest:
            continue
        dist_left = lineDist(p1, farthest, p)
        dist_right = lineDist(farthest, p2, p)
        if dist_left > 0:
            left_set.append(p)
        if dist_right > 0:
            right_set.append(p)

    # Recurse on the two parts
    quickHull(left_set, len(left_set), p1, farthest, side, steps=steps)
    quickHull(right_set, len(right_set), farthest, p2, steps=steps)


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
        steps.append(hull.copy())

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
        steps.append(hull.copy())
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


def supersonic_hull(points: List[Point]):
    """
    QuickHull variant that uses NumPy vectorization.
    """
    import numpy as np

    pts = np.asarray(points, dtype=float)
    n = pts.shape[0]
    if n < 3:
        return list(map(tuple, points))

    # find leftmost and rightmost in x
    xs = pts[:, 0]
    min_idx = int(np.argmin(xs))
    max_idx = int(np.argmax(xs))
    p_min = pts[min_idx]
    p_max = pts[max_idx]

    # unordered hull as a set of tuples for fast insertion
    # using a set avoids costly list.insert operations and ordering
    # which is fine because the caller does not require an ordered hull
    hull_set = set()
    hull_set.add((float(p_min[0]), float(p_min[1])))
    hull_set.add((float(p_max[0]), float(p_max[1])))

    # Simple instrumentation counters to observe work done by the numpy path
    # We count how many vectorized cross-array evaluations occur and how many
    # hull insertions were made. We also print a short snapshot each time a
    # farthest point is accepted so you can see what the frontend would get.
    counters = {
        'cross_calls': 0,
        'insertions': 0,
        'steps': 0,
    }

    # vectorized cross product helper: returns array of signed distances
    def cross_array(p1, p2, arr):
        # Time: O(r) for an input arr of length r (NumPy does C-level loops).
        # Space: O(r) for the returned NumPy array of cross values.
        # Reason: each call computes signed distances for a whole subset in one vectorized operation.
        # Complexity should be counted in the number of elements processed; repeated calls over
        # disjoint subsets sum to at most O(n log n) average work (same algorithmic class as QuickHull).
        # cross = (p2.x-p1.x)*(y-p1.y) - (p2.y-p1.y)*(x-p1.x)
        # This is vectorized: NumPy evaluates this with C loops for the whole
        # array `arr` which is much faster than a Python loop calling
        # findSide/lineDist for each point.
        counters['cross_calls'] += 1
        return (p2[0] - p1[0]) * (arr[:, 1] - p1[1]) - (p2[1] - p1[1]) * (arr[:, 0] - p1[0])

    # recurse using numpy index arrays (each recursion gets indices into pts)
    def recurse(idxs: np.ndarray, p1: np.ndarray, p2: np.ndarray):
        # Time (average): work proportional to the number of indices processed in this call.
        # Space: extra O(r) for subset arrays created from idxs. Recursion depth is bounded by O(n)
        # but is typically shallow on average inputs.
        # Reason: the function selects the farthest point by a vectorized scan (argmax over abs cross),
        # then builds boolean masks for child subsets and recurses. Overall complexity mirrors QuickHull
        # (average O(n log n), worst-case O(n^2)), but vectorized operations reduce Python overhead.
        if idxs.size == 0:
            return

        subset = pts[idxs]
        # vectorized signed distances for this segment
        cross = cross_array(p1, p2, subset)
        # if no candidate on this side, return
        if cross.size == 0 or np.all(cross == 0):
            return

        # farthest is the point with maximum absolute cross (perpendicular distance)
        far_local = int(np.argmax(np.abs(cross)))
        far_idx = int(idxs[far_local])
        far = pts[far_idx]

        # add farthest point into the unordered hull set and instrument
        hull_set.add((float(far[0]), float(far[1])))
        counters['insertions'] += 1
        counters['steps'] += 1
        # Compact instrumentation line for terminal inspection
        print(f"[supersonic_hull] STEP {counters['steps']}: measured={tuple(map(float, far))} "
              f"from=({tuple(map(float, p1))},{tuple(map(float, p2))}) hull_size={len(hull_set)}")

        # build child index arrays (vectorized tests)
        mask_left = cross_array(p1, far, subset) > 0
        mask_right = cross_array(far, p2, subset) > 0

        left_idxs = idxs[mask_left]
        right_idxs = idxs[mask_right]

        # recurse on children
        recurse(left_idxs, p1, far)
        recurse(right_idxs, far, p2)

    # initial indices: all except endpoints
    all_idxs = np.arange(n, dtype=int)
    mask_initial = (all_idxs != min_idx) & (all_idxs != max_idx)
    idxs0 = all_idxs[mask_initial]

    # partition initial set into left and right of the main dividing line
    subset0 = pts[idxs0]
    cross0 = cross_array(p_min, p_max, subset0)
    left_mask = cross0 > 0
    right_mask = cross0 < 0
    left_idxs = idxs0[left_mask]
    right_idxs = idxs0[right_mask]

    # recurse on both sides
    recurse(left_idxs, p_min, p_max)
    recurse(right_idxs, p_max, p_min)

    # Print instrumentation summary
    print(f"[supersonic_hull] done: cross_calls={counters['cross_calls']}, "
        f"insertions={counters['insertions']}, steps={counters['steps']}")

    # return unordered hull points as a list (no particular order)
    return list(hull_set)





