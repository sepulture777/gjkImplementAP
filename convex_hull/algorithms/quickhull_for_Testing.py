"""
QuickHull Algorithm - Testing Version
Outputs simple hull snapshots (no metadata)
Divide-and-conquer approach similar to quicksort.
"""

from typing import List, Tuple

Point = Tuple[float, float]


def distance_from_line(p: Point, line_start: Point, line_end: Point) -> float:
    """
    Calculate perpendicular distance from point p to line defined by line_start and line_end.
    Positive if left of line, negative if right.
    """
    return ((line_end[0] - line_start[0]) * (p[1] - line_start[1]) - 
            (line_end[1] - line_start[1]) * (p[0] - line_start[0]))


def find_farthest_point(points: List[Point], line_start: Point, line_end: Point) -> Point:
    """Find the point farthest from the line."""
    max_dist = 0
    farthest = None
    
    for p in points:
        dist = abs(distance_from_line(p, line_start, line_end))
        if dist > max_dist:
            max_dist = dist
            farthest = p
    
    return farthest


def quickhull_recursive(points: List[Point], line_start: Point, line_end: Point, 
                       hull: List[Point], steps: List[List[Point]] = None) -> None:
    """
    Recursive QuickHull algorithm.
    
    Args:
        points: Points on one side of the line
        line_start: Start of the dividing line
        line_end: End of the dividing line
        hull: Current hull being built (modified in place)
        steps: List to collect snapshots (if not None)
    """
    if not points:
        return
    
    # Find farthest point from the line
    farthest = find_farthest_point(points, line_start, line_end)
    
    if farthest is None:
        return
    
    # Add farthest point to hull (insert it between line_start and line_end)
    try:
        idx = hull.index(line_end)
        hull.insert(idx, farthest)
        if steps is not None:
            steps.append(hull.copy())
    except ValueError:
        # If line_end not in hull, just append
        hull.append(farthest)
        if steps is not None:
            steps.append(hull.copy())
    
    # Divide points into two sets
    left_set = []
    right_set = []
    
    for p in points:
        if p == farthest:
            continue
        
        dist_left = distance_from_line(p, line_start, farthest)
        dist_right = distance_from_line(p, farthest, line_end)
        
        if dist_left > 0:
            left_set.append(p)
        if dist_right > 0:
            right_set.append(p)
    
    # Recursively process both sides
    quickhull_recursive(left_set, line_start, farthest, hull, steps)
    quickhull_recursive(right_set, farthest, line_end, hull, steps)


def quickhull_algorithm(points: List[Point], step_mode: bool = False):
    """
    QuickHull Algorithm - divide and conquer approach
    
    Args:
        points: Liste von (x,y)-Tupeln
        step_mode: True -> gibt Liste von Zwischenschritten zurück
                   False -> gibt fertige Hülle zurück
    
    Returns:
        if step_mode=False: List[Point]           - Final hull
        if step_mode=True:  List[List[Point]]     - Hull snapshots at each step
    """
    if len(points) <= 2:
        if step_mode:
            return [list(points)]
        return list(points)
    
    # Find leftmost and rightmost points
    leftmost = min(points, key=lambda p: p[0])
    rightmost = max(points, key=lambda p: p[0])
    
    # Initialize step tracking
    steps = [] if step_mode else None
    
    # Start with leftmost and rightmost
    hull = [leftmost, rightmost]
    if step_mode:
        steps.append(hull.copy())
    
    # Divide points into upper and lower sets
    upper_points = []
    lower_points = []
    
    for p in points:
        if p == leftmost or p == rightmost:
            continue
        
        dist = distance_from_line(p, leftmost, rightmost)
        if dist > 0:
            upper_points.append(p)
        elif dist < 0:
            lower_points.append(p)
    
    # Build upper hull
    quickhull_recursive(upper_points, leftmost, rightmost, hull, steps)
    
    # Build lower hull (process in reverse)
    quickhull_recursive(lower_points, rightmost, leftmost, hull, steps)
    
    # Order hull points counterclockwise
    # Simple approach: sort by angle from centroid
    if len(hull) > 2:
        cx = sum(p[0] for p in hull) / len(hull)
        cy = sum(p[1] for p in hull) / len(hull)
        
        import math
        def angle_from_centroid(p):
            return math.atan2(p[1] - cy, p[0] - cx)
        
        hull = sorted(hull, key=angle_from_centroid)
    
    if step_mode:
        steps.append(hull)  # Final ordered hull
        return steps
    else:
        return hull

