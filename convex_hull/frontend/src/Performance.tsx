/**
 * Performance Testing component
 */

import { useState, useEffect, useRef } from 'react';
import { api } from './api';
import type { Algorithm, PerformanceTestResult } from './types';

export function Performance() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('andrews');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PerformanceTestResult[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  // Timer effect - starts when loading begins
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

  const handleRun = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await api.uploadFile(file, algorithm);
      setResults([result, ...results]); // show newest result on top
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run performance test');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearResults = () => {
    setResults([]);
  };

  // Format elapsed time -> only frontend display, what we get from the backend is in milliseconds and can vary from this time
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
        backgroundColor: '#242424',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '2px solid #444'
      }}>
        <p style={{ color: '#aaa', lineHeight: '1.6', marginBottom: '10px' }}>
          Upload a point dataset file to test algorithm performance. 
          The algorithm will run <strong>without visualization</strong>.
        </p>
        <div style={{
          padding: '15px',
          backgroundColor: '#1a1a1a',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#888'
        }}>
          <strong style={{ color: '#f59e0b' }}>File Format:</strong>
          <pre style={{ margin: '5px 0 0 0', color: '#aaa' }}>
            {`Line 1: n (number of points)
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
        backgroundColor: '#242424',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '2px solid #444'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>Test Configuration</h3>
          {/* Timer display - shown while running */}
          {isLoading && (
            <span style={{
              color: 'white',
              fontFamily: 'monospace',
              fontSize: '14px'
            }}>
              {formatTime(elapsedTime)}
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Algorithm selector */}
          <div>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px', fontSize: '14px' }}>
              Algorithm:
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
              style={{
                padding: '8px',
                backgroundColor: '#1a1a1a',
                color: 'white',
                border: '1px solid #444',
                borderRadius: '4px',
                minWidth: '150px',
                cursor: 'pointer'
              }}
            >
              <option value="andrews">Andrews</option>
              <option value="quickhull">QuickHull</option>
            </select>
          </div>

          {/* File input */}
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px', fontSize: '14px' }}>
              Dataset File:
            </label>
            <input
              type="file"
              accept=".txt,.csv"
              onChange={handleFileChange}
              style={{
                padding: '8px',
                backgroundColor: '#1a1a1a',
                color: 'white',
                border: '1px solid #444',
                borderRadius: '4px',
                width: '100%',
                maxWidth: '400px',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={!file || isLoading}
            style={{
              padding: '10px 24px',
              backgroundColor: file && !isLoading ? '#22c55e' : '#444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: file && !isLoading ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold',
              marginTop: '20px'
            }}
          >
            {isLoading ? 'Running...' : 'Run Test'}
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div style={{
            marginTop: '15px',
            padding: '12px',
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '6px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* File info */}
        {file && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#1a1a1a',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#aaa'
          }}>
            📁 Selected: <strong style={{ color: 'white' }}>{file.name}</strong> ({Math.round(file.size / 1024)} KB)
          </div>
        )}
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div style={{
          padding: '20px',
          backgroundColor: '#242424',
          borderRadius: '8px',
          border: '2px solid #444'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>Results</h3>
            <button
              onClick={handleClearResults}
              style={{
                padding: '6px 12px',
                backgroundColor: '#666',
                color: 'white',
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
                <tr style={{ borderBottom: '2px solid #444' }}>
                  <th style={tableHeaderStyle}>Algorithm</th>
                  <th style={tableHeaderStyle}>Input Points</th>
                  <th style={tableHeaderStyle}>Hull Points</th>
                  <th style={tableHeaderStyle}>Runtime (seconds)</th>
                  <th style={tableHeaderStyle}>Runtime (ms)</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #333' }}>
                    <td style={tableCellStyle}>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: '#535bf2',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {result.algorithm.toUpperCase()}
                      </span>
                    </td>
                    <td style={tableCellStyle}>{result.input_points.toLocaleString()}</td>
                    <td style={tableCellStyle}>{result.hull_points.length}</td>
                    <td style={tableCellStyle}>
                      <strong style={{ color: '#22c55e' }}>
                        {result.runtime_seconds.toFixed(6)}
                      </strong>
                    </td>
                    <td style={tableCellStyle}>
                      {(result.runtime_seconds * 1000).toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const tableHeaderStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'left',
  color: '#aaa',
  fontWeight: 'bold'
};

const tableCellStyle: React.CSSProperties = {
  padding: '12px',
  color: 'white'
};

