/**
 * ControlPanel Component - Simulation controls
 * Handles start/stop/reset, speed, floors, elevators, and request frequency
 */

import React from "react";
import "./ControlPanel.css";

/**
 * Props for ControlPanel component
 */
interface ControlPanelProps {
  isRunning: boolean;
  speed: number;
  totalFloors: number;
  totalElevators: number;
  requestFrequency: number;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onFloorsChange: (floors: number) => void;
  onElevatorsChange: (elevators: number) => void;
  onFrequencyChange: (frequency: number) => void;
}

/**
 * ControlPanel Component
 * Provides controls for the elevator simulation
 */
const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  speed,
  totalFloors,
  totalElevators,
  requestFrequency,
  onStart,
  onStop,
  onReset,
  onSpeedChange,
  onFloorsChange,
  onElevatorsChange,
  onFrequencyChange,
}) => {
  return (
    <div className="control-panel panel">
      <h3>🎮 Simulation Controls</h3>

      {/* Main Control Buttons */}
      <div className="main-controls">
        <button
          onClick={onStart}
          disabled={isRunning}
          className={isRunning ? "running" : ""}
        >
          ▶️ Start
        </button>

        <button onClick={onStop} disabled={!isRunning}>
          ⏸️ Stop
        </button>

        <button onClick={onReset}>🔄 Reset</button>
      </div>

      {/* Simulation Parameters */}
      <div className="controls-grid">
        {/* Speed Control */}
        <div className="control-group">
          <label>🚀 Speed</label>
          <select
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            disabled={isRunning}
          >
            <option value={1}>1x Normal</option>
            <option value={2}>2x Fast</option>
            <option value={5}>5x Very Fast</option>
            <option value={10}>10x Ultra Fast</option>
          </select>
        </div>

        {/* Floors Control */}
        <div className="control-group">
          <label>🏢 Floors</label>
          <input
            type="number"
            min="5"
            max="100"
            value={totalFloors}
            onChange={(e) => onFloorsChange(Number(e.target.value))}
            disabled={isRunning}
          />
        </div>

        {/* Elevators Control */}
        <div className="control-group">
          <label>🛗 Elevators</label>
          <input
            type="number"
            min="1"
            max="10"
            value={totalElevators}
            onChange={(e) => onElevatorsChange(Number(e.target.value))}
            disabled={isRunning}
          />
        </div>

        {/* Request Frequency Control */}
        <div className="control-group">
          <label>📊 Request Frequency</label>
          <input
            type="number"
            min="0.1"
            max="10"
            step="0.1"
            value={requestFrequency}
            onChange={(e) => onFrequencyChange(Number(e.target.value))}
            disabled={isRunning}
          />
          <small>requests/second</small>
        </div>
      </div>

      {/* Status Display */}
      <div className="status-display">
        <div
          className={`status-indicator ${isRunning ? "running" : "stopped"}`}
        >
          {isRunning ? "🟢 Running" : "🔴 Stopped"}
        </div>
        <div className="status-info">
          <span>Speed: {speed}x</span>
          <span>Floors: {totalFloors}</span>
          <span>Elevators: {totalElevators}</span>
          <span>Frequency: {requestFrequency}/sec</span>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
