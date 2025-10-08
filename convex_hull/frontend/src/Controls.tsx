/**
 * Controls component for algorithm playback
 */

import type { Algorithm } from './types';
import { colors } from './theme';

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
  
  // Hull info
  hullPointsCount: number;
}

// Speed presets for slider (0-8 positions)
const SPEED_PRESETS = [0.5, 1, 2, 3, 5, 10, 20, 50, 100];

function speedToIndex(speed: number): number {
  const index = SPEED_PRESETS.indexOf(speed);
  return index >= 0 ? index : 1; // Default to 1x if not found
}

function indexToSpeed(index: number): number {
  return SPEED_PRESETS[index] || 1;
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
  hullPointsCount,
}: ControlsProps) {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: colors.background.primary, 
      borderRadius: '8px',
      marginBottom: '20px',
      position: 'relative'
    }}>
      {/* Hull Points Counter, zeigen wir nur wenn der Algorithmus fertig ist */}
      {hasSteps && currentStep === totalSteps - 1 && hullPointsCount > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          fontSize: '14px',
          color: colors.text.secondary
        }}>
          Hull Points: {hullPointsCount}
        </div>
      )}
      
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
              backgroundColor: colors.background.secondary,
              color: colors.text.primary,
              border: `1px solid ${colors.border.primary}`,
              borderRadius: '4px'
            }}
          />
          <button onClick={onGenerate} style={buttonStyle}>
            Generate Random
          </button>
          <button onClick={onClear} style={{ ...buttonStyle, backgroundColor: colors.text.quaternary }}>
            Clear All
          </button>
          <span style={{ color: colors.text.tertiary, marginLeft: '10px' }}>
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
              backgroundColor: colors.background.secondary,
              color: colors.text.primary,
              border: `1px solid ${colors.border.primary}`,
              borderRadius: '4px',
              minWidth: '200px',
              cursor: hasSteps ? 'not-allowed' : 'pointer',
              opacity: hasSteps ? 0.5 : 1
            }}
          >
            <option value="andrews">Andrews</option>
            <option value="quickhull">QuickHull</option>
          </select>
          <button 
            onClick={onRun} 
            disabled={!canRun || hasSteps}
            style={{
              ...buttonStyle,
              backgroundColor: canRun && !hasSteps ? colors.action.success : colors.action.disabled,
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
          <div style={{ marginBottom: '10px', color: colors.text.secondary }}>
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
            <button onClick={onReset} style={{ ...buttonStyle, backgroundColor: colors.text.quaternary }}>
              🔄 Reset
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: colors.background.secondary,
            borderRadius: '4px',
            marginBottom: '15px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${((currentStep + 1) / totalSteps) * 100}%`,
              height: '100%',
              backgroundColor: colors.action.success,
              transition: 'width 0.2s'
            }} />
          </div>

          {/* Speed control */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label htmlFor="speed" style={{ color: colors.text.secondary }}>Speed:</label>
              <input
                id="speed"
                type="range"
                min="0"
                max="8"
                step="1"
                value={speedToIndex(speed)}
                onChange={(e) => setSpeed(indexToSpeed(parseInt(e.target.value)))}
                style={{ flex: 1, maxWidth: '300px' }}
              />
              <span style={{ color: colors.text.secondary, minWidth: '60px', fontWeight: 'bold' }}>
                {speed}x
              </span>
            </div>
            {/* Speed tick labels */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              maxWidth: '300px',
              marginLeft: '70px',
              marginTop: '5px',
              fontSize: '11px',
              color: colors.text.quaternary
            }}>
              <span>0.5×</span>
              <span>1×</span>
              <span>2×</span>
              <span>3×</span>
              <span>5×</span>
              <span>10×</span>
              <span>20×</span>
              <span>50×</span>
              <span>100×</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: colors.action.primary,
  color: colors.text.primary,
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
};

