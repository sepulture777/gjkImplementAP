"""
Adapter layer for convex hull visualization.

PURPOSE:
    Converts raw algorithm output (List[List[Point]]) to visualization format.
    This is OUR responsibility - we add "active" points for highlighting.

SCOPE:
    - Only processes step_mode=True output (for visualization)
    - Does NOT touch step_mode=False output (that's the algorithm's job)
    
WHAT WE ADD:
    - "active" field: Points that changed between steps (for yellow highlighting)
    
WHAT WE DON'T DO:
    - Modify algorithm logic
    - Handle step_mode=False output
    - Add functionality to raw hull results
"""

from typing import List, Tuple, Dict, Any

Point = Tuple[float, float]


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
    # In visualization, we want to show what's changing
    active = added + removed
    
    # If nothing changed but hull exists, highlight the last point
    if not active and current_hull:
        active = [current_hull[-1]]
    
    return active


def adapt_for_visualization(raw_steps: List[Any], all_points: List[Point], algorithm: str = "andrews") -> List[Dict[str, Any]]:
    """
    Converts algorithm output to visualization format.
    
    Handles two formats:
    - Andrews: Simple list of hull snapshots [[(x,y), ...], ...]
    - QuickHull: Rich dict format with metadata [{'hull': [...], 'dividing_line': [...], ...}, ...]
    
    Args:
        raw_steps: List of hull states from algorithm (format depends on algorithm)
        all_points: All input points (for reference - currently unused)
        algorithm: Algorithm name ("andrews" or "quickhull")
    
    Returns:
        List of visualization steps with format:
        [
            {
                "hull": [(x,y), ...],           # Current hull points
                "active": [(x,y), ...],         # Points to highlight
                "dividing_line": [p1, p2],      # QuickHull only: line being subdivided
                "test_points": [(x,y), ...],    # QuickHull only: points being tested
            },
            ...
        ]
    """
    if not raw_steps:
        return []
    
    # QuickHull already provides dict format with metadata
    if algorithm == "quickhull":
        # Steps are already dicts, just ensure they have all fields
        viz_steps = []
        for step in raw_steps:
            if isinstance(step, dict):
                viz_steps.append(step)
            else:
                # Fallback: convert to dict if needed
                viz_steps.append({"hull": step, "active": []})
        return viz_steps
    
    # Andrews uses simple list format - convert to dict format
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

