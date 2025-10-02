"""
Base conventions for convex hull algorithms.

All algorithms should follow this pattern:
    algorithm_name(points: List[Point], step_mode: bool = False)

Returns:
    - If step_mode=False: List[Point] (final convex hull)
    - If step_mode=True: List[Dict] with structure:
        {
            "step": int,                    # Step number
            "hull": List[Point],           # Current hull state
            "description": str,            # Human-readable description
            "active": List[Point],         # Points being processed (for highlighting)
            "phase": str                   # Algorithm-specific phase info
        }
"""

from typing import List, Tuple

Point = Tuple[float, float]


