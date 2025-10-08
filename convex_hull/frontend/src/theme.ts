/**
 * Centralized theme configuration for the Template
 */

export const colors = {
  // Background colors
  background: {
    primary: '#242424',
    secondary: '#1a1a1a',
    tertiary: '#333',
  },
  
  // Border colors
  border: {
    primary: '#444',
    secondary: '#555',
    light: '#333',
  },
  
  // Text colors
  text: {
    primary: 'white',
    secondary: '#aaa',
    tertiary: '#888',
    quaternary: '#666',
  },
  
  // Action/Button colors
  action: {
    primary: '#535bf2',      // Purple/blue - primary actions, tabs, algorithm badges
    success: '#22c55e',      // Green - run/execute buttons
    info: '#3b82f6',         // Blue - informational elements
    danger: '#ef4444',       // Red - errors
    warning: '#f59e0b',      // Orange/yellow - warnings
    disabled: '#444',        // Gray - disabled state
  },
  
  // Hinzugefügt für Canvas und Convex Hull Visualizer
  canvas: {
    background: '#ffffff',
    point: '#3b82f6',
    hull: '#22c55e',
    active: '#ef4444',
    line: '#888',
  },
} as const;

export const spacing = {
  xs: '5px',
  sm: '10px',
  md: '15px',
  lg: '20px',
  xl: '24px',
} as const;

export const borderRadius = {
  sm: '4px',
  md: '6px',
  lg: '8px',
} as const;

export const fontSize = {
  xs: '12px',
  sm: '13px',
  md: '14px',
  base: '15px',
  lg: '16px',
} as const;

