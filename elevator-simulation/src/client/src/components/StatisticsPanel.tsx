/**
 * StatisticsPanel Component - Real-time simulation statistics
 * Shows performance metrics and statistics
 */

import React from "react";
import "./StatisticsPanel.css";

/**
 * Request log entry interface
 */
interface RequestLogEntry {
  id: string;
  type: "manual" | "auto";
  fromFloor: number;
  toFloor: number;
  timestamp: string;
  status: "pending" | "completed";
  priority?: number;
  assignedElevatorId?: number;
}

/**
 * Props for StatisticsPanel component
 */
interface StatisticsPanelProps {
  currentTime: number;
  pendingRequests: number;
  totalRequests: number;
  completedRequests: number;
  averageWaitTime: number;
  maxWaitTime: number;
  averageTravelTime: number;
  elevatorUtilization: number;
  requestLog?: RequestLogEntry[];
}

/**
 * StatisticsPanel Component
 * Displays real-time statistics about the simulation
 */
const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  currentTime,
  pendingRequests,
  totalRequests,
  completedRequests,
  averageWaitTime,
  maxWaitTime,
  averageTravelTime,
  elevatorUtilization,
  requestLog = [],
}) => {
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Format timestamp for request log
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="statistics-panel panel">
      <h3>📊 Simulation Statistics</h3>

      <div className="stats-grid">
        {/* REQUIRED METRICS - From requirements.md */}

        {/* Average Wait Time - REQUIRED */}
        <div className="stat-item">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-label">Average Wait Time</div>
            <div className="stat-value">{averageWaitTime.toFixed(1)}s</div>
          </div>
        </div>

        {/* Max Wait Time - REQUIRED */}
        <div className="stat-item">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-label">Max Wait Time</div>
            <div className="stat-value">{maxWaitTime.toFixed(1)}s</div>
          </div>
        </div>

        {/* Average Travel Time - REQUIRED */}
        <div className="stat-item">
          <div className="stat-icon">🚀</div>
          <div className="stat-content">
            <div className="stat-label">Average Travel Time</div>
            <div className="stat-value">{averageTravelTime.toFixed(1)}s</div>
          </div>
        </div>

        {/* Elevator Utilization Rate - REQUIRED */}
        <div className="stat-item">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Elevator Utilization Rate</div>
            <div className="stat-value">{elevatorUtilization.toFixed(1)}%</div>
          </div>
        </div>

        {/* INFORMATIVE METRICS - Shows system performance */}

        {/* Simulation Time - Shows test duration */}
        <div className="stat-item">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-label">Simulation Time</div>
            <div className="stat-value">{formatTime(currentTime)}</div>
          </div>
        </div>

        {/* Total Requests - Shows system load */}
        <div className="stat-item">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-label">Total Requests</div>
            <div className="stat-value">{totalRequests}</div>
          </div>
        </div>

        {/* Completed Requests - Shows system efficiency */}
        <div className="stat-item">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">Completed Requests</div>
            <div className="stat-value">{completedRequests}</div>
          </div>
        </div>

        {/* Pending Requests - Shows current load */}
        <div className="stat-item">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-label">Pending Requests</div>
            <div className="stat-value">
              {pendingRequests <= 2
                ? "🟢 Low"
                : pendingRequests > 5
                ? "🟡 Medium"
                : "🟢 Low"}
            </div>
          </div>
        </div>
      </div>

      {/* Request Log Section */}
      <div className="request-log-section">
        <div className="section-title">📋 Request Log</div>
        <div className="request-log-container">
          {requestLog.length === 0 ? (
            <div className="no-requests">
              No requests yet. Start the simulation to see activity.
            </div>
          ) : (
            <div className="request-log-list">
              {requestLog
                .slice(-10)
                .reverse()
                .map((request) => (
                  <div
                    key={request.id}
                    className={`request-log-item ${request.status}`}
                  >
                    <div className="request-info">
                      <div className="request-type">
                        {request.type === "manual" ? "🎛️ Manual" : "🤖 Auto"}
                      </div>
                      <div className="request-route">
                        Floor {request.fromFloor} → Floor {request.toFloor}
                      </div>
                      <div className="request-time">
                        {formatTimestamp(request.timestamp)}
                      </div>
                    </div>
                    <div className="request-status">
                      <div className={`status-badge ${request.status}`}>
                        {request.status === "completed"
                          ? "✅ Completed"
                          : "⏳ Pending"}
                      </div>
                      {request.assignedElevatorId && (
                        <div className="elevator-assignment">
                          🛗 Elevator {request.assignedElevatorId}
                        </div>
                      )}
                      {request.priority && request.status === "pending" && (
                        <div className="priority-indicator">
                          Priority: {request.priority.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Performance Summary - Shows high-level assessment */}
      <div className="performance-summary">
        <div className="summary-title">📋 Performance Summary</div>
        <div className="summary-content">
          <div className="summary-item">
            <span>Overall Performance:</span>
            <span
              className={
                averageWaitTime < 15 &&
                totalRequests > 0 &&
                completedRequests / totalRequests > 0.8
                  ? "good"
                  : averageWaitTime < 30 &&
                    totalRequests > 0 &&
                    completedRequests / totalRequests > 0.6
                  ? "fair"
                  : "poor"
              }
            >
              {averageWaitTime < 15 &&
              totalRequests > 0 &&
              completedRequests / totalRequests > 0.8
                ? "🟢 Excellent"
                : averageWaitTime < 30 &&
                  totalRequests > 0 &&
                  completedRequests / totalRequests > 0.6
                ? "🟡 Good"
                : "🔴 Poor"}
            </span>
          </div>
          <div className="summary-item">
            <span>System Load:</span>
            <span
              className={
                pendingRequests <= 2
                  ? "good"
                  : pendingRequests <= 5
                  ? "fair"
                  : "poor"
              }
            >
              {pendingRequests <= 2
                ? "🟢 Light"
                : pendingRequests <= 5
                ? "🟡 Moderate"
                : "🔴 Heavy"}
            </span>
          </div>
          <div className="summary-item">
            <span>Response Quality:</span>
            <span
              className={
                averageWaitTime < 15
                  ? "good"
                  : averageWaitTime < 30
                  ? "fair"
                  : "poor"
              }
            >
              {averageWaitTime < 15
                ? "🟢 Quick"
                : averageWaitTime < 30
                ? "🟡 Acceptable"
                : "🔴 Slow"}
            </span>
          </div>
          <div className="summary-item">
            <span>Efficiency:</span>
            <span
              className={
                totalRequests > 0 && completedRequests / totalRequests > 0.8
                  ? "good"
                  : totalRequests > 0 && completedRequests / totalRequests > 0.6
                  ? "fair"
                  : "poor"
              }
            >
              {totalRequests > 0 && completedRequests / totalRequests > 0.8
                ? "🟢 High"
                : totalRequests > 0 && completedRequests / totalRequests > 0.6
                ? "🟡 Medium"
                : "🔴 Low"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;
