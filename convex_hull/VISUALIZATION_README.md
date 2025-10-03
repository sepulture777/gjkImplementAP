# Convex Hull Visualization - Developer Interface

## What is Needed

For the  **step-by-step visualizer** of convex hull algorithms. We need the algorithm to output hull snapshots.

---

## Required Interface

```python
from typing import List, Tuple

Point = Tuple[float, float]

def your_algorithm(points: List[Point], step_mode: bool = False):
    """
    Args:
        points: [(x, y), (x, y), ...]
        step_mode: True for visualization, False for final result
    
    Returns:
        step_mode=False: List[Point]           # Final hull
        step_mode=True:  List[List[Point]]     # Hull snapshots
    """
```

---

## Examples

### Final Hull (step_mode=False)
```python
points = [(0,0), (10,0), (10,10), (0,10), (5,5)]
hull = your_algorithm(points, step_mode=False)
# Returns: [(0,0), (10,0), (10,10), (0,10)]
```

### Visualization (step_mode=True)
```python
points = [(0,0), (10,0), (10,10), (0,10), (5,5)]
steps = your_algorithm(points, step_mode=True)
# Returns:
# [
#   [(0,0)],                    # Step 1
#   [(0,0), (10,0)],            # Step 2
#   [(0,0), (10,0), (10,10)],   # Step 3
#   ...
#   [(0,0), (10,0), (10,10), (0,10)]  # Final
# ]
```

**Each item = hull state at that moment**

---

## When to Add a Step

Capture a snapshot whenever:
- ✅ Point added to hull
- ✅ Point removed from hull
- ✅ Algorithm reaches a milestone

---

## What is done with this data

```python

raw_steps = your_algorithm(points, step_mode=True)
# [[(0,0)], [(0,0),(10,0)], ...]

# We add visualization data:
viz_steps = our_adapter(raw_steps)
# [{"hull": [(0,0)], "active": [(0,0)]}, ...]

# We render it:
# - Gray dots: all input points
# - Green dots: hull points
# - Yellow dots: what changed
```

---

## Testing

```python
# Test 1: Returns correct types
points = [(0,0), (10,0), (10,10), (0,10)]
hull = algorithm(points, step_mode=False)
assert isinstance(hull, list)
assert all(isinstance(p, tuple) and len(p) == 2 for p in hull)

# Test 2: Steps mode works
steps = algorithm(points, step_mode=True)
assert isinstance(steps, list)
assert all(isinstance(step, list) for step in steps)
assert len(steps) > 1
```

---

## Example Implementation

See: `algorithms/andrews_for_Testing.py`

Key pattern:
```python
def algorithm(points, step_mode=False):
    steps = [] if step_mode else None
    hull = []
    
    for p in points:
        # Remove invalid points
        while should_remove(hull, p):
            hull.pop()
            if step_mode:
                steps.append(hull.copy())  # ← Snapshot
        
        # Add point
        hull.append(p)
        if step_mode:
            steps.append(hull.copy())  # ← Snapshot
    
    return steps if step_mode else hull
```

---