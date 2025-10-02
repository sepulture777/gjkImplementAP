/**
 * Type definitions for Convex Hull Visualizer
 */

export type Point = [number, number];

export interface AlgorithmStep {
  step: number;
  hull: Point[];
  description: string;
  active: Point[];
  phase: string;
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

