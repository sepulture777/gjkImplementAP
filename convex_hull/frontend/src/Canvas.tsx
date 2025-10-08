/**
 * Canvas component for visualizing convex hull
 */

import { useEffect, useRef } from 'react';
import type { Point, AlgorithmStep } from './types';
import { colors } from './theme';

interface CanvasProps {
  points: Point[];
  currentStep: AlgorithmStep | null;
  onAddPoint: (point: Point) => void;
  canEdit: boolean;
  isLastStep?: boolean;  // To know if we should draw complete hull
  width?: number;
  height?: number;
  margin?: number;  // Margin to keep points away from edges
}

export function Canvas({ 
  points, 
  currentStep, 
  onAddPoint, 
  canEdit,
  isLastStep = false,
  width = 1000,
  height = 700,
  margin = 30
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle canvas click to add points
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canEdit) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Flip Y coordinate to match mathematical convention (Y=0 at bottom)
    y = height - y;

    // Constrain to margin bounds
    x = Math.max(margin, Math.min(width - margin, x));
    y = Math.max(margin, Math.min(height - margin, y));

    onAddPoint([Math.round(x), Math.round(y)]);
  };

  // Draw the visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = colors.background.secondary;
    ctx.fillRect(0, 0, width, height);

    // Draw grid (optional, subtle) - only inside the margin area
    ctx.strokeStyle = colors.background.primary;
    ctx.lineWidth = 1;
    
    // Vertical grid lines (start from first line after margin)
    for (let i = Math.ceil(margin / 50) * 50; i < width - margin; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, margin);
      ctx.lineTo(i, height - margin);
      ctx.stroke();
    }
    
    // Horizontal grid lines (start from first line after margin)
    for (let i = Math.ceil(margin / 50) * 50; i < height - margin; i += 50) {
      ctx.beginPath();
      ctx.moveTo(margin, i);
      ctx.lineTo(width - margin, i);
      ctx.stroke();
    }

    // Draw margin bounds (slightly more visible border)
    ctx.strokeStyle = colors.border.primary;
    ctx.lineWidth = 2;
    ctx.strokeRect(margin, margin, width - 2 * margin, height - 2 * margin);

    // Draw all points (gray)
    points.forEach(([x, y]) => {
      ctx.fillStyle = colors.text.quaternary;
      ctx.beginPath();
      // Flip Y coordinate for rendering
      ctx.arc(x, height - y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    if (currentStep) {
      // QuickHull-specific visualization
      if (currentStep.dividing_line && currentStep.test_points) {
        // Draw dividing line (purple/magenta)
        const [p1, p2] = currentStep.dividing_line;
        ctx.strokeStyle = colors.action.primary; // Purple
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p1[0], height - p1[1]);
        ctx.lineTo(p2[0], height - p2[1]);
        ctx.stroke();

        // Draw perpendicular distance lines from test points to dividing line
        currentStep.test_points.forEach((p) => {
          // Calculate perpendicular foot on the line
          const [px, py] = p;
          const [x1, y1] = p1;
          const [x2, y2] = p2;
          
          const dx = x2 - x1;
          const dy = y2 - y1;
          const lenSq = dx * dx + dy * dy;
          
          if (lenSq > 0) {
            const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
            const footX = x1 + t * dx;
            const footY = y1 + t * dy;
            
            // Draw perpendicular line
            ctx.strokeStyle = colors.action.primary;
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]); // Dashed line
            ctx.beginPath();
            ctx.moveTo(px, height - py);
            ctx.lineTo(footX, height - footY);
            ctx.stroke();
            ctx.setLineDash([]); // Reset to solid
          }
        });

        // Draw test points (yellow)
        currentStep.test_points.forEach(([x, y]) => {
          ctx.fillStyle = colors.action.warning;
          ctx.beginPath();
          ctx.arc(x, height - y, 6, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }

      // Draw hull lines
      if (currentStep.hull.length > 1) {
        // Green if last step (complete), red if in progress
        ctx.strokeStyle = isLastStep ? colors.action.success : colors.action.danger;
        ctx.lineWidth = isLastStep ? 3 : 2;
        ctx.beginPath();
        // Flip Y coordinates for rendering
        ctx.moveTo(currentStep.hull[0][0], height - currentStep.hull[0][1]);
        for (let i = 1; i < currentStep.hull.length; i++) {
          ctx.lineTo(currentStep.hull[i][0], height - currentStep.hull[i][1]);
        }
        // Close the hull if complete (last step)
        if (isLastStep) {
          ctx.lineTo(currentStep.hull[0][0], height - currentStep.hull[0][1]);
          
          // Fill with semi-transparent green
          ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
          ctx.fill();
        }
        ctx.stroke();
      }

      // Draw hull points (green)
      currentStep.hull.forEach(([x, y]) => {
        ctx.fillStyle = colors.action.success;
        ctx.beginPath();
        // Flip Y coordinate for rendering
        ctx.arc(x, height - y, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add black outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw active points (yellow, larger) - only if not QuickHull test points
      if (!currentStep.test_points) {
        currentStep.active.forEach(([x, y]) => {
          ctx.fillStyle = colors.action.warning;
          ctx.beginPath();
          // Flip Y coordinate for rendering
          ctx.arc(x, height - y, 8, 0, 2 * Math.PI);
          ctx.fill();
          
          // Add black outline
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }
    }
  }, [points, currentStep, isLastStep, width, height, margin]);

  return (
    <div style={{ border: `2px solid ${colors.border.primary}`, borderRadius: '8px', display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleClick}
        style={{ 
          cursor: canEdit ? 'crosshair' : 'default',
          display: 'block'
        }}
      />
    </div>
  );
}

