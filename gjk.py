import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

# --------------------------
# Support Function
# --------------------------
def support(shape, direction):
    """
    The support function takes a shape and a direction, and it returns the point 
    on the shape that is farthest along that direction.
    For polygons we can simply pick the vertex with the maximum dot product.
    """
    dots = np.dot(shape, direction)
    return shape[np.argmax(dots)]

def support_minkowski(A, B, direction):
    """
    We never need to construct the full Minkowski difference.
    Instead, we can compute its extreme points directly using the supports of A and B.
    This makes GJK efficient: each step only needs two support lookups and a subtraction.
    
    support(A - B, d) = support(A, d) - support(B, -d)
    """
    return support(A, direction) - support(B, -direction)

# --------------------------
# GJK Algorithm
# --------------------------
def gjk_collision_detection(A, B, max_iterations=20):
    """
    The algorithm builds a simplex: a set of up to three points in 2D.
    With each step, the simplex gets closer to enclosing the origin.
    If it ever does, we have a collision.
    
    Iteration Logic:
    1) Pick direction
    2) Get support point  
    3) Check dot(a, d) ≤ 0 → No collision
    4) Update simplex & direction
    5) Repeat
    """

    simplex = []
    direction = np.array([1.0, 0.0])  
    steps = []
    
    for iteration in range(max_iterations):

        support_point = support_minkowski(A, B, direction)
        
        if np.dot(support_point, direction) <= 0:
            steps.append({
                'iteration': iteration,
                'direction': direction.copy(),
                'support_point': support_point.copy(),
                'simplex': [p.copy() for p in simplex],
                'collision': False,
                'reason': 'Support point does not pass origin test'
            })
            return False, steps
        
        simplex.append(support_point)
        
        steps.append({
            'iteration': iteration,
            'direction': direction.copy(),
            'support_point': support_point.copy(),
            'simplex': [p.copy() for p in simplex],
            'collision': None,
            'reason': f'Added support point to simplex (size: {len(simplex)})'
        })

        collision, new_direction = handle_simplex(simplex)
        
        if collision:
            steps[-1]['collision'] = True
            steps[-1]['reason'] = 'Simplex contains origin - COLLISION!'
            return True, steps
        
        direction = new_direction
        
        if len(simplex) > 3:
            simplex = simplex[-3:]
    

    return False, steps

def handle_simplex(simplex):
    """
    A simplex is the smallest building block we use in GJK.
    In 2D, it can be a point, a line, or a triangle.
    At each step, GJK builds or updates the simplex from support points.
    Then it checks: does the simplex already contain the origin? 
    If yes, the shapes collide. If not, we update the search direction and keep going.
    """
    if len(simplex) == 1:
        return False, -simplex[0]
    
    elif len(simplex) == 2:
        a, b = simplex[1], simplex[0] 
        ab = b - a
        ao = -a  
        
        if np.dot(ab, ao) > 0:
            direction = triple_product(ab, ao, ab)
            if np.linalg.norm(direction) < 1e-10:
                direction = perpendicular_2d(ab)
        else:
            simplex[:] = [a]
            direction = ao
        
        return False, direction
    
    elif len(simplex) == 3:
        a, b, c = simplex[2], simplex[1], simplex[0]  
        ab = b - a
        ac = c - a
        ao = -a
        

        abc_perp = triple_product(ac, ab, ab)
        acb_perp = triple_product(ab, ac, ac)
        
        if np.dot(abc_perp, ao) > 0:
            simplex[:] = [a, b]
            return False, abc_perp
        elif np.dot(acb_perp, ao) > 0:
            simplex[:] = [a, c]
            return False, acb_perp
        else:
            return True, None
    
    return False, np.array([1.0, 0.0])

def triple_product(a, b, c):
    """
    Triple product: (a × b) × c
    In 2D: returns vector perpendicular to a in the plane, pointing towards c
    """
    return b * np.dot(a, c) - a * np.dot(b, c)

