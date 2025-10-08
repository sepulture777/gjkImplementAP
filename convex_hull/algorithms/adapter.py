from typing import List, Tuple, Dict, Any
from .models import Point


def detect_active_points(current_hull: List[Point], previous_hull: List[Point]) -> List[Point]:
    """
    Detect which points changed between two hull states.
    Returns points that were added or removed (for highlighting).
    """
    current_set = set(current_hull)
    previous_set = set(previous_hull)
    
    # Points that were added
    added = list(current_set - previous_set)
    # Points that were removed
    removed = list(previous_set - current_set)
    
    # Return both added and removed for highlighting
    # In der visualization, wollen wir zeigen was sich ändert
    active = added + removed
    
    # If nothing changed but hull exists, highlight the last point
    if not active and current_hull:
        active = [current_hull[-1]]
    
    return active


def adapt_for_visualization(raw_steps: List[List[Point]]) -> List[Dict[str, Any]]:
    """
    Converts Andrews algorithm output to visualization format.

    (QuickHull brauch keine adaptation, already returns the correct format.)
    """
    if not raw_steps:
        return []
    
    viz_steps = []
    previous_hull = []
    
    for hull in raw_steps:
        active = detect_active_points(hull, previous_hull)
        
        viz_steps.append({
            "hull": hull,
            "active": active
        })
        
        previous_hull = hull
    
    return viz_steps

