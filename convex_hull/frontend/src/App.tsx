/**
 * Main App component for Convex Hull Visualizer
 */

import { useState, useEffect } from 'react';
import { Canvas } from './Canvas';
import { Controls } from './Controls';
import { api } from './api';
import type { Point, AlgorithmStep, Algorithm } from './types';
import './App.css';

function App() {
  // Point management
  const [points, setPoints] = useState<Point[]>([]);
  const [pointCount, setPointCount] = useState(50);

  // Algorithm state
  const [algorithm, setAlgorithm] = useState<Algorithm>('andrews');
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Generate random points
  const handleGenerate = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const newPoints = await api.generatePoints({ 
        count: pointCount, 
        x_max: 800, 
        y_max: 600 
      });
      setPoints(newPoints);
      setSteps([]);
      setCurrentStepIndex(0);
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

  // Add point manually
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

    setError(null);
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

  // Playback controls
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsPlaying(false);
    }
  };
  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;

    const interval = setInterval(() => {
      setCurrentStepIndex((current) => {
        if (current >= steps.length - 1) {
          setIsPlaying(false);
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
        {/* Header */}
        <header style={{ marginBottom: '30px' }}>
          <h1 style={{ margin: '0 0 10px 0' }}>
            Convex Hull Visualizer
          </h1>
        </header>

        {/* Error display */}
        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div style={{
            padding: '12px',
            backgroundColor: '#535bf2',
            color: 'white',
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            ⏳ Loading...
          </div>
        )}

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
        />

        {/* Canvas and step info */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <Canvas
              points={points}
              currentStep={currentStep}
              onAddPoint={handleAddPoint}
              canEdit={steps.length === 0 && !isLoading}
              isLastStep={currentStepIndex === steps.length - 1}
            />
            <div style={{ 
              marginTop: '10px', 
              color: '#888',
              fontSize: '14px'
            }}>
              Points: {points.length}
              {steps.length === 0 && ' (click canvas to add more)'}
            </div>
          </div>

          {/* Step info */}
          {currentStep && (
            <div style={{
              flex: 1,
              minWidth: '300px',
              padding: '20px',
              backgroundColor: '#242424',
              borderRadius: '8px',
              border: '2px solid #444'
            }}>
              <h3 style={{ marginTop: 0 }}>Current Step</h3>
              <div style={{ 
                display: 'inline-block',
                padding: '4px 12px',
                backgroundColor: currentStepIndex === steps.length - 1 ? '#22c55e' : '#3b82f6',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                marginBottom: '15px'
              }}>
                {currentStepIndex === steps.length - 1 ? 'COMPLETE' : 'IN PROGRESS'}
              </div>
              <div style={{ marginTop: '15px', fontSize: '14px', color: '#aaa' }}>
                <div>Hull points: {currentStep.hull.length}</div>
                <div>Active/changed: {currentStep.active.length}</div>
              </div>
            </div>
          )}

          {/* Instructions when points exist but no steps */}
          {!currentStep && points.length > 0 && (
            <div style={{
              flex: 1,
              minWidth: '300px',
              padding: '20px',
              backgroundColor: '#242424',
              borderRadius: '8px',
              border: '2px solid #444'
            }}>
              <h3 style={{ marginTop: 0 }}>Ready to Run!</h3>
              <div style={{ color: '#aaa', lineHeight: '1.6' }}>
                <p>You have <strong style={{ color: 'white' }}>{points.length} points</strong> ready.</p>
                <p>Select an algorithm and click <strong style={{ color: '#22c55e' }}>"Run Algorithm"</strong> to see the visualization.</p>
                <div style={{ 
                  marginTop: '15px', 
                  padding: '10px', 
                  backgroundColor: '#1a1a1a',
                  borderRadius: '4px',
                  fontSize: '13px'
                }}>
                  💡 <strong>Tip:</strong> After watching one algorithm, click "Reset" to try the other algorithm on the same points and compare!
                </div>
              </div>
            </div>
          )}

          {/* Initial instructions */}
          {!currentStep && points.length === 0 && (
            <div style={{
              flex: 1,
              minWidth: '300px',
              padding: '20px',
              backgroundColor: '#242424',
              borderRadius: '8px',
              border: '2px solid #444'
            }}>
              <h3 style={{ marginTop: 0 }}>Getting Started</h3>
              <ol style={{ lineHeight: '1.8', color: '#aaa' }}>
                <li>Generate random points or click the canvas to add points manually</li>
                <li>Select an algorithm (Andrew's or QuickHull)</li>
                <li>Click "Run Algorithm" to compute the convex hull</li>
                <li>Use playback controls to step through the algorithm</li>
                <li><strong>Compare algorithms:</strong> Click "Reset", switch algorithm, run again on same points!</li>
              </ol>
              <div style={{ 
                marginTop: '20px', 
                padding: '10px', 
                backgroundColor: '#1a1a1a',
                borderRadius: '4px',
                fontSize: '13px'
              }}>
                <strong>Legend:</strong>
                <div style={{ marginTop: '8px' }}>
                  <div>🔵 Gray dots = All points</div>
                  <div>🟢 Green dots = Hull points</div>
                  <div>🟡 Yellow dots = Active points</div>
                  <div>🔴 Red line = Hull in progress</div>
                  <div>🟢 Green line = Complete hull</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer style={{ 
          marginTop: '40px', 
          paddingTop: '20px',
          borderTop: '1px solid #444',
          color: '#666',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          Backend: FastAPI @ localhost:8000 | Frontend: React + Vite
        </footer>
      </div>
    </div>
  );
}

export default App;