def perpendicular_2d(v):
    """Get a perpendicular vector in 2D"""
    return np.array([-v[1], v[0]])


# --------------------------
# Visualization
# --------------------------
A = np.array([[0,0],[1,0],[0,1]])               # triangle
B = np.array([[0,6],[1,7],[2,6],[1,5]])         # diamond higher up
velocity = np.array([0,-0.4])                   # move downwards

fig, (ax1, ax2) = plt.subplots(1,2,figsize=(15,7))

for ax in (ax1, ax2):
    ax.set_aspect("equal")
    ax.axhline(0, color="gray", lw=0.5)
    ax.axvline(0, color="gray", lw=0.5)

# Wide range for visualization
ax1.set_xlim(-3, 5)
ax1.set_ylim(-1, 8)
ax2.set_xlim(-4, 4)
ax2.set_ylim(-4, 4)

# Global variable for animation
current_gjk_steps = []

# Left SIDE: Actual shapes
polyA, = ax1.plot([], [], "bo-", linewidth=2, label="Shape A")
polyB, = ax1.plot([], [], "ro-", linewidth=2, label="Shape B")

# Right SIDE: Simplex visualization
simplex_points = ax2.scatter([], [], c='green', s=80, label='Simplex', zorder=5)
simplex_lines, = ax2.plot([], [], 'g-', linewidth=2, alpha=0.8)
origin = ax2.scatter([0],[0], color="black", s=80, marker='x', label="Origin", zorder=7)

# Simple text display
text_status = ax1.text(0.02, 0.95, "", transform=ax1.transAxes, fontsize=12, 
                      bbox=dict(boxstyle="round,pad=0.3", facecolor="white", alpha=0.9))

ax1.set_title("Real space: A (blue) and B (red)", fontsize=12)
ax2.set_title("Simplex Evolution", fontsize=12)
ax1.legend(loc='upper right')
ax2.legend(loc='upper right')

# --------------------------
# Update function
# --------------------------
def update(frame):
    global current_gjk_steps
    
    B_shifted = B + frame * velocity

    # Left panel: original shapes
    polyA.set_data(*np.vstack((A,A[0])).T)
    polyB.set_data(*np.vstack((B_shifted,B_shifted[0])).T)

    # Run GJK algorithm
    collision, gjk_steps = gjk_collision_detection(A, B_shifted)
    
    # Show GJK steps (cycle through them)
    if gjk_steps:
        # Cycle through the steps to show algorithm progression
        step_idx = (frame // 2) % len(gjk_steps)  # Slower cycling
        step = gjk_steps[step_idx]
        
        # Display current simplex
        if step['simplex']:
            simplex_array = np.array(step['simplex'])
            simplex_points.set_offsets(simplex_array)
            
            # Draw simplex shape
            if len(step['simplex']) >= 3:
                triangle_data = np.vstack([step['simplex'], step['simplex'][0]])
                simplex_lines.set_data(triangle_data.T)
            elif len(step['simplex']) == 2:
                line_data = np.array([step['simplex'][0], step['simplex'][1]])
                simplex_lines.set_data(line_data.T)
            else:
                simplex_lines.set_data([], [])
        else:
            simplex_points.set_offsets(np.empty((0,2)))
            simplex_lines.set_data([], [])
        
        # Show step info
        status = f"Step {step['iteration']}: "
        if step['collision'] == True:
            status += "COLLISION!"
        elif step['collision'] == False:
            status += "No collision"
        else:
            status += f"Simplex size: {len(step['simplex'])}"
        
        text_status.set_text(status)
    else:
        # Clear displays if no steps
        simplex_points.set_offsets(np.empty((0,2)))
        simplex_lines.set_data([], [])
        text_status.set_text(f"Frame {frame}: No steps")

    return polyA, polyB, simplex_points, simplex_lines, text_status


# Start animation
ani = FuncAnimation(fig, update, frames=30, interval=500, blit=False, repeat=True)
plt.tight_layout()
plt.show()