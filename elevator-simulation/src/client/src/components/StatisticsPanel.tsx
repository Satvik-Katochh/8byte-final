/**
 * StatisticsPanel Component - Real-time simulation statistics
 * Shows performance metrics and statistics
 */

import React from "react";
import "./StatisticsPanel.css";

/**
 * Props for StatisticsPanel component
 */
interface StatisticsPanelProps {
  currentTime: number;
  pendingRequests: number;
  totalRequests: number;
  completedRequests: number;
  averageWaitTime: number;
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
}) => {
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate completion rate
  const completionRate =
    totalRequests > 0
      ? ((completedRequests / totalRequests) * 100).toFixed(1)
      : "0.0";

  // Calculate requests per minute
  const requestsPerMinute =
    currentTime > 0 ? ((totalRequests / currentTime) * 60).toFixed(1) : "0.0";

  return (
    <div className="statistics-panel panel">
      <h3>📊 Simulation Statistics</h3>

      <div className="stats-grid">
        {/* Time */}
        <div className="stat-item">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-label">Simulation Time</div>
            <div className="stat-value">{formatTime(currentTime)}</div>
          </div>
        </div>

        {/* Total Requests */}
        <div className="stat-item">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-label">Total Requests</div>
            <div className="stat-value">{totalRequests}</div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="stat-item">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-label">Pending Requests</div>
            <div className="stat-value">{pendingRequests}</div>
          </div>
        </div>

        {/* Completed Requests */}
        <div className="stat-item">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">Completed Requests</div>
            <div className="stat-value">{completedRequests}</div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="stat-item">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">Completion Rate</div>
            <div className="stat-value">{completionRate}%</div>
          </div>
        </div>

        {/* Requests per Minute */}
        <div className="stat-item">
          <div className="stat-icon">🚀</div>
          <div className="stat-content">
            <div className="stat-label">Requests/Minute</div>
            <div className="stat-value">{requestsPerMinute}</div>
          </div>
        </div>

        {/* Average Wait Time */}
        <div className="stat-item">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-label">Avg Wait Time</div>
            <div className="stat-value">{averageWaitTime.toFixed(1)}s</div>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="stat-item">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-label">Performance</div>
            <div className="stat-value">
              {averageWaitTime < 15
                ? "🟢 Excellent"
                : averageWaitTime < 30
                ? "🟡 Good"
                : averageWaitTime < 60
                ? "🟠 Fair"
                : "🔴 Poor"}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="performance-summary">
        <div className="summary-title">📋 Performance Summary</div>
        <div className="summary-content">
          <div className="summary-item">
            <span>Efficiency:</span>
            <span
              className={
                completionRate > 80
                  ? "good"
                  : completionRate > 60
                  ? "fair"
                  : "poor"
              }
            >
              {completionRate > 80
                ? "🟢 High"
                : completionRate > 60
                ? "🟡 Medium"
                : "🔴 Low"}
            </span>
          </div>
          <div className="summary-item">
            <span>Speed:</span>
            <span
              className={
                requestsPerMinute > 2
                  ? "good"
                  : requestsPerMinute > 1
                  ? "fair"
                  : "poor"
              }
            >
              {requestsPerMinute > 2
                ? "🟢 Fast"
                : requestsPerMinute > 1
                ? "🟡 Normal"
                : "🔴 Slow"}
            </span>
          </div>
          <div className="summary-item">
            <span>Wait Time:</span>
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
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;
