/**
 * Main App component for Convex Hull Visualizer
 */

import { useState, useEffect } from 'react';
import { Canvas } from './Canvas';
import { Controls } from './Controls';
import { Performance } from './Performance';
import { api } from './api';
import type { Point, AlgorithmStep, Algorithm, AppMode } from './types';
import { colors } from './theme';
import './App.css';

function App() {
  // App mode visualization or performance
  const [mode, setMode] = useState<AppMode>('visualization');

  // Canvas dimensions
  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 700;
  const CANVAS_MARGIN = 30;

  // State for the set of points to visualize and the number of points to generate
  const [points, setPoints] = useState<Point[]>([]);
  const [pointCount, setPointCount] = useState(50); // default 50

  // Algorithm state
  const [algorithm, setAlgorithm] = useState<Algorithm>('andrews');
  const [steps, setSteps] = useState<AlgorithmStep[]>([]); // holds the algorithm steps for visualization that we get from backend
  const [currentStepIndex, setCurrentStepIndex] = useState(0); 

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // For error messages, needed when Backend fails or not reachable
  const [error, setError] = useState<string | null>(null);
  // Loading state, needed when generating points or running algorithm
  const [isLoading, setIsLoading] = useState(false);

  // Generate random points
  const handleGenerate = async () => {
    setError(null);
    setIsLoading(true);
    try {
      // calls backend generator.py/generate_points function, with the canvas dimensions
      // Margin abziehen, damit die Border nicht überschritten wird
      const newPoints = await api.generatePoints({ 
        count: pointCount, 
        x_max: CANVAS_WIDTH - 2 * CANVAS_MARGIN,
        y_max: CANVAS_HEIGHT - 2 * CANVAS_MARGIN
      });
      // Offset points by margin, backend returns points in the range 0 to x_max and 0 to y_max.
      // Deswegen müssen wir: add margin to keep them within the canvas.
      const offsetPoints = newPoints.map(([x, y]) => [
        x + CANVAS_MARGIN, 
        y + CANVAS_MARGIN
      ] as Point);
      setPoints(offsetPoints);
      setSteps([]); // make sure previous steps are cleared
      setCurrentStepIndex(0); // show first step
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate points');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all points
  const handleClear = () => {
    setPoints([]);
    setSteps([]);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Add point by clicking
  const handleAddPoint = (point: Point) => {
    if (steps.length === 0) {
      setPoints([...points, point]);
    }
  };

  // Run algorithm
  const handleRun = async () => {
    if (points.length < 3) {
      setError('Need at least 3 points to compute convex hull');
      return;
    }

    setError(null); // clear error if there was one
    setIsLoading(true);
    try {
      const result = await api.computeSteps(algorithm, points);
      setSteps(result.steps);
      setCurrentStepIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compute steps');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to beginning (clears steps but keeps points for comparison)
  const handleReset = () => {
    setSteps([]);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Visualization controls
  // use step index to navigate through the steps
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsPlaying(false); // stop playing at the end
    }
  };
  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Auto-play is triggered by the play button which sets isPlaying to true, 
  // navigates through the steps at the speed set in the controls
  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;

    const interval = setInterval(() => {
      setCurrentStepIndex((current) => {
        if (current >= steps.length - 1) {
          setIsPlaying(false);// stop playing at the end
          return current;
        }
        return current + 1;
      });
    }, 1000 / speed);

    return () => clearInterval(interval); 
  }, [isPlaying, steps.length, speed]);

  const currentStep = steps.length > 0 ? steps[currentStepIndex] : null;

  return (
    <div style={{ 
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#1a1a1a',
      color: 'white'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <header style={{ marginBottom: '30px' }}>
          <h1 style={{ margin: '0 0 15px 0' }}>
            Convex Hull
          </h1>
          
          {/* Mode selection */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setMode('visualization')}
              style={{
                padding: '10px 20px',
                backgroundColor: mode === 'visualization' ? colors.action.primary : colors.background.primary,
                color: colors.text.primary,
                border: mode === 'visualization' ? `2px solid ${colors.action.primary}` : `2px solid ${colors.border.primary}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: mode === 'visualization' ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              Visualizer
            </button>
            <button
              onClick={() => setMode('performance')}
              style={{
                padding: '10px 20px',
                backgroundColor: mode === 'performance' ? colors.action.primary : colors.background.primary,
                color: colors.text.primary,
                border: mode === 'performance' ? `2px solid ${colors.action.primary}` : `2px solid ${colors.border.primary}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: mode === 'performance' ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              Performance Testing
            </button>
          </div>
        </header>

        {/* Display error: Backend fails, Backend not reachable, benutzt zum Debuggen, remove danach? */}
        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: colors.action.danger,
            color: colors.text.primary,
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            !! {error}
          </div>
        )}

        {/* Loading indication, wir sehen diesen fast nie weil es so schnell geht */}
        {mode === 'visualization' && isLoading && (
          <div style={{
            padding: '12px',
            backgroundColor: colors.action.primary,
            color: colors.text.primary,
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            Loading...
          </div>
        )}

        {/* Visualization */}
        {mode === 'visualization' && (
          <div>
            {/* Controls */}
            <Controls
              onGenerate={handleGenerate}
              onClear={handleClear}
              pointCount={pointCount}
              setPointCount={setPointCount}
              algorithm={algorithm}
              setAlgorithm={setAlgorithm}
              onRun={handleRun}
              canRun={points.length >= 3 && !isLoading}
              isPlaying={isPlaying}
              onPlay={handlePlay}
              onPause={handlePause}
              onNext={handleNext}
              onPrev={handlePrev}
              onReset={handleReset}
              currentStep={currentStepIndex}
              totalSteps={steps.length}
              hasSteps={steps.length > 0}
              speed={speed}
              setSpeed={setSpeed}
              hullPointsCount={currentStep?.hull.length || 0}
            />

            {/* Canvas and step info */}
            <div
              style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <Canvas
                  points={points}
                  currentStep={currentStep}
                  onAddPoint={handleAddPoint}
                  canEdit={steps.length === 0 && !isLoading}
                  isLastStep={currentStepIndex === steps.length - 1}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  margin={CANVAS_MARGIN}
                />
                <div
                  style={{
                    marginTop: '10px',
                    color: '#888',
                    fontSize: '14px',
                  }}
                >
                  Points: {points.length}
                  {steps.length === 0 && ' (click canvas to add more)'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Mode */}
        {mode === 'performance' && (
          <Performance />
        )}

        {/* Footer */}
        <footer style={{ 
          marginTop: '40px', 
          paddingTop: '20px',
          borderTop: '1px solid #444',
          color: '#666',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          Backend: Python + FastAPI | Frontend: React + Vite
        </footer>
      </div>
    </div>
  );
}

export default App;
