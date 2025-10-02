/**
 * API client for Convex Hull backend
 */

import type { Point, ComputeResponse, GeneratePointsRequest, GeneratePointsResponse, Algorithm } from './types';

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
};

