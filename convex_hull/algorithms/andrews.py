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
    Args:
        points: Liste von (x,y)-Tupeln
        step_mode: True -> gibt Liste von Zwischenschritten als Dicts zurück
                   False -> gibt fertige Hülle zurück
    
    Returns:
        hull (list[Point]) oder steps (list[dict])
    """
    if len(points) <= 1:
        if step_mode:
            return [{
                "step": 0,
                "hull": list(points),
                "description": "Only one or zero points - hull is complete",
                "active": list(points),
                "phase": "complete"
            }]
        return points

    pts = merge_sort(points)
    steps = [] if step_mode else None
    step_counter = 0

    # Untere Hülle
    lower = []
    for i, p in enumerate(pts):
        # Remove points that make right turn
        while len(lower) >= 2 and orientation(lower[-2], lower[-1], p) <= 0:
            removed = lower.pop()
            if step_mode:
                steps.append({
                    "step": step_counter,
                    "hull": lower.copy(),
                    "description": f"Removed point {removed} (makes right turn)",
                    "active": [removed],
                    "phase": "lower_hull"
                })
                step_counter += 1
        
        # Add current point
        lower.append(p)
        if step_mode:
            steps.append({
                "step": step_counter,
                "hull": lower.copy(),
                "description": f"Added point {p} to lower hull ({i+1}/{len(pts)})",
                "active": [p],
                "phase": "lower_hull"
            })
            step_counter += 1

    # Obere Hülle
    upper = []
    reversed_pts = list(reversed(pts))
    for i, p in enumerate(reversed_pts):
        # Remove points that make right turn
        while len(upper) >= 2 and orientation(upper[-2], upper[-1], p) <= 0:
            removed = upper.pop()
            if step_mode:
                steps.append({
                    "step": step_counter,
                    "hull": upper.copy(),
                    "description": f"Removed point {removed} (makes right turn)",
                    "active": [removed],
                    "phase": "upper_hull"
                })
                step_counter += 1
        
        # Add current point
        upper.append(p)
        if step_mode:
            steps.append({
                "step": step_counter,
                "hull": upper.copy(),
                "description": f"Added point {p} to upper hull ({i+1}/{len(reversed_pts)})",
                "active": [p],
                "phase": "upper_hull"
            })
            step_counter += 1

    # Combine lower and upper hull
    hull = lower[:-1] + upper[:-1]

    if step_mode:
        steps.append({
            "step": step_counter,
            "hull": hull,
            "description": "Combined lower and upper hull - complete!",
            "active": [],
            "phase": "complete"
        })
        return steps
    else:
        return hull
