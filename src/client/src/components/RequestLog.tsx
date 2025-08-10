/**
 * RequestLog Component - Minimal request tracking
 * Shows elevator requests in a compact, scrollable format
 */

import React from "react";
import "./RequestLog.css";

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
 * Props for RequestLog component
 */
interface RequestLogProps {
  requestLog: RequestLogEntry[];
}

/**
 * RequestLog Component
 * Displays requests in a minimal, compact format
 */
const RequestLog: React.FC<RequestLogProps> = ({ requestLog }) => {
  // Format timestamp properly
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        // If timestamp is invalid, try to parse it as a time string
        const timeMatch = timestamp.match(/(\d{1,2}):(\d{2}):(\d{2})/);
        if (timeMatch) {
          const [, hours, minutes, seconds] = timeMatch;
          return `${hours}:${minutes}:${seconds}`;
        }
        return "Invalid Time";
      }
      return date.toLocaleTimeString();
    } catch (error) {
      return "Invalid Time";
    }
  };

  return (
    <div className="request-log-panel">
      <h3>📋 Request Log</h3>
      <div className="request-log-container">
        {requestLog.length === 0 ? (
          <div className="no-requests">
            No requests yet. Start simulation to see activity.
          </div>
        ) : (
          <div className="request-log-list">
            {requestLog
              .slice(-20)
              .reverse()
              .map((request) => (
                <div
                  key={request.id}
                  className={`request-log-item ${request.status}`}
                >
                  <div className="request-type-icon">
                    {request.type === "manual" ? "🎛️" : "🤖"}
                  </div>
                  <div className="request-route">
                    <span
                      className={`route-text ${
                        request.status === "completed" ? "completed" : ""
                      }`}
                    >
                      Floor {request.fromFloor} → Floor {request.toFloor}
                    </span>
                  </div>
                  <div className="request-elevator">
                    {request.assignedElevatorId ? (
                      <span className="elevator-badge">
                        🛗 Elevator {request.assignedElevatorId}
                      </span>
                    ) : (
                      <span className="elevator-badge unassigned">
                        ⏳ Unassigned
                      </span>
                    )}
                  </div>
                  <div className="request-status">
                    {request.status === "completed" ? (
                      <span className="status-completed">✅ Completed</span>
                    ) : (
                      <span className="status-pending">⏳ Pending</span>
                    )}
                  </div>
                  <div className="request-time">
                    {formatTimestamp(request.timestamp)}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestLog;
