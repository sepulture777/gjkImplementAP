# Algorithm Implementation Requirements

## Overview
This document specifies the exact interface required for convex hull algorithms to work with our visualizer. **No metadata or descriptions needed!**

### Division of Responsibility

**YOUR job (algorithm implementation):**
- ✅ Implement the convex hull algorithm correctly
- ✅ Return `List[Point]` when `step_mode=False` (final hull)
- ✅ Return `List[List[Point]]` when `step_mode=True` (hull snapshots)
- ✅ Ensure your algorithm works for speed testing

**OUR job (visualization):**
- ✅ Detect which points changed between steps (for highlighting)
- ✅ Render the visualization in the frontend
- ✅ Handle API integration
- ✅ Manage playback controls

**We will NOT:**
- ❌ Modify your algorithm code
- ❌ Add functionality to your `step_mode=False` output
- ❌ Do any work that belongs in the algorithm layer

**You should NOT:**
- ❌ Add visualization metadata to your output
- ❌ Add descriptions or labels
- ❌ Worry about frontend requirements

**Keep it clean and separated!**

---

## Function Signature

```python
from typing import List, Tuple

Point = Tuple[float, float]

def algorithm_name(points: List[Point], step_mode: bool = False):
    """
    Convex hull algorithm with optional step-by-step output.
    
    Args:
        points: List of (x, y) tuples representing 2D points
        step_mode: 
            - False: Return only the final convex hull
            - True: Return intermediate hull states for visualization
    
    Returns:
        if step_mode=False: List[Point]           # Final convex hull
        if step_mode=True:  List[List[Point]]     # Intermediate hull snapshots
    """
```

---

## Output Format

### Mode 1: Final Hull Only (`step_mode=False`)

**Input:**
```python
points = [(0, 0), (10, 0), (10, 10), (0, 10), (5, 5)]
hull = algorithm(points, step_mode=False)
```

**Output:**
```python
[(0, 0), (10, 0), (10, 10), (0, 10)]  # Just the final hull points
```

---

### Mode 2: Step-by-Step (`step_mode=True`)

**Input:**
```python
points = [(0, 0), (10, 0), (10, 10), (0, 10), (5, 5)]
steps = algorithm(points, step_mode=True)
```

**Output:**
```python
[
    [(0, 0)],                           # Step 1: Hull with 1 point
    [(0, 0), (10, 0)],                  # Step 2: Added a point
    [(0, 0), (10, 0), (10, 10)],        # Step 3: Added another point
    [(0, 0), (10, 0)],                  # Step 4: Removed a point
    [(0, 0), (10, 0), (10, 10)],        # Step 5: Added it back
    ...
    [(0, 0), (10, 0), (10, 10), (0, 10)]  # Final: Complete hull
]
```

**Each item is a snapshot of the hull at that moment.**

---

## What to Capture as Steps

Include a step whenever:
1. ✅ A point is **added** to the hull
2. ✅ A point is **removed** from the hull
3. ✅ The algorithm reaches a **milestone** (e.g., completed lower hull)

**Do NOT include:**
- ❌ Descriptions or metadata
- ❌ Step numbers or counters
- ❌ Phase information
- ❌ Reasons for actions

**Just the hull points at each moment!**

---

## Example Implementation Pattern

```python
def andrews_algorithm(points: List[Point], step_mode: bool = False):
    if len(points) <= 1:
        return [points] if step_mode else points
    
    # Sort points
    pts = sorted(points)
    
    # Initialize step tracking
    steps = [] if step_mode else None
    
    # Lower hull
    lower = []
    for p in pts:
        # Remove invalid points
        while len(lower) >= 2 and turns_right(lower[-2], lower[-1], p):
            lower.pop()
            if step_mode:
                steps.append(lower.copy())  # Capture state after removal
        
        # Add point
        lower.append(p)
        if step_mode:
            steps.append(lower.copy())  # Capture state after addition
    
    # Upper hull
    upper = []
    for p in reversed(pts):
        while len(upper) >= 2 and turns_right(upper[-2], upper[-1], p):
            upper.pop()
            if step_mode:
                steps.append(upper.copy())
        
        upper.append(p)
        if step_mode:
            steps.append(upper.copy())
    
    # Combine
    hull = lower[:-1] + upper[:-1]
    
    if step_mode:
        steps.append(hull)  # Add final complete hull
        return steps
    else:
        return hull
```

---

## Testing Your Implementation

```python
# Test 1: Basic square
points = [(0, 0), (10, 0), (10, 10), (0, 10), (5, 5)]

# Final hull should be the 4 corners
hull = your_algorithm(points, step_mode=False)
assert len(hull) == 4

# Step mode should give multiple snapshots
steps = your_algorithm(points, step_mode=True)
assert len(steps) > 1
assert all(isinstance(step, list) for step in steps)
assert all(isinstance(p, tuple) and len(p) == 2 for step in steps for p in step)

print("✅ Tests passed!")
```

---

## What We Do With Your Output

We have an **adapter layer** that processes your simple output **for visualization only**:

```python
# When step_mode=True - for visualization
raw_steps = your_algorithm(points, step_mode=True)

# Our adapter adds "active" points (what changed between steps)
viz_steps = adapt_for_visualization(raw_steps, points)
# Result:
# [
#   {"hull": [(0,0)], "active": [(0,0)]},         # active = what changed
#   {"hull": [(0,0),(10,0)], "active": [(10,0)]},
#   ...
# ]

# When step_mode=False - we use YOUR output directly
hull = your_algorithm(points, step_mode=False)
# We don't touch it - this is for speed testing, comparisons, etc.
```

**You don't need to worry about visualization - just give us the hull snapshots!**

**Important:** We only adapt `step_mode=True` output. When `step_mode=False`, we use your output as-is. That's YOUR responsibility to implement correctly!

---

## Performance Testing

For speed testing, we use your algorithm directly:

```python
import time

start = time.time()
hull = your_algorithm(large_point_set, step_mode=False)
elapsed = time.time() - start

print(f"Computed hull of {len(large_point_set)} points in {elapsed:.4f}s")
```

**No visualization overhead!**

---

## Summary

### ✅ DO:
- Return `List[Point]` when `step_mode=False`
- Return `List[List[Point]]` when `step_mode=True`
- Include steps for all additions/removals
- Keep algorithm code clean and fast

### ❌ DON'T:
- Add descriptions or metadata
- Add step counters or phase labels
- Worry about visualization details
- Mix algorithm logic with presentation

---

## Questions?

See:
- `algorithms/andrews_for_Testing.py` - Working example
- `algorithms/adapter.py` - How we process your output
- `API/main.py` - How we integrate into API

**Keep it simple, keep it fast!** 🚀

