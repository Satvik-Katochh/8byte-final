/**
 * useWebSocket Hook - Manages WebSocket connection to backend
 * This hook handles real-time communication with the simulation server
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

// Types for WebSocket messages
interface SimulationState {
  isRunning: boolean;
  currentTime: number;
  speed: number;
  totalFloors: number;
  totalElevators: number;
  elevators: Array<{
    id: number;
    currentFloor: number;
    direction: "up" | "down" | "idle";
    passengerCount: number;
    maxCapacity: number;
    doorsOpen: boolean;
    targetFloor?: number;
    isMoving: boolean;
  }>;
  pendingRequests: number;
  totalRequests: number;
  completedRequests: number;
  averageWaitTime: number;
  maxWaitTime: number;
  averageTravelTime: number;
  elevatorUtilization: number;
  // NEW: Rush hour state
  isRushHour?: boolean;
  rushHourType?: string;
  simulationHour?: number;
}

interface SimulationConfig {
  totalFloors: number;
  totalElevators: number;
  requestFrequency: number;
}

/**
 * useWebSocket Hook
 * Manages WebSocket connection and provides methods to control simulation
 */
export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [simulationState, setSimulationState] =
    useState<SimulationState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Connect to Socket.IO
  const connect = useCallback(() => {
    // Don't create multiple connections
    if (socketRef.current) {
      console.log("🔌 Socket connection already exists");
      return;
    }

    try {
      // Create Socket.IO connection to backend
      const socket = io("http://localhost:8080");

      socket.on("connect", () => {
        console.log("🔌 Socket.IO connected");
        setIsConnected(true);
        setError(null);
      });

      socket.on("simulation-state", (data) => {
        console.log("🔌 Received simulation state:", data);
        if (data.type === "simulation-state") {
          setSimulationState(data.state);
        }
      });

      socket.on("disconnect", () => {
        console.log("🔌 Socket.IO disconnected");
        setIsConnected(false);
      });

      socket.on("connect_error", (error) => {
        console.error("Socket.IO error:", error);
        setError("Failed to connect to simulation server");
        setIsConnected(false);
      });

      socketRef.current = socket;
    } catch (err) {
      console.error("Error creating Socket.IO connection:", err);
      setError("Failed to create Socket.IO connection");
    }
  }, []);

  // Disconnect from Socket.IO
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Send message to server
  const sendMessage = useCallback((type: string, data?: any) => {
    console.log(`🔌 sendMessage called with type: "${type}", data:`, data);
    if (socketRef.current && socketRef.current.connected) {
      console.log(`🔌 WebSocket: Emitting ${type}`, data || "no data");
      try {
        socketRef.current.emit(type, data);
        console.log(`🔌 WebSocket: Successfully emitted ${type}`);
      } catch (error) {
        console.error(`🔌 WebSocket: Error emitting ${type}:`, error);
      }
    } else {
      console.error("Socket.IO not connected");
      console.error("Socket ref:", socketRef.current);
      setError("Socket.IO not connected");
    }
  }, []);

  // Initialize simulation
  const initializeSimulation = useCallback(
    (config: SimulationConfig) => {
      sendMessage("initialize-simulation", config);
    },
    [sendMessage]
  );

  // Start simulation
  const startSimulation = useCallback(() => {
    sendMessage("start-simulation");
  }, [sendMessage]);

  // Stop simulation
  const stopSimulation = useCallback(() => {
    sendMessage("stop-simulation");
  }, [sendMessage]);

  // Reset simulation
  const resetSimulation = useCallback(
    (config: SimulationConfig) => {
      sendMessage("reset-simulation", config);
    },
    [sendMessage]
  );

  // Change simulation speed
  const changeSpeed = useCallback(
    (speed: number) => {
      sendMessage("change-speed", speed);
    },
    [sendMessage]
  );

  // Change request frequency
  const changeFrequency = useCallback(
    (frequency: number) => {
      sendMessage("change-frequency", frequency);
    },
    [sendMessage]
  );

  // Generate manual request
  const generateRequest = useCallback(
    (fromFloor: number, toFloor: number) => {
      console.log(
        `🔌 WebSocket: Sending generate-request: Floor ${fromFloor} → Floor ${toFloor}`
      );
      sendMessage("generate-request", { fromFloor, toFloor });
    },
    [sendMessage]
  );

  // Generate manual elevator-specific request
  const generateElevatorRequest = useCallback(
    (elevatorId: number, fromFloor: number, toFloor: number) => {
      console.log(
        `🔌 WebSocket: Sending generate-elevator-request: Elevator ${elevatorId}, Floor ${fromFloor} → Floor ${toFloor}`
      );
      sendMessage("generate-elevator-request", {
        elevatorId,
        fromFloor,
        toFloor,
      });
    },
    [sendMessage]
  );

  // Test priority escalation
  const testPriorityEscalation = useCallback(() => {
    console.log("🧪 WebSocket: Testing priority escalation");
    sendMessage("test-priority-escalation");
  }, [sendMessage]);

  // Start morning rush hour
  const startMorningRush = useCallback(() => {
    console.log("🌅 WebSocket: Starting morning rush hour");
    console.log(
      "🌅 WebSocket: Socket connected?",
      socketRef.current?.connected
    );
    console.log("🌅 WebSocket: Socket ID:", socketRef.current?.id);
    console.log("🌅 WebSocket: About to emit start-morning-rush");
    sendMessage("start-morning-rush");
    console.log("🌅 WebSocket: Emitted start-morning-rush");
  }, [sendMessage]);

  // Start evening rush hour
  const startEveningRush = useCallback(() => {
    console.log("🌆 WebSocket: Starting evening rush hour");
    console.log(
      "🌆 WebSocket: Socket connected?",
      socketRef.current?.connected
    );
    console.log("🌆 WebSocket: Socket ID:", socketRef.current?.id);
    console.log("🌆 WebSocket: About to emit start-evening-rush");
    sendMessage("start-evening-rush");
    console.log("🌆 WebSocket: Emitted start-evening-rush");
  }, [sendMessage]);

  // Test message function
  const sendTestMessage = useCallback(() => {
    console.log("🧪 WebSocket: Sending test message");
    sendMessage("test-message", { test: "data" });
  }, [sendMessage]);

  // Handle auto-request notifications
  const onAutoRequestGenerated = useCallback(
    (callback: (data: { count: number; timestamp: string }) => void) => {
      if (socketRef.current) {
        // Remove old listener first
        socketRef.current.off("auto-request-generated");
        // Add new listener
        socketRef.current.on("auto-request-generated", callback);
      }
    },
    []
  );

  // Handle request completion notifications
  const onRequestsCompleted = useCallback(
    (callback: (data: { count: number; timestamp: string }) => void) => {
      if (socketRef.current) {
        // Remove old listener first
        socketRef.current.off("requests-completed");
        // Add new listener
        socketRef.current.on("requests-completed", callback);
      }
    },
    []
  );

  // Handle test request notifications
  const onTestRequestCreated = useCallback(
    (
      callback: (data: {
        type: "long-waiting" | "normal";
        fromFloor: number;
        toFloor: number;
        timestamp: string;
        priority: number;
      }) => void
    ) => {
      if (socketRef.current) {
        // Remove old listener first
        socketRef.current.off("test-request-created");
        // Add new listener
        socketRef.current.on("test-request-created", callback);
      }
    },
    []
  );

  // Connect on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []); // Empty dependency array - only run once on mount

  return {
    isConnected,
    simulationState,
    error,
    initializeSimulation,
    startSimulation,
    stopSimulation,
    resetSimulation,
    changeSpeed,
    changeFrequency,
    generateRequest,
    generateElevatorRequest,
    testPriorityEscalation,
    startMorningRush,
    startEveningRush,
    sendTestMessage,
    onAutoRequestGenerated,
    onRequestsCompleted,
    onTestRequestCreated,
    connect,
    disconnect,
  };
};
