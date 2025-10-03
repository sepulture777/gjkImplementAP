/**
 * Controls component for algorithm playback
 */

import type { Algorithm } from './types';

interface ControlsProps {
  // Point generation
  onGenerate: () => void;
  onClear: () => void;
  pointCount: number;
  setPointCount: (count: number) => void;
  
  // Algorithm selection and execution
  algorithm: Algorithm;
  setAlgorithm: (algo: Algorithm) => void;
  onRun: () => void;
  canRun: boolean;
  
  // Playback controls (only shown when steps exist)
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  currentStep: number;
  totalSteps: number;
  hasSteps: boolean;
  
  // Speed control
  speed: number;
  setSpeed: (speed: number) => void;
}

export function Controls({
  onGenerate,
  onClear,
  pointCount,
  setPointCount,
  algorithm,
  setAlgorithm,
  onRun,
  canRun,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onReset,
  currentStep,
  totalSteps,
  hasSteps,
  speed,
  setSpeed,
}: ControlsProps) {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#242424', 
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      {/* Point Generation Section */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '10px' }}>1. Generate Points</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="number"
            value={pointCount}
            onChange={(e) => setPointCount(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max="200"
            style={{ 
              padding: '8px', 
              width: '80px',
              backgroundColor: '#1a1a1a',
              color: 'white',
              border: '1px solid #444',
              borderRadius: '4px'
            }}
          />
          <button onClick={onGenerate} style={buttonStyle}>
            Generate Random
          </button>
          <button onClick={onClear} style={{ ...buttonStyle, backgroundColor: '#666' }}>
            Clear All
          </button>
          <span style={{ color: '#888', marginLeft: '10px' }}>
            (or click canvas to add points)
          </span>
        </div>
      </div>

      {/* Algorithm Selection */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '10px' }}>2. Select Algorithm</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
            disabled={hasSteps}
            style={{ 
              padding: '8px', 
              backgroundColor: '#1a1a1a',
              color: 'white',
              border: '1px solid #444',
              borderRadius: '4px',
              minWidth: '200px',
              cursor: hasSteps ? 'not-allowed' : 'pointer',
              opacity: hasSteps ? 0.5 : 1
            }}
          >
            <option value="andrews">Andrew's Monotone Chain</option>
            <option value="quickhull">QuickHull</option>
          </select>
          <button 
            onClick={onRun} 
            disabled={!canRun || hasSteps}
            style={{
              ...buttonStyle,
              backgroundColor: canRun && !hasSteps ? '#22c55e' : '#444',
              cursor: canRun && !hasSteps ? 'pointer' : 'not-allowed'
            }}
          >
            Run Algorithm
          </button>
        </div>
      </div>

      {/* Playback Controls (only when steps exist) */}
      {hasSteps && (
        <div>
          <h3 style={{ marginTop: 0, marginBottom: '10px' }}>3. Playback Controls</h3>
          
          {/* Step info */}
          <div style={{ marginBottom: '10px', color: '#aaa' }}>
            Step {currentStep + 1} / {totalSteps}
          </div>

          {/* Control buttons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <button onClick={onPrev} disabled={currentStep === 0} style={buttonStyle}>
              ⏮ Prev
            </button>
            <button 
              onClick={isPlaying ? onPause : onPlay} 
              style={{ ...buttonStyle, minWidth: '100px' }}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button onClick={onNext} disabled={currentStep >= totalSteps - 1} style={buttonStyle}>
              Next ⏭
            </button>
            <button onClick={onReset} style={{ ...buttonStyle, backgroundColor: '#666' }}>
              🔄 Reset
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            marginBottom: '15px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${((currentStep + 1) / totalSteps) * 100}%`,
              height: '100%',
              backgroundColor: '#22c55e',
              transition: 'width 0.2s'
            }} />
          </div>

          {/* Speed control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label htmlFor="speed" style={{ color: '#aaa' }}>Speed:</label>
            <input
              id="speed"
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              style={{ flex: 1, maxWidth: '200px' }}
            />
            <span style={{ color: '#aaa', minWidth: '40px' }}>{speed}x</span>
          </div>
        </div>
      )}
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: '#535bf2',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
};

