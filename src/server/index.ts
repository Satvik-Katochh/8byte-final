/**
 * Server Entry Point - Express + Socket.IO setup
 * This file creates the HTTP server and WebSocket connection for real-time updates
 */

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import path from "path";

// Import our simulation engine
import { SimulationEngine } from "./services/SimulationEngine";

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Handle Railway environment
const isRailway = process.env.RAILWAY_ENVIRONMENT === "production";
const clientUrl = isRailway
  ? process.env.RAILWAY_PUBLIC_DOMAIN || "http://localhost:3000"
  : process.env.CLIENT_URL || "http://localhost:3000";

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [clientUrl]
        : ["http://localhost:3000"],
    credentials: true,
  })
);

// Serve static files (for production)
if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "../client");
  console.log("📁 Serving static files from:", staticPath);
  console.log("📁 __dirname:", __dirname);
  console.log("📁 Process cwd:", process.cwd());
  app.use(express.static(staticPath));
}

// Create HTTP server
const server = createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? [clientUrl]
        : ["http://localhost:3000"],
    credentials: true,
  },
});

// Create simulation engine instance
let simulationEngine: SimulationEngine | null = null;
let simulationInterval: NodeJS.Timeout | null = null;

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // Remove any existing listeners to prevent duplicates
  socket.removeAllListeners("initialize-simulation");
  socket.removeAllListeners("start-simulation");
  socket.removeAllListeners("stop-simulation");
  socket.removeAllListeners("reset-simulation");
  socket.removeAllListeners("change-speed");
  socket.removeAllListeners("change-frequency");
  socket.removeAllListeners("generate-request");
  socket.removeAllListeners("test-priority-escalation");

  // Morning rush hour - REGISTER AFTER REMOVE
  socket.on("start-morning-rush", (data) => {
    console.log("🌅 Morning rush hour requested");
    console.log("🌅 Received data:", data);
    console.log("🌅 Simulation engine exists?", !!simulationEngine);
    try {
      if (simulationEngine) {
        simulationEngine.startMorningRush();
        // Send updated state with rush hour info
        const updatedState = simulationEngine.getState();
        console.log("🌅 Updated state:", updatedState);
        socket.emit("simulation-state", {
          type: "simulation-state",
          state: updatedState,
        });
      } else {
        console.log("🌅 Error: No simulation engine available");
      }
    } catch (error) {
      console.error("🌅 Error in morning rush handler:", error);
    }
  });

  // Evening rush hour - REGISTER AFTER REMOVE
  socket.on("start-evening-rush", (data) => {
    console.log("🌆 Evening rush hour requested");
    console.log("🌆 Received data:", data);
    console.log("🌆 Simulation engine exists?", !!simulationEngine);
    try {
      if (simulationEngine) {
        simulationEngine.startEveningRush();
        // Send updated state with rush hour info
        const updatedState = simulationEngine.getState();
        console.log("🌆 Updated state:", updatedState);
        socket.emit("simulation-state", {
          type: "simulation-state",
          state: updatedState,
        });
      } else {
        console.log("🌆 Error: No simulation engine available");
      }
    } catch (error) {
      console.error("🌆 Error in evening rush handler:", error);
    }
  });

  // Test handler to see if custom messages work
  socket.on("test-message", (data) => {
    console.log("🧪 Test message received:", data);
  });

  // Initialize simulation when client connects
  socket.on(
    "initialize-simulation",
    (data: {
      totalFloors: number;
      totalElevators: number;
      requestFrequency: number;
    }) => {
      console.log("🚀 Initializing simulation with:", data);

      // Create new simulation engine
      simulationEngine = new SimulationEngine(
        data.totalFloors,
        data.totalElevators
      );
      simulationEngine.setRequestFrequency(data.requestFrequency);

      // Send initial state
      const state = simulationEngine.getState();
      console.log("📤 Sending initial state:", state);
      socket.emit("simulation-state", {
        type: "simulation-state",
        state: state,
      });

      console.log("✅ Simulation initialized");
    }
  );

  // Start simulation
  socket.on("start-simulation", () => {
    console.log("▶️ Starting simulation");
    if (simulationEngine) {
      simulationEngine.start();

      // Start simulation loop
      simulationInterval = setInterval(() => {
        if (simulationEngine) {
          // Get state before step to detect new requests
          const stateBefore = simulationEngine.getState();
          const pendingRequestsBefore = stateBefore.pendingRequests;

          simulationEngine.step();

          // Get state after step
          const stateAfter = simulationEngine.getState();
          const pendingRequestsAfter = stateAfter.pendingRequests;

          // If new requests were generated, send auto-request notification
          if (pendingRequestsAfter > pendingRequestsBefore) {
            const newRequests = pendingRequestsAfter - pendingRequestsBefore;
            console.log(`🔵 Generated ${newRequests} auto-request(s)`);

            // Send auto-request notification to frontend
            socket.emit("auto-request-generated", {
              count: newRequests,
              timestamp: new Date().toLocaleTimeString(),
            });
          }

          // Check if any requests were completed
          const completedRequestsBefore = stateBefore.completedRequests;
          const completedRequestsAfter = stateAfter.completedRequests;

          if (completedRequestsAfter > completedRequestsBefore) {
            const newCompleted =
              completedRequestsAfter - completedRequestsBefore;
            console.log(`✅ ${newCompleted} request(s) completed`);

            // Send completion notification to frontend
            socket.emit("requests-completed", {
              count: newCompleted,
              timestamp: new Date().toLocaleTimeString(),
            });
          }

          socket.emit("simulation-state", {
            type: "simulation-state",
            state: stateAfter,
          });
        }
      }, 1000); // Update every 1 second (faster for better visualization)
    }
  });

  // Stop simulation
  socket.on("stop-simulation", () => {
    console.log("⏸️ Stopping simulation");
    if (simulationEngine) {
      simulationEngine.stop();
    }
    if (simulationInterval) {
      clearInterval(simulationInterval);
      simulationInterval = null;
    }
  });

  // Reset simulation
  socket.on(
    "reset-simulation",
    (data: {
      totalFloors: number;
      totalElevators: number;
      requestFrequency: number;
    }) => {
      console.log("🔄 Resetting simulation");
      if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
      }

      simulationEngine = new SimulationEngine(
        data.totalFloors,
        data.totalElevators
      );
      simulationEngine.setRequestFrequency(data.requestFrequency);

      socket.emit("simulation-state", {
        type: "simulation-state",
        state: simulationEngine.getState(),
      });
    }
  );

  // Change simulation speed
  socket.on("change-speed", (speed: number) => {
    console.log("🚀 Changing speed to:", speed);
    if (simulationEngine) {
      simulationEngine.setSpeed(speed);
    }
  });

  // Change request frequency
  socket.on("change-frequency", (frequency: number) => {
    console.log("📊 Changing frequency to:", frequency);
    if (simulationEngine) {
      simulationEngine.setRequestFrequency(frequency);
    }
  });

  // Manual request generation
  socket.on(
    "generate-request",
    (data: { fromFloor: number; toFloor: number }) => {
      if (simulationEngine) {
        // We'll add this method to SimulationEngine
        simulationEngine.addManualRequest(data.fromFloor, data.toFloor);
      }
    }
  );

  // Manual elevator-specific request generation
  socket.on(
    "generate-elevator-request",
    (data: { elevatorId: number; fromFloor: number; toFloor: number }) => {
      if (simulationEngine) {
        // We'll add this method to SimulationEngine
        simulationEngine.addManualElevatorRequest(
          data.elevatorId,
          data.fromFloor,
          data.toFloor
        );
      }
    }
  );

  // Test priority escalation
  socket.on("test-priority-escalation", () => {
    console.log("🧪 Testing priority escalation");
    if (simulationEngine) {
      const totalFloors = simulationEngine.getState().totalFloors;

      // Dynamic floor calculation for ANY configuration
      let fromFloor, toFloor, normalFromFloor, normalToFloor;

      if (totalFloors === 1) {
        // Edge case: only 1 floor - can't test priority
        console.log("⚠️ Cannot test priority with only 1 floor");
        return;
      } else if (totalFloors === 2) {
        // 2 floors: Floor 1 → Floor 2
        fromFloor = 1;
        toFloor = 2;
        normalFromFloor = 1;
        normalToFloor = 2;
      } else if (totalFloors === 3) {
        // 3 floors: Floor 1 → Floor 3 vs Floor 2 → Floor 3
        fromFloor = 1;
        toFloor = 3;
        normalFromFloor = 2;
        normalToFloor = 3;
      } else {
        // 4+ floors: Use middle and top floors
        fromFloor = Math.floor(totalFloors / 2);
        toFloor = totalFloors;
        normalFromFloor = 1;
        normalToFloor = Math.floor(totalFloors / 2);
      }

      // Create a long-waiting request to test priority
      simulationEngine.addLongWaitingRequest(fromFloor, toFloor);

      // Also create a normal request for comparison
      simulationEngine.addManualRequest(normalFromFloor, normalToFloor);

      // Send notifications to frontend for both requests
      socket.emit("test-request-created", {
        type: "long-waiting",
        fromFloor: fromFloor,
        toFloor: toFloor,
        timestamp: new Date().toLocaleTimeString(),
        priority: 65.0, // High priority
      });

      socket.emit("test-request-created", {
        type: "normal",
        fromFloor: normalFromFloor,
        toFloor: normalToFloor,
        timestamp: new Date().toLocaleTimeString(),
        priority: 1.0, // Normal priority
      });

      console.log(
        `🧪 Created test requests: long-waiting (Floor ${fromFloor} → Floor ${toFloor}) and normal (Floor ${normalFromFloor} → Floor ${normalToFloor})`
      );
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
    if (simulationInterval) {
      clearInterval(simulationInterval);
      simulationInterval = null;
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    simulation: simulationEngine ? "running" : "stopped",
  });
});

// Catch-all route for React app (must be last)
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

export default server;
