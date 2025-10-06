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
    """Return current hull as list[Point], sorted counterclockwise by angle from centroid."""
    points = [_str_to_point(s) for s in hull]
    
    # If less than 3 points, no need to sort
    if len(points) < 3:
        return points
    
    # Calculate centroid
    cx = sum(p[0] for p in points) / len(points)
    cy = sum(p[1] for p in points) / len(points)
    
    # Sort by angle from centroid (counterclockwise)
    import math
    def angle_from_centroid(p):
        return math.atan2(p[1] - cy, p[0] - cx)
    
    return sorted(points, key=angle_from_centroid)

# Returns the side of point p with respect to line
# joining points p1 and p2.
def findSide(p1, p2, p):
    val = (p[1] - p1[1]) * (p2[0] - p1[0]) - (p2[1] - p1[1]) * (p[0] - p1[0])

    if val > 0:
        return 1
    if val < 0:
        return -1
    return 0

# returns a value proportional to the distance
# between the point p and the line joining the
# points p1 and p2
def lineDist(p1, p2, p):
    return abs((p[1] - p1[1]) * (p2[0] - p1[0]) -
            (p2[1] - p1[1]) * (p[0] - p1[0]))

# End points of line L are p1 and p2. side can have value
# 1 or -1 specifying each of the parts made by the line L
def quickHull(a, n, p1, p2, side, steps=None):

    ind = -1
    max_dist = 0

    # finding the point with maximum distance
    # from L and also on the specified side of L.
    for i in range(n):
        temp = lineDist(p1, p2, a[i])

        # AUSKOMMENTIERT: Dies erstellt zu viele Schritte (jeder Punkt wird gemessen)
        # If caller requested steps, record that we're measuring this point
        # if steps is not None:
        #     # snapshot: current hull points plus the measured point at the end
        #     steps.append(_current_hull_points() + [a[i]])

        if (findSide(p1, p2, a[i]) == side) and (temp > max_dist):
            ind = i
            max_dist = temp

    # If no point is found, add the end points
    # of L to the convex hull.
    if ind == -1:
        hull.add("$".join(map(str, p1)))
        hull.add("$".join(map(str, p2)))
        if steps is not None:
            steps.append(_current_hull_points())
        return

    # Recur for the two parts divided by a[ind]
    quickHull(a, n, a[ind], p1, -findSide(a[ind], p1, p2), steps)
    quickHull(a, n, a[ind], p2, -findSide(a[ind], p2, p1), steps)

def printHull(a, n, steps=None):
    # a[i].second -> y-coordinate of the ith point
    if (n < 3):
        print("Convex hull not possible")
        return
    
    # Finding the point with minimum and
    # maximum x-coordinate
    min_x = 0
    max_x = 0
    for i in range(1, n):
        if a[i][0] < a[min_x][0]:
            min_x = i
        if a[i][0] > a[max_x][0]:
            max_x = i

    # Recursively find convex hull points on
    # one side of line joining a[min_x] and
    # a[max_x]
    quickHull(a, n, a[min_x], a[max_x], 1, steps)

    # Recursively find convex hull points on
    # other side of line joining a[min_x] and
    # a[max_x]
    quickHull(a, n, a[min_x], a[max_x], -1, steps)

    print("\n\nQuick Hull: \nThe points in Convex Hull are:")
    
    for element in hull:
        x = element.split("$")
        print("(", x[0], ",", x[1], ") ", end = " \n")


def quickhull_algorithm(points, step_mode: bool = False, verbose: bool = False):
    """
    Minimal wrapper to run the existing quickHull implementation and
    return either the final hull (list[Point]) or a list of hull snapshots
    compatible with the rest of the project when step_mode=True.

    This does not change the core algorithm; it just prepares `steps` and
    converts internal string-based hull snapshots into Point tuples.
    """
    # reset global hull
    global hull
    hull = set()

    n = len(points)
    if n < 3:
        if step_mode:
            return [list(points)]
        return list(points)

    # find indices of min and max x
    min_x = 0
    max_x = 0
    for i in range(1, n):
        if points[i][0] < points[min_x][0]:
            min_x = i
        if points[i][0] > points[max_x][0]:
            max_x = i

    steps = [] if step_mode else None

    # Call the original recursive routine and collect steps if requested
    quickHull(points, n, points[min_x], points[max_x], 1, steps)
    quickHull(points, n, points[min_x], points[max_x], -1, steps)

    # Prepare final hull as list[Point]
    final_hull = _current_hull_points()

    if step_mode:
        # Ensure final hull snapshot is last
        steps.append(final_hull)
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
    return final_hull