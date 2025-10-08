/**
 * Canvas component for visualizing convex hull
 */

import { useEffect, useRef } from 'react';
import type { Point, AlgorithmStep } from './types';
import { colors } from './theme';

interface CanvasProps {
  points: Point[];
  currentStep: AlgorithmStep | null;
  onAddPoint: (point: Point) => void; // callback to add a point by clicking on the canvas
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
  // reference to the canvas a HTMLCanvasElement, which is basically the canvas we are going to use
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle canvas click to add points
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // make sure algorithm is not running
    if (!canEdit) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // We get the position of the canvas on the page
    // so we can convert the mouse click on the screen to canvas coordinates
    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left; // x position inside the canvas
    let y = e.clientY - rect.top;  // y position inside the canvas

    // Flip Y coordinate to match with the canvas
    y = height - y;

    // Constrain to margin bounds
    x = Math.max(margin, Math.min(width - margin, x));
    y = Math.max(margin, Math.min(height - margin, y));

    onAddPoint([Math.round(x), Math.round(y)]);
  };

  // Draw the visualization
  // Triggered when points or currentStep changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasContext = canvas.getContext('2d');
    if (!canvasContext) return;

    // Clear canvas
    canvasContext.fillStyle = colors.background.secondary;
    canvasContext.fillRect(0, 0, width, height);

    // Draw grid only inside the margin area
    canvasContext.strokeStyle = colors.background.primary;
    canvasContext.lineWidth = 1;
    
    // Vertical grid lines: Start at first multiple of 50 after margin, draw every 50px until right margin
    for (let i = Math.ceil(margin / 50) * 50; i < width - margin; i += 50) {
      canvasContext.beginPath();
      canvasContext.moveTo(i, margin);
      canvasContext.lineTo(i, height - margin);
      canvasContext.stroke();
    }
    
    // Horizontal grid lines: Start at first multiple of 50 after margin, draw every 50px until bottom margin
    for (let i = Math.ceil(margin / 50) * 50; i < height - margin; i += 50) {
      canvasContext.beginPath();
      canvasContext.moveTo(margin, i);
      canvasContext.lineTo(width - margin, i);
      canvasContext.stroke();
    }

    // Margin bounds, little thicker border
    canvasContext.strokeStyle = colors.border.primary;
    canvasContext.lineWidth = 2;
    canvasContext.strokeRect(margin, margin, width - 2 * margin, height - 2 * margin);

    // Draw all points
    points.forEach(([x, y]) => {
      canvasContext.fillStyle = colors.text.quaternary;
      canvasContext.beginPath();
      canvasContext.arc(x, height - y, 4, 0, 2 * Math.PI); // Need to flip Y coordinate for rendering
      canvasContext.fill();
    });

    if (currentStep) {
      // QuickHull-specific
      if (currentStep.dividing_line && currentStep.test_points) {
        // Draw dividing line
        const [p1, p2] = currentStep.dividing_line;
        canvasContext.strokeStyle = colors.action.primary;
        canvasContext.lineWidth = 2;
        canvasContext.beginPath();
        canvasContext.moveTo(p1[0], height - p1[1]);
        canvasContext.lineTo(p2[0], height - p2[1]);
        canvasContext.stroke();

        // Draw perpendicular distance lines from test points to dividing line
        currentStep.test_points.forEach((testPoint) => {
          // Calculate perpendicular foot/point on the line
          const [testPointX, testPointY] = testPoint;
          const [lineStartX, lineStartY] = p1;
          const [lineEndX, lineEndY] = p2;
          
          // Berechne Richtungsvektor und Länge der Linie
          const lineDirectionX = lineEndX - lineStartX;
          const lineDirectionY = lineEndY - lineStartY;
          const lineLengthSquared = lineDirectionX * lineDirectionX + lineDirectionY * lineDirectionY;
          
          if (lineLengthSquared > 0) {
            // Hier Finden wir den nächsten Punkt auf der Linie zum Testpunkt (t = 0 am Startpunkt, t = 1 am Endpunkt)
            const t = Math.max(0, Math.min(1, ((testPointX - lineStartX) * lineDirectionX + (testPointY - lineStartY) * lineDirectionY) / lineLengthSquared));
            // Berechnet die Koordinaten des rechtwinkligen Startpunkts
            const perpendicularFootX = lineStartX + t * lineDirectionX;
            const perpendicularFootY = lineStartY + t * lineDirectionY;
            
            // Zeichne gestrichelte Linie vom Testpunkt zum perpendicular foot
            canvasContext.strokeStyle = colors.action.primary;
            canvasContext.lineWidth = 1;
            canvasContext.setLineDash([5, 5]); // gestrichelte Linie
            canvasContext.beginPath();
            canvasContext.moveTo(testPointX, height - testPointY);
            canvasContext.lineTo(perpendicularFootX, height - perpendicularFootY);
            canvasContext.stroke();
            canvasContext.setLineDash([]); // Reset to solid, otherwise the next line will be dashed
          }
        });

        // Draw test points (active points)
        currentStep.test_points.forEach(([x, y]) => {
          canvasContext.fillStyle = colors.action.warning;
          canvasContext.beginPath();
          canvasContext.arc(x, height - y, 6, 0, 2 * Math.PI);
          canvasContext.fill();
          canvasContext.strokeStyle = '#000';
          canvasContext.lineWidth = 1;
          canvasContext.stroke();
        });
      }

      // Draw hull lines
      if (currentStep.hull.length > 1) {
        // Green if last step (complete), red if in progress
        canvasContext.strokeStyle = isLastStep ? colors.action.success : colors.action.danger;
        canvasContext.lineWidth = isLastStep ? 3 : 2;
        canvasContext.beginPath();
        // Flip Y coordinates for rendering
        canvasContext.moveTo(currentStep.hull[0][0], height - currentStep.hull[0][1]);
        for (let i = 1; i < currentStep.hull.length; i++) {
          canvasContext.lineTo(currentStep.hull[i][0], height - currentStep.hull[i][1]);
        }
        // Close the hull if complete (last step)
        if (isLastStep) {
          canvasContext.lineTo(currentStep.hull[0][0], height - currentStep.hull[0][1]);
          
          // Fill with semi-transparent green (complete hull)
          canvasContext.fillStyle = 'rgba(34, 197, 94, 0.1)';
          canvasContext.fill();
        }
        canvasContext.stroke();
      }

      // Draw hull points
      currentStep.hull.forEach(([x, y]) => {
        canvasContext.fillStyle = colors.action.success;
        canvasContext.beginPath();
        // Flip Y coordinate for rendering
        canvasContext.arc(x, height - y, 5, 0, 2 * Math.PI);
        canvasContext.fill();
        
        // Add black outline
        canvasContext.strokeStyle = '#000';
        canvasContext.lineWidth = 1;
        canvasContext.stroke();
      });

      // Draw active points, only if not QuickHull test points (they are already drawn as test points)
      if (!currentStep.test_points) {
        currentStep.active.forEach(([x, y]) => {
          canvasContext.fillStyle = colors.action.warning;
          canvasContext.beginPath();
          // Flip Y coordinate for rendering
          canvasContext.arc(x, height - y, 8, 0, 2 * Math.PI);
          canvasContext.fill();
          
          // Add black outline
          canvasContext.strokeStyle = '#000';
          canvasContext.lineWidth = 2;
          canvasContext.stroke();
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

