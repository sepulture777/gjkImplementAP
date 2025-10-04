/**
 * Canvas component for visualizing convex hull
 */

import { useEffect, useRef } from 'react';
import type { Point, AlgorithmStep } from './types';

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
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid (optional, subtle) - only inside the margin area
    ctx.strokeStyle = '#2a2a2a';
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
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 2;
    ctx.strokeRect(margin, margin, width - 2 * margin, height - 2 * margin);

    // Draw all points (gray)
    points.forEach(([x, y]) => {
      ctx.fillStyle = '#666';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    if (currentStep) {
      // Draw hull lines
      if (currentStep.hull.length > 1) {
        // Green if last step (complete), red if in progress
        ctx.strokeStyle = isLastStep ? '#22c55e' : '#ef4444';
        ctx.lineWidth = isLastStep ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(currentStep.hull[0][0], currentStep.hull[0][1]);
        for (let i = 1; i < currentStep.hull.length; i++) {
          ctx.lineTo(currentStep.hull[i][0], currentStep.hull[i][1]);
        }
        // Close the hull if complete (last step)
        if (isLastStep) {
          ctx.lineTo(currentStep.hull[0][0], currentStep.hull[0][1]);
          
          // Fill with semi-transparent green
          ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
          ctx.fill();
        }
        ctx.stroke();
      }

      // Draw hull points (green)
      currentStep.hull.forEach(([x, y]) => {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add black outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw active points (yellow, larger)
      currentStep.active.forEach(([x, y]) => {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add black outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  }, [points, currentStep, isLastStep, width, height, margin]);

  return (
    <div style={{ border: '2px solid #444', borderRadius: '8px', display: 'inline-block' }}>
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

