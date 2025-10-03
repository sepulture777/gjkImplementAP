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
}

export function Canvas({ 
  points, 
  currentStep, 
  onAddPoint, 
  canEdit,
  isLastStep = false,
  width = 800,
  height = 600
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle canvas click to add points
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canEdit) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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

    // Draw grid (optional, subtle)
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

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
  }, [points, currentStep, isLastStep, width, height]);

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

