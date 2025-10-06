/**
 * Type definitions for Convex Hull Visualizer
 * Simplified - no metadata, pure visualization data
 */

export type Point = [number, number];

export interface AlgorithmStep {
  hull: Point[];      // Current hull points to draw
  active: Point[];    // Points to highlight (what changed)
}

export interface ComputeResponse {
  total_steps: number;
  steps: AlgorithmStep[];
  points: Point[];
  algorithm: string;
}

export interface GeneratePointsRequest {
  count: number;
  x_max?: number;
  y_max?: number;
}

export interface GeneratePointsResponse {
  points: Point[];
}

export type Algorithm = 'andrews' | 'quickhull';

export interface PerformanceTestResult {
  algorithm: string;
  input_points: number;
  hull_points: Point[];
  runtime_seconds: number;
}

export type AppMode = 'visualization' | 'performance';

