/**
 * API client for Convex Hull backend
 */

import type { Point, ComputeResponse, GeneratePointsRequest, GeneratePointsResponse, Algorithm, PerformanceTestResult } from './types';

const API_BASE_URL = 'http://localhost:8000';

export const api = {
  /**
   * Generate random points
   */
  async generatePoints(request: GeneratePointsRequest): Promise<Point[]> {
    const response = await fetch(`${API_BASE_URL}/api/generate-points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate points: ${response.statusText}`);
    }
    
    const data: GeneratePointsResponse = await response.json();
    return data.points;
  },

  /**
   * Compute convex hull steps for given algorithm and points
   */
  async computeSteps(algorithm: Algorithm, points: Point[]): Promise<ComputeResponse> {
    const response = await fetch(`${API_BASE_URL}/api/compute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        algorithm,
        points,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to compute steps: ${errorText}`);
    }
    
    const data: ComputeResponse = await response.json();
    return data;
  },

  /**
   * Upload a file and run performance test
   */
  async uploadFile(file: File, algorithm: Algorithm): Promise<PerformanceTestResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('algorithm', algorithm);

    const response = await fetch(`${API_BASE_URL}/upload/`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to upload file: ${response.statusText}`);
    }
    
    const data: PerformanceTestResult = await response.json();
    return data;
  },

  /**
   * Generate points for performance testing (in memory)
   */
  async generatePointsPerformance(count: number, seed?: number): Promise<Point[]> {
    const params = new URLSearchParams({ count: count.toString() });
    if (seed !== undefined) {
      params.append('seed', seed.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/generate-points-performance?${params.toString()}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to generate points: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.points;
  },

  /**
   * Run performance test on in-memory points (generated or custom)
   */
  async runPerformanceTest(points: Point[], algorithm: Algorithm): Promise<PerformanceTestResult> {
    // Use the compute endpoint to run the algorithm
    const response = await fetch(`${API_BASE_URL}/api/compute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        algorithm,
        points,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to run performance test: ${errorText}`);
    }
    
    const data = await response.json();
    
    // Extract hull points from the last step
    const hullPoints = data.steps[data.steps.length - 1]?.hull || [];
    
    return {
      algorithm,
      input_points: points.length,
      hull_points: hullPoints,
      runtime_seconds: data.computation_time_seconds || 0,
    };
  },
};

