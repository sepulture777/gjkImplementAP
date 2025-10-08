/**
 * Performance Testing component
 */

import { useState, useEffect, useRef } from 'react';
import { api } from './api';
import type { Algorithm, PerformanceTestResult, Point } from './types';
import { colors } from './theme';

export function Performance() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('andrews');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PerformanceTestResult[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<number | null>(null);
  
  // Generated points state
  const [pointCount, setPointCount] = useState<number>(1000);
  const [seed, setSeed] = useState<string>('');
  const [generatedPoints, setGeneratedPoints] = useState<Point[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Mode selection
  const [mode, setMode] = useState<'upload' | 'generate'>('upload');
  
  // Accordion state, track which result index is expanded, Momentan kann nur ein Resultat expanded werden
  const [expandedResultIndex, setExpandedResultIndex] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setGeneratedPoints(null); // Clear generated points when selecting file
      setError(null);
    }
  };

  // Timer effect - starts when loading begins
  // DIESER TIMER IST NICHT DIE PERFORMANCE METRIK, DIE WIR MIT DEM BACKEND BEKOMMEN
  useEffect(() => {
    if (isLoading) {
      setElapsedTime(0);
      const startTime = Date.now();
      
      timerRef.current = window.setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 100); // Update every 100ms
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [isLoading]);

  const handleGeneratePoints = async () => {
    setError(null);
    setIsGenerating(true);
    
    try {
      const seedValue = seed.trim() !== '' ? parseInt(seed) : undefined;
      const points = await api.generatePointsPerformance(pointCount, seedValue);
      setGeneratedPoints(points);
      setFile(null); // Clear file selection when generating points
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate points');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRun = async () => {
    // Check if we have either file or generated points
    if (!file && !generatedPoints) {
      setError('Please select a file or generate points first');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      let result: PerformanceTestResult;
      
      if (generatedPoints) {
        // Use generated points
        result = await api.runPerformanceTest(generatedPoints, algorithm);
      } else if (file) {
        // Use uploaded file
        result = await api.uploadFile(file, algorithm);
      } else {
        throw new Error('No data source available');
      }
      
      setResults([result, ...results]); // show newest result on top
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run performance test');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearResults = () => {
    setResults([]);
    setExpandedResultIndex(null); // Close any expanded accordion
  };

  const toggleResultExpansion = (index: number) => {
    setExpandedResultIndex(expandedResultIndex === index ? null : index);
  };

  // Format elapsed time --> only frontend disply, what we get from the backend is in milliseconds and can vary from this time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs.toFixed(2)}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs.toFixed(2)}s`;
    } else {
      return `${secs.toFixed(2)}s`;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Instructions */}
      <div style={{
        padding: '20px',
        backgroundColor: colors.background.primary,
        borderRadius: '8px',
        marginBottom: '20px',
        border: `2px solid ${colors.border.primary}`
      }}>
        <p style={{ color: colors.text.secondary, lineHeight: '1.6', marginBottom: '10px' }}>
          Upload a point dataset file to test algorithm performance. 
          The algorithm will run <strong>without visualization</strong>.
        </p>
        <div style={{
          padding: '15px',
          backgroundColor: colors.background.secondary,
          borderRadius: '6px',
          fontSize: '14px',
          color: colors.text.tertiary
        }}>
          <strong style={{ color: colors.action.warning }}>File Format:</strong>
          <pre style={{ margin: '5px 0 0 0', color: colors.text.secondary }}>
            {`  
            Line 1: n (number of points)
            Lines 2..n+1: x,y (coordinates)

            Example:
            4
            0.0,0.0
            10.0,0.0
            10.0,10.0
            0.0,10.0`}
          </pre>
        </div>
      </div>

      {/* Upload Controls */}
      <div style={{
        padding: '20px',
        backgroundColor: colors.background.primary,
        borderRadius: '8px',
        marginBottom: '20px',
        border: `2px solid ${colors.border.primary}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>Test Configuration</h3>
          {/* Timer display, this is only shown while running */}
          {isLoading && (
            <span style={{
              color: colors.text.primary,
              fontFamily: 'monospace',
              fontSize: '14px'
            }}>
              {formatTime(elapsedTime)}
            </span>
          )}
        </div>

        {/* Algorithm selector */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', color: colors.text.secondary, marginBottom: '5px', fontSize: '14px' }}>
            Algorithm:
          </label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
            style={{
              padding: '8px',
              backgroundColor: colors.background.secondary,
              color: colors.text.primary,
              border: `1px solid ${colors.border.primary}`,
              borderRadius: '4px',
              minWidth: '150px',
              cursor: 'pointer'
            }}
          >
            <option value="andrews">Andrews</option>
            <option value="quickhull">QuickHull</option>
          </select>
        </div>

        {/* Mode selector tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button
            onClick={() => setMode('upload')}
            style={{
              padding: '8px 20px',
              backgroundColor: mode === 'upload' ? colors.action.primary : colors.background.tertiary,
              color: colors.text.primary,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: mode === 'upload' ? 'bold' : 'normal',
              transition: 'background-color 0.2s'
            }}
          >
            Upload File
          </button>
          <button
            onClick={() => setMode('generate')}
            style={{
              padding: '8px 20px',
              backgroundColor: mode === 'generate' ? colors.action.primary : colors.background.tertiary,
              color: colors.text.primary,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: mode === 'generate' ? 'bold' : 'normal',
              transition: 'background-color 0.2s'
            }}
          >
            Generate Points
          </button>
        </div>

        {/* Upload Mode */}
        {mode === 'upload' && (
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: colors.text.secondary, marginBottom: '5px', fontSize: '14px' }}>
                Dataset File:
              </label>
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileChange}
                style={{
                  padding: '8px',
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: '4px',
                  width: '100%',
                  maxWidth: '400px',
                  cursor: 'pointer'
                }}
              />
            </div>
            <button
              onClick={handleRun}
              disabled={!file || isLoading}
              style={{
                padding: '10px 24px',
                backgroundColor: file && !isLoading ? colors.action.success : colors.action.disabled,
                color: colors.text.primary,
                border: 'none',
                borderRadius: '4px',
                cursor: file && !isLoading ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {isLoading ? 'Running...' : 'Run Test'}
            </button>
          </div>
        )}

        {/* Generate Mode */}
        {mode === 'generate' && (
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', color: colors.text.secondary, marginBottom: '5px', fontSize: '14px' }}>
                Number of Points:
              </label>
              <input
                type="number"
                min="1"
                value={pointCount}
                onChange={(e) => setPointCount(parseInt(e.target.value) || 1)}
                disabled={isGenerating}
                style={{
                  padding: '8px',
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: '4px',
                  width: '150px',
                  cursor: isGenerating ? 'not-allowed' : 'text'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: colors.text.secondary, marginBottom: '5px', fontSize: '14px' }}>
                Seed (optional):
              </label>
              <input
                type="text"
                placeholder="Random"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                disabled={isGenerating}
                style={{
                  padding: '8px',
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: '4px',
                  width: '120px',
                  cursor: isGenerating ? 'not-allowed' : 'text'
                }}
              />
            </div>
            <button
              onClick={handleGeneratePoints}
              disabled={isGenerating || pointCount < 1}
              style={{
                padding: '10px 20px',
                backgroundColor: !isGenerating && pointCount >= 1 ? colors.action.primary : colors.action.disabled,
                color: colors.text.primary,
                border: 'none',
                borderRadius: '4px',
                cursor: !isGenerating && pointCount >= 1 ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
            <button
              onClick={handleRun}
              disabled={!generatedPoints || isLoading}
              style={{
                padding: '10px 24px',
                backgroundColor: generatedPoints && !isLoading ? colors.action.success : colors.action.disabled,
                color: colors.text.primary,
                border: 'none',
                borderRadius: '4px',
                cursor: generatedPoints && !isLoading ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: 'bold',
                marginLeft: 'auto'
              }}
            >
              {isLoading ? 'Running...' : 'Run Test'}
            </button>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div style={{
            marginTop: '15px',
            padding: '12px',
            backgroundColor: colors.action.danger,
            color: colors.text.primary,
            borderRadius: '6px'
          }}>
            {error}
          </div>
        )}

        {/* File info */}
        {file && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: colors.background.secondary,
            borderRadius: '6px',
            fontSize: '14px',
            color: colors.text.secondary
          }}>
            Selected: <strong style={{ color: colors.text.primary }}>{file.name}</strong> ({Math.round(file.size / 1024)} KB)
          </div>
        )}

        {/* Generated points info */}
        {generatedPoints && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: colors.background.secondary,
            borderRadius: '6px',
            fontSize: '14px',
            color: colors.text.secondary
          }}>
            Generated: <strong>{generatedPoints.length.toLocaleString()}</strong> points 
            {seed && <span> (seed: <strong>{seed}</strong>)</span>}
          </div>
        )}
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div style={{
          padding: '20px',
          backgroundColor: colors.background.primary,
          borderRadius: '8px',
          border: `2px solid ${colors.border.primary}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>Results</h3>
            <button
              onClick={handleClearResults}
              style={{
                padding: '6px 12px',
                backgroundColor: colors.text.quaternary,
                color: colors.text.primary,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Clear All
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${colors.border.primary}` }}>
                  <th style={tableHeaderStyle}>Algorithm</th>
                  <th style={tableHeaderStyle}>Input Points</th>
                  <th style={tableHeaderStyle}>Hull Points</th>
                  <th style={tableHeaderStyle}>Runtime (seconds)</th>
                  <th style={tableHeaderStyle}>Runtime (ms)</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <>
                    <tr 
                      key={index} 
                      onClick={() => toggleResultExpansion(index)}
                      style={{ 
                        borderBottom: expandedResultIndex === index ? 'none' : `1px solid ${colors.border.light}`,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.background.secondary}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={tableCellStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: colors.text.secondary, fontSize: '12px' }}>
                            {expandedResultIndex === index ? '▼' : '▶'}
                          </span>
                          <span style={{
                            padding: '4px 8px',
                            backgroundColor: colors.action.primary,
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {result.algorithm.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td style={tableCellStyle}>{result.input_points.toLocaleString()}</td>
                      <td style={tableCellStyle}>{result.hull_points.length}</td>
                      <td style={tableCellStyle}>
                        <strong style={{ color: colors.action.success }}>
                          {result.runtime_seconds.toFixed(6)}
                        </strong>
                      </td>
                      <td style={tableCellStyle}>
                        {(result.runtime_seconds * 1000).toFixed(3)}
                      </td>
                    </tr>
                    {/* Expanded hull points section */}
                    {expandedResultIndex === index && (
                      <tr key={`${index}-expanded`}>
                        <td colSpan={5} style={{ 
                          padding: '15px 20px',
                          backgroundColor: colors.background.secondary,
                          borderBottom: `1px solid ${colors.border.light}`
                        }}>
                          <div>
                            <h4 style={{ 
                              margin: '0 0 10px 0', 
                              color: colors.text.primary,
                              fontSize: '14px'
                            }}>
                              Hull Points ({result.hull_points.length} points)
                            </h4>
                            <div style={{
                              maxHeight: '300px',
                              overflowY: 'auto',
                              padding: '10px',
                              backgroundColor: colors.background.primary,
                              borderRadius: '4px',
                              border: `1px solid ${colors.border.primary}`
                            }}>
                              <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(5, 1fr)',
                                gap: '8px',
                                fontSize: '13px',
                                fontFamily: 'monospace'
                              }}>
                                {result.hull_points.map((point, pointIndex) => (
                                  <div 
                                    key={pointIndex}
                                    style={{
                                      padding: '6px 10px',
                                      backgroundColor: colors.background.secondary,
                                      borderRadius: '4px',
                                      border: `1px solid ${colors.border.light}`,
                                      color: colors.text.primary
                                    }}
                                  >
                                    <span style={{ color: colors.text.tertiary }}>{pointIndex + 1}:</span> ({point[0].toFixed(2)}, {point[1].toFixed(2)})
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Style für die Tabelle
const tableHeaderStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'left',
  color: colors.text.secondary,
  fontWeight: 'bold'
};

// Style für die Zellen in der Tabelle
const tableCellStyle: React.CSSProperties = {
  padding: '12px',
  color: colors.text.primary
};

