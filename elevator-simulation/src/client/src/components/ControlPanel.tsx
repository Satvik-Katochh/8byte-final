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
  simulationHour?: number;
  isRushHour?: boolean;
  rushHourType?: string;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onFloorsChange: (floors: number) => void;
  onElevatorsChange: (elevators: number) => void;
  onFrequencyChange: (frequency: number) => void;
  onTestPriority: () => void;
  onTestMorningRush?: () => void;
  onTestEveningRush?: () => void;
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
  simulationHour = 9,
  isRushHour = false,
  rushHourType = "⏰ NORMAL HOURS",
  onStart,
  onStop,
  onReset,
  onSpeedChange,
  onFloorsChange,
  onElevatorsChange,
  onFrequencyChange,
  onTestPriority,
  onTestMorningRush = () => console.log("Morning rush not implemented"),
  onTestEveningRush = () => console.log("Evening rush not implemented"),
}) => {
  // Handle peak traffic scenario
  const handlePeakTraffic = () => {
    onFloorsChange(30); // 30 floors
    onElevatorsChange(6); // 6 elevators
    onFrequencyChange(2); // 2 requests/second
    console.log(
      "🚀 Peak traffic scenario activated: 30 floors, 6 elevators, 2 req/sec"
    );
  };

  return (
    <div className="control-panel panel">
      <h3>🎮 Simulation Controls</h3>

      {/* Rush Hour Status Indicator */}
      <div
        style={{
          padding: "10px",
          margin: "10px 0",
          background: isRushHour
            ? "rgba(255, 152, 0, 0.2)"
            : "rgba(100, 100, 100, 0.2)",
          border: `1px solid ${
            isRushHour ? "rgba(255, 152, 0, 0.5)" : "rgba(100, 100, 100, 0.5)"
          }`,
          borderRadius: "6px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "1.1rem",
            fontWeight: "bold",
            marginBottom: "5px",
          }}
        >
          {rushHourType}
        </div>
        <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>
          Simulation Time: {simulationHour}:00
        </div>
      </div>

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

        <button
          onClick={handlePeakTraffic}
          disabled={isRunning}
          style={{
            background: "rgba(255, 193, 7, 0.3)",
            borderColor: "rgba(255, 193, 7, 0.5)",
          }}
        >
          🚀 Peak Traffic
        </button>

        <button
          onClick={onTestPriority}
          disabled={isRunning}
          style={{
            background: "rgba(255, 99, 132, 0.3)",
            borderColor: "rgba(255, 99, 132, 0.5)",
          }}
        >
          ⚡ Test Priority
        </button>

        <button
          onClick={onTestMorningRush}
          disabled={isRunning}
          style={{
            background:
              isRushHour && rushHourType === "🌅 MORNING RUSH"
                ? "rgba(255, 152, 0, 0.5)"
                : "rgba(255, 152, 0, 0.3)",
            borderColor: "rgba(255, 152, 0, 0.5)",
          }}
        >
          🌅 Morning Rush
        </button>

        <button
          onClick={onTestEveningRush}
          disabled={isRunning}
          style={{
            background:
              isRushHour && rushHourType === "🌆 EVENING RUSH"
                ? "rgba(255, 193, 7, 0.5)"
                : "rgba(255, 193, 7, 0.3)",
            borderColor: "rgba(255, 193, 7, 0.5)",
          }}
        >
          🌆 Evening Rush
        </button>
      </div>

      {/* Simulation Parameters */}
      <div className="controls-grid">
        {/* Speed Control */}
        <div className="control-group">
          <label>🚀 Speed (Simulation Rate)</label>
          <select
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            disabled={isRunning}
          >
            <option value={1}>1x (100% Normal)</option>
            <option value={2}>2x (200% Fast)</option>
            <option value={5}>5x (500% Very Fast)</option>
            <option value={10}>10x (1000% Ultra Fast)</option>
          </select>
        </div>

        {/* Floors Control */}
        <div className="control-group">
          <label>🏢 Floors</label>
          <input
            type="number"
            min="1"
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
          <span>
            Speed: {speed}x ({speed * 100}%)
          </span>
          <span>Floors: {totalFloors}</span>
          <span>Elevators: {totalElevators}</span>
          <span>Frequency: {requestFrequency}/sec</span>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
