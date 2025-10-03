"""
Andrew's Monotone Chain Algorithm - Testing Version
Outputs simple hull snapshots (no metadata)
This simulates what the real implementation will provide.
"""

from typing import List, Tuple

Point = Tuple[float, float]

def orientation(p: Point, q: Point, r: Point) -> float:
    """Kreuzprodukt: >0 = links, <0 = rechts, 0 = kollinear"""
    return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])

def merge_sort(points: List[Point]) -> List[Point]:
    """Sortiert Punkte nach x, dann y mit Merge-Sort"""
    if len(points) <= 1:
        return points
    mid = len(points) // 2
    left = merge_sort(points[:mid])
    right = merge_sort(points[mid:])
    return merge(left, right)

def merge(left: List[Point], right: List[Point]) -> List[Point]:
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i][0] < right[j][0] or (left[i][0] == right[j][0] and left[i][1] < right[j][1]):
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

def andrews_algorithm(points: List[Point], step_mode: bool = False):
    """    
    Andrew's Monotone Chain Algorithm
    
    Args:
        points: Liste von (x,y)-Tupeln
        step_mode: True -> gibt Liste von Zwischenschritten zurück
                   False -> gibt fertige Hülle zurück
    
    Returns:
        if step_mode=False: List[Point]           - Final hull
        if step_mode=True:  List[List[Point]]     - Hull snapshots at each step
    """
    if len(points) <= 1:
        if step_mode:
            return [list(points)]  # Single snapshot
        return points

    pts = merge_sort(points)
    steps = [] if step_mode else None

    # Untere Hülle (Lower Hull)
    lower = []
    for p in pts:
        # Remove points that make right turn
        while len(lower) >= 2 and orientation(lower[-2], lower[-1], p) <= 0:
            lower.pop()
            if step_mode:
                steps.append(lower.copy())  # Snapshot after removal
        
        # Add current point
        lower.append(p)
        if step_mode:
            steps.append(lower.copy())  # Snapshot after addition

    # Obere Hülle (Upper Hull)
    upper = []
    for p in reversed(pts):
        # Remove points that make right turn
        while len(upper) >= 2 and orientation(upper[-2], upper[-1], p) <= 0:
            upper.pop()
            if step_mode:
                steps.append(upper.copy())  # Snapshot after removal
        
        # Add current point
        upper.append(p)
        if step_mode:
            steps.append(upper.copy())  # Snapshot after addition

    # Combine hulls
    hull = lower[:-1] + upper[:-1]

    if step_mode:
        steps.append(hull)  # Final complete hull
        return steps
    else:
        return hull
