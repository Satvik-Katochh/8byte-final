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

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"]
        : ["http://localhost:3000"],
    credentials: true,
  })
);

// Serve static files (for production)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../client/build")));
}

// Create HTTP server
const server = createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"]
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
      console.log("📋 Manual request:", data);
      if (simulationEngine) {
        // We'll add this method to SimulationEngine
        simulationEngine.addManualRequest(data.fromFloor, data.toFloor);
      }
    }
  );

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

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

export default server;
