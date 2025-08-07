/**
 * Main App Component - Entry point for the elevator simulation
 * This component manages the overall application state and layout
 */

import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// Import our components
import ElevatorDisplay from "./components/ElevatorDisplay";
import ControlPanel from "./components/ControlPanel";
import StatisticsPanel from "./components/StatisticsPanel";

// Import our WebSocket hook
import { useWebSocket } from "./hooks/useWebSocket";

/**
 * App Component
 * Main application component that manages the simulation
 */
function App() {
  // WebSocket connection
  const {
    isConnected,
    simulationState: wsSimulationState,
    error,
    initializeSimulation,
    startSimulation,
    stopSimulation,
    resetSimulation,
    changeSpeed,
    changeFrequency,
    generateRequest,
    onAutoRequestGenerated,
    onRequestsCompleted,
  } = useWebSocket();

  // Application state
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [totalFloors, setTotalFloors] = useState(20);
  const [totalElevators, setTotalElevators] = useState(4);
  const [requestFrequency, setRequestFrequency] = useState(1);

  // Request log state
  const [requestLog, setRequestLog] = useState<
    Array<{
      id: string;
      type: "manual" | "auto";
      fromFloor: number;
      toFloor: number;
      timestamp: string;
      status: "pending" | "completed";
      priority?: number; // Priority score for pending requests
    }>
  >([]);

  // Counter for unique auto-request IDs
  const autoRequestCounterRef = useRef(0);

  /**
   * Calculate priority for a request based on wait time
   * @param timestamp - When the request was created
   * @returns Priority score (higher = more urgent)
   */
  const calculatePriority = (timestamp: string): number => {
    const requestTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    const waitTime = (currentTime - requestTime) / 1000; // Convert to seconds

    // Base priority is 1
    let priority = 1;

    // If waiting more than 30 seconds, increase priority
    if (waitTime > 30) {
      // Priority increases exponentially after 30 seconds
      priority += Math.pow(waitTime - 30, 1.5);
    }

    return priority;
  };

  // Use WebSocket state or fallback to local state
  const simulationState = wsSimulationState || {
    currentTime: 0,
    elevators: [],
    pendingRequests: 0,
    totalRequests: 0,
    completedRequests: 0,
    averageWaitTime: 0,
  };

  // Handle auto-request notifications
  useEffect(() => {
    if (onAutoRequestGenerated) {
      const handleAutoRequest = (data: {
        count: number;
        timestamp: string;
      }) => {
        console.log(`🔵 Auto-request generated: ${data.count} request(s)`);

        // Add auto-requests to log (simplified - we don't have exact floor info from server)
        for (let i = 0; i < data.count; i++) {
          const newRequest = {
            id: `auto_${Date.now()}_${autoRequestCounterRef.current + i}`,
            type: "auto" as const,
            fromFloor: Math.floor(Math.random() * totalFloors) + 1, // Random for demo
            toFloor: Math.floor(Math.random() * totalFloors) + 1, // Random for demo
            timestamp: data.timestamp,
            status: "pending" as const,
          };

          setRequestLog((prev) => [newRequest, ...prev.slice(0, 9)]); // Keep last 10 requests
        }

        // Update the counter for next time
        autoRequestCounterRef.current += data.count;
      };

      onAutoRequestGenerated(handleAutoRequest);
    }
  }, [onAutoRequestGenerated, totalFloors]);

  // Handle request completion notifications
  useEffect(() => {
    if (onRequestsCompleted) {
      const handleRequestCompletion = (data: {
        count: number;
        timestamp: string;
      }) => {
        console.log(
          `✅ Request completion notification: ${data.count} request(s)`
        );

        // Mark some pending requests as completed
        setRequestLog((prev) => {
          const updated = [...prev];
          const pendingRequests = updated.filter((r) => r.status === "pending");

          // Mark some pending requests as completed (prioritize manual requests)
          const manualRequests = pendingRequests.filter(
            (r) => r.type === "manual"
          );
          const autoRequests = pendingRequests.filter((r) => r.type === "auto");

          let completedCount = 0;

          // First complete manual requests
          for (const request of manualRequests) {
            if (completedCount < data.count) {
              const index = updated.findIndex((r) => r.id === request.id);
              if (index !== -1) {
                updated[index] = {
                  ...updated[index],
                  status: "completed" as const,
                };
                completedCount++;
              }
            }
          }

          // Then complete auto requests
          for (const request of autoRequests) {
            if (completedCount < data.count) {
              const index = updated.findIndex((r) => r.id === request.id);
              if (index !== -1) {
                updated[index] = {
                  ...updated[index],
                  status: "completed" as const,
                };
                completedCount++;
              }
            }
          }

          return updated;
        });
      };

      onRequestsCompleted(handleRequestCompletion);
    }
  }, [onRequestsCompleted]);

  /**
   * Start the simulation
   */
  const handleStart = () => {
    if (isConnected) {
      setIsRunning(true);
      startSimulation();
      console.log("Starting simulation...");
    } else {
      console.error("WebSocket not connected");
    }
  };

  /**
   * Stop the simulation
   */
  const handleStop = () => {
    if (isConnected) {
      setIsRunning(false);
      stopSimulation();
      console.log("Stopping simulation...");
    } else {
      console.error("WebSocket not connected");
    }
  };

  /**
   * Reset the simulation
   */
  const handleReset = () => {
    if (isConnected) {
      setIsRunning(false);
      resetSimulation({
        totalFloors,
        totalElevators,
        requestFrequency,
      });
      setRequestLog([]); // Clear request log
      autoRequestCounterRef.current = 0; // Reset ref counter
      console.log("Resetting simulation...");
    } else {
      console.error("WebSocket not connected");
    }
  };

  /**
   * Change simulation speed
   */
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (isConnected) {
      changeSpeed(newSpeed);
    }
    console.log(`Speed changed to ${newSpeed}x`);
  };

  /**
   * Change number of floors
   */
  const handleFloorsChange = (newFloors: number) => {
    setTotalFloors(newFloors);
    console.log(`Floors changed to ${newFloors}`);
    // Will be applied on next reset
  };

  /**
   * Change number of elevators
   */
  const handleElevatorsChange = (newElevators: number) => {
    setTotalElevators(newElevators);
    console.log(`Elevators changed to ${newElevators}`);
    // Will be applied on next reset
  };

  /**
   * Change request frequency
   */
  const handleFrequencyChange = (newFrequency: number) => {
    setRequestFrequency(newFrequency);
    if (isConnected) {
      changeFrequency(newFrequency);
    }
    console.log(`Request frequency changed to ${newFrequency}/sec`);
  };

  // Handle manual request generation
  const handleGenerateRequest = (fromFloor: number, toFloor: number) => {
    const requestId = `manual_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    console.log(
      `🔧 Generating manual request: Floor ${fromFloor} → Floor ${toFloor} (ID: ${requestId})`
    );

    // Add to request log
    const newRequest = {
      id: requestId,
      type: "manual" as const,
      fromFloor,
      toFloor,
      timestamp: new Date().toLocaleTimeString(),
      status: "pending" as const,
    };

    setRequestLog((prev) => [newRequest, ...prev.slice(0, 9)]); // Keep last 10 requests

    generateRequest(fromFloor, toFloor);
  };

  // Initialize simulation when component mounts
  useEffect(() => {
    console.log(
      "🔧 App useEffect - isConnected:",
      isConnected,
      "simulationState:",
      simulationState
    );
    if (isConnected) {
      console.log("🔧 Initializing simulation...");
      initializeSimulation({
        totalFloors,
        totalElevators,
        requestFrequency,
      });
    }
  }, [
    isConnected,
    initializeSimulation,
    totalFloors,
    totalElevators,
    requestFrequency,
  ]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏢 Elevator Simulation</h1>
        <p>Real-time elevator system with intelligent scheduling</p>
        {error && (
          <div
            style={{
              background: "rgba(244, 67, 54, 0.2)",
              padding: "10px",
              borderRadius: "8px",
              marginTop: "10px",
            }}
          >
            ⚠️ {error}
          </div>
        )}
        <div
          style={{
            marginTop: "10px",
            fontSize: "0.9rem",
            opacity: 0.8,
          }}
        >
          {isConnected
            ? "🟢 Connected to server"
            : "🔴 Disconnected from server"}
        </div>
      </header>

      <main className="App-main">
        {/* Control Panel - Top of the page */}
        <ControlPanel
          isRunning={isRunning}
          speed={speed}
          totalFloors={totalFloors}
          totalElevators={totalElevators}
          requestFrequency={requestFrequency}
          onStart={handleStart}
          onStop={handleStop}
          onReset={handleReset}
          onSpeedChange={handleSpeedChange}
          onFloorsChange={handleFloorsChange}
          onElevatorsChange={handleElevatorsChange}
          onFrequencyChange={handleFrequencyChange}
        />

        {/* Main Simulation Display */}
        <div className="simulation-container">
          <ElevatorDisplay
            totalFloors={totalFloors}
            totalElevators={totalElevators}
            elevators={simulationState.elevators}
            isRunning={isRunning}
            pendingRequests={simulationState.pendingRequests}
            onGenerateRequest={handleGenerateRequest}
          />
        </div>

        {/* Simple Instructions */}
        <div
          className="panel"
          style={{ marginTop: "20px", background: "rgba(0, 255, 0, 0.1)" }}
        >
          <h3>📋 Quick Test Guide</h3>
          <div style={{ fontSize: "0.9rem", textAlign: "left" }}>
            <div style={{ marginBottom: "10px" }}>
              <strong>🎯 Test Steps:</strong>
            </div>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.3)",
                padding: "10px",
                borderRadius: "6px",
                fontSize: "0.9rem",
              }}
            >
              <div>1. Click Reset → Set: 5 floors, 1 elevator</div>
              <div>2. Click ⬆️ on Floor 3 (creates manual request)</div>
              <div>3. Click Start (auto-requests generate every second)</div>
              <div>4. Watch elevator move smoothly</div>
              <div>5. Click Stop after 5 seconds</div>
            </div>
            <div
              style={{ fontSize: "0.8rem", color: "#666", marginTop: "8px" }}
            >
              💡 Watch the Request Log below for timestamp, origin, destination
            </div>
          </div>
        </div>

        {/* Real-time Request Log */}
        <div
          className="panel"
          style={{ marginTop: "20px", background: "rgba(52, 152, 219, 0.1)" }}
        >
          <h3>📝 Request Log (Timestamp | Origin → Destination)</h3>
          <div
            style={{
              fontSize: "0.85rem",
              maxHeight: "150px",
              overflowY: "auto",
              background: "rgba(255, 255, 255, 0.2)",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            {requestLog.length === 0 ? (
              <div style={{ color: "#666", fontStyle: "italic" }}>
                No requests yet. Click floor buttons or start simulation.
              </div>
            ) : (
              requestLog.map((request, index) => (
                <div
                  key={request.id}
                  style={{
                    padding: "4px 0",
                    borderBottom:
                      index < requestLog.length - 1
                        ? "1px solid rgba(255, 255, 255, 0.1)"
                        : "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.8rem",
                    opacity: request.status === "completed" ? 0.7 : 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        color:
                          request.status === "completed"
                            ? "#2ecc71"
                            : request.type === "manual"
                            ? "#ff6b6b"
                            : "#4ecdc4",
                        fontWeight: "bold",
                        fontSize: "0.75rem",
                      }}
                    >
                      {request.status === "completed"
                        ? "✅"
                        : request.type === "manual"
                        ? "🔴"
                        : "🔵"}{" "}
                      {request.status === "completed"
                        ? `COMPLETED (${request.type.toUpperCase()})`
                        : request.type.toUpperCase()}
                    </span>
                    <span
                      style={{
                        color: request.status === "completed" ? "#ccc" : "#fff",
                        textDecoration:
                          request.status === "completed"
                            ? "line-through"
                            : "none",
                      }}
                    >
                      Floor {request.fromFloor} → Floor {request.toFloor}
                    </span>
                    {request.status === "pending" && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color:
                            calculatePriority(request.timestamp) > 10
                              ? "#ff6b6b"
                              : "#4ecdc4",
                          fontWeight: "bold",
                          marginLeft: "8px",
                        }}
                      >
                        ⚡ {calculatePriority(request.timestamp).toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#ccc" }}>
                    {request.timestamp}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Statistics Panel - Bottom of the page */}
        <StatisticsPanel
          currentTime={simulationState.currentTime}
          pendingRequests={simulationState.pendingRequests}
          totalRequests={simulationState.totalRequests}
          completedRequests={simulationState.completedRequests}
          averageWaitTime={simulationState.averageWaitTime}
        />
      </main>
    </div>
  );
}

export default App;
