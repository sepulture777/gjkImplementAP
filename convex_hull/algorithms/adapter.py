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


def adapt_for_visualization(raw_steps: List[List[Point]], all_points: List[Point]) -> List[Dict[str, Any]]:
    """
    Converts simple hull snapshots to visualization format.
    
    This is OUR job - we add the "active" points for highlighting.
    The algorithm just gives us hull snapshots.
    
    Args:
        raw_steps: List of hull states from algorithm
                   e.g., [[(0,0)], [(0,0),(1,1)], [(0,0),(1,1),(2,2)], ...]
        all_points: All input points (for reference - currently unused)
    
    Returns:
        List of visualization steps with format:
        [
            {
                "hull": [(x,y), ...],      # Current hull points
                "active": [(x,y), ...],    # Points to highlight (what changed)
            },
            ...
        ]
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

