/**
 * Simulation Engine - Main simulation loop and state management
 * This class runs the elevator simulation and manages all the logic
 */

import { RequestClass } from "../models/Request";
import { ElevatorClass } from "../models/Elevator";
import { Scheduler } from "./Scheduler";
import * as fs from "fs";
import * as path from "path";

/**
 * Simulation Engine Class
 * Manages the main simulation loop and state
 */
export class SimulationEngine {
  // Simulation state
  private isRunning: boolean = false;
  private currentTime: number = 0;
  private speed: number = 1; // 1x, 2x, 5x speed

  // Building configuration
  private totalFloors: number = 20;
  private totalElevators: number = 4;

  // Simulation objects
  private elevators: ElevatorClass[] = [];
  private scheduler: Scheduler;
  private pendingRequests: RequestClass[] = [];

  // Request generation
  private requestFrequency: number = 1; // requests per second
  private lastRequestTime: number = 0;

  // Statistics
  private totalRequests: number = 0;
  private completedRequests: number = 0;
  private averageWaitTime: number = 0;

  // NEW: Enhanced performance metrics
  private maxWaitTime: number = 0;
  private averageTravelTime: number = 0;
  private elevatorUtilization: number = 0;
  private completedRequestsWithTimes: Array<{
    waitTime: number;
    travelTime: number;
    completionTime: number;
  }> = [];

  // NEW: Rush hour state tracking
  private isRushHour: boolean = false;
  private rushHourType: "normal" | "morning" | "evening" = "normal";
  private simulationHour: number = new Date().getHours(); // Current hour of day

  // NEW: Logging system
  private logFile: string = "";
  private logBuffer: string[] = [];

  /**
   * Log message to both console and file
   */
  private log(message: string): void {
    const now = new Date();
    const timestamp = now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    this.logBuffer.push(logMessage);
  }

  /**
   * Save logs to file
   */
  private saveLogs(): void {
    if (this.logBuffer.length > 0) {
      const logsDir = path.join(__dirname, "../../../logs");
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      const now = new Date();

      // Create human-readable date format: 8_Aug_2025
      const day = now.getDate();
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();

      // Create human-readable time format: 4-20-35-PM-IST
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;

      const dateStr = `${day}_${month}_${year}`;
      const timeStr = `${displayHours}-${minutes}-${seconds}-${ampm}-IST`;

      this.logFile = path.join(
        logsDir,
        `elevator-simulation-${dateStr}_(${timeStr}).log`
      );

      // Add header to log file
      const header = [
        "=".repeat(80),
        "ELEVATOR SIMULATION LOG FILE",
        `Generated on: ${now.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        })}`,
        `Simulation Duration: ${this.currentTime} seconds`,
        `Total Requests: ${this.totalRequests}`,
        `Completed Requests: ${this.completedRequests}`,
        `Rush Hour Mode: ${
          this.isRushHour ? this.rushHourType.toUpperCase() : "NORMAL"
        }`,
        "=".repeat(80),
        "",
      ].join("\n");

      fs.writeFileSync(this.logFile, header + this.logBuffer.join("\n"));
      console.log(`📝 Log file saved: ${this.logFile}`);
    }
  }

  /**
   * Constructor - Initialize the simulation
   * @param totalFloors - Number of floors in building
   * @param totalElevators - Number of elevators
   */
  constructor(totalFloors: number = 20, totalElevators: number = 4) {
    this.totalFloors = totalFloors;
    this.totalElevators = totalElevators;

    // Create elevators
    this.createElevators();

    // Create scheduler
    this.scheduler = new Scheduler(this.elevators);
  }

  /**
   * Create all elevators for the building
   */
  private createElevators(): void {
    this.elevators = [];

    for (let i = 0; i < this.totalElevators; i++) {
      // Start elevators at different floors for better distribution
      const startingFloor =
        Math.floor(i * (this.totalFloors / this.totalElevators)) + 1;
      const elevator = new ElevatorClass(i + 1, 8, startingFloor);
      this.elevators.push(elevator);
    }
  }

  /**
   * Start the simulation
   */
  public start(): void {
    this.isRunning = true;
    this.log("🎮 ELEVATOR SIMULATION STARTED:");
    this.log(
      `   🏢 Building: ${this.totalFloors} floors, ${this.totalElevators} elevators`
    );
    this.log(`   ⚡ Speed: ${this.speed}x`);
    this.log(`   📊 Request Frequency: ${this.requestFrequency}/second`);
    this.log(`   ⏰ Simulation Time: ${this.simulationHour}:00`);
    this.log(
      `   🌅 Rush Hour: ${
        this.isRushHour ? this.rushHourType.toUpperCase() : "INACTIVE"
      }`
    );
  }

  /**
   * Stop the simulation
   */
  public stop(): void {
    this.isRunning = false;
    this.log("⏸️ ELEVATOR SIMULATION STOPPED:");
    this.log(
      `   📊 Final Stats: ${this.completedRequests}/${this.totalRequests} requests completed`
    );
    this.log(`   ⏱️ Average Wait Time: ${this.averageWaitTime.toFixed(1)}s`);
    this.log(
      `   🚀 Average Travel Time: ${this.averageTravelTime.toFixed(1)}s`
    );
    this.log(
      `   📈 Elevator Utilization: ${this.elevatorUtilization.toFixed(1)}%`
    );

    // Save logs to file
    this.saveLogs();
  }

  /**
   * Reset the simulation to initial state
   */
  public reset(): void {
    this.isRunning = false;
    this.currentTime = 0;
    this.pendingRequests = [];
    this.totalRequests = 0;
    this.completedRequests = 0;
    this.averageWaitTime = 0;
    this.maxWaitTime = 0;
    this.averageTravelTime = 0;
    this.elevatorUtilization = 0;
    this.completedRequestsWithTimes = [];
    this.lastRequestTime = 0;

    // Reset all elevators
    this.createElevators();
    this.scheduler = new Scheduler(this.elevators);

    console.log("Simulation reset");
  }

  /**
   * Set simulation speed
   * @param speed - Speed multiplier (1x, 2x, 5x, 10x)
   */
  public setSpeed(speed: number): void {
    this.speed = speed;
    console.log(`Speed set to ${speed}x`);
  }

  /**
   * Start morning rush hour simulation
   * Simulates 8-10 AM with lobby-to-upper-floor bias
   */
  public startMorningRush(): void {
    this.isRushHour = true;
    this.rushHourType = "morning";
    this.simulationHour = 9; // 9 AM
    this.requestFrequency = 2; // Higher frequency during rush hour
    this.log("🌅 Morning rush hour started - Lobby to upper floors bias");
    this.log(
      `   📊 Request frequency increased to ${this.requestFrequency}/second`
    );
    this.log(`   ⏰ Simulation time set to ${this.simulationHour}:00`);
  }

  /**
   * Start evening rush hour simulation
   * Simulates 5-7 PM with upper-floor-to-lobby bias
   */
  public startEveningRush(): void {
    this.isRushHour = true;
    this.rushHourType = "evening";
    this.simulationHour = 18; // 6 PM
    this.requestFrequency = 2; // Higher frequency during rush hour
    this.log("🌆 Evening rush hour started - Upper floors to lobby bias");
    this.log(
      `   📊 Request frequency increased to ${this.requestFrequency}/second`
    );
    this.log(`   ⏰ Simulation time set to ${this.simulationHour}:00`);
  }

  /**
   * End rush hour simulation
   */
  public endRushHour(): void {
    this.isRushHour = false;
    this.rushHourType = "normal";
    this.requestFrequency = 1; // Normal frequency
    this.log("⏰ Rush hour ended - Normal operation resumed");
    this.log(
      `   📊 Request frequency reset to ${this.requestFrequency}/second`
    );
  }

  /**
   * Check if it's morning rush hour (8-10 AM)
   * @returns true if it's rush hour
   */
  private isMorningRushHour(): boolean {
    const hour = new Date().getHours();
    return hour >= 8 && hour <= 10;
  }

  /**
   * Generate rush hour request with lobby bias (morning rush)
   */
  private generateRushHourRequest(): RequestClass {
    if (this.rushHourType === "morning") {
      // Morning rush: 70% chance of request from lobby (floor 1) to upper floors
      const isFromLobby = Math.random() < 0.7;
      const fromFloor = isFromLobby
        ? 1
        : Math.floor(Math.random() * this.totalFloors) + 1;

      let toFloor: number;
      if (isFromLobby) {
        // If from lobby, go to upper floors (2 to totalFloors)
        toFloor = Math.floor(Math.random() * (this.totalFloors - 1)) + 2;
        this.log(
          `🌅 Morning rush: Lobby request (70% chance) - Floor 1 → Floor ${toFloor}`
        );
      } else {
        // Random destination
        toFloor = Math.floor(Math.random() * this.totalFloors) + 1;
        while (toFloor === fromFloor) {
          toFloor = Math.floor(Math.random() * this.totalFloors) + 1;
        }
        this.log(
          `🌅 Morning rush: Random request (30% chance) - Floor ${fromFloor} → Floor ${toFloor}`
        );
      }

      return new RequestClass(fromFloor, toFloor, this.currentTime);
    } else if (this.rushHourType === "evening") {
      // Evening rush: 70% chance of request from upper floors to lobby (floor 1)
      const isToLobby = Math.random() < 0.7;
      const toFloor = isToLobby
        ? 1
        : Math.floor(Math.random() * this.totalFloors) + 1;

      let fromFloor: number;
      if (isToLobby) {
        // If going to lobby, start from upper floors (2 to totalFloors)
        fromFloor = Math.floor(Math.random() * (this.totalFloors - 1)) + 2;
        this.log(
          `🌆 Evening rush: Lobby-bound request (70% chance) - Floor ${fromFloor} → Floor 1`
        );
      } else {
        // Random origin
        fromFloor = Math.floor(Math.random() * this.totalFloors) + 1;
        while (fromFloor === toFloor) {
          fromFloor = Math.floor(Math.random() * this.totalFloors) + 1;
        }
        this.log(
          `🌆 Evening rush: Random request (30% chance) - Floor ${fromFloor} → Floor ${toFloor}`
        );
      }

      return new RequestClass(fromFloor, toFloor, this.currentTime);
    } else {
      // Normal random request (shouldn't happen during rush hour)
      const fromFloor = Math.floor(Math.random() * this.totalFloors) + 1;
      let toFloor = Math.floor(Math.random() * this.totalFloors) + 1;
      while (toFloor === fromFloor) {
        toFloor = Math.floor(Math.random() * this.totalFloors) + 1;
      }
      this.log(
        `⚠️ Normal request during rush hour - Floor ${fromFloor} → Floor ${toFloor}`
      );
      return new RequestClass(fromFloor, toFloor, this.currentTime);
    }
  }

  /**
   * Generate a random request with rush hour logic
   */
  private generateRandomRequest(): RequestClass {
    // Check if it's rush hour mode
    if (this.isRushHour) {
      this.log(`🌅 Rush hour mode detected: ${this.rushHourType}`);
      const rushRequest = this.generateRushHourRequest();
      this.log(
        `🌅 Generated rush hour request: Floor ${rushRequest.fromFloor} → Floor ${rushRequest.toFloor}`
      );
      return rushRequest;
    }

    // Normal random request generation
    const fromFloor = Math.floor(Math.random() * this.totalFloors) + 1;
    let toFloor = Math.floor(Math.random() * this.totalFloors) + 1;

    // Make sure destination is different from origin
    while (toFloor === fromFloor) {
      toFloor = Math.floor(Math.random() * this.totalFloors) + 1;
    }

    this.log(
      `⏰ Normal mode - generated random request: Floor ${fromFloor} → Floor ${toFloor}`
    );
    return new RequestClass(fromFloor, toFloor, this.currentTime);
  }

  /**
   * Generate requests based on frequency
   */
  private generateRequests(): void {
    // Check if it's time to generate a new request
    if (this.currentTime - this.lastRequestTime >= 1 / this.requestFrequency) {
      const request = this.generateRandomRequest();
      this.pendingRequests.push(request);
      this.totalRequests++;
      this.lastRequestTime = this.currentTime;

      this.log(
        `New request: Floor ${request.fromFloor} → Floor ${request.toFloor}`
      );
    }
  }

  /**
   * Process pending requests
   */
  private processRequests(): void {
    this.log(`📋 Processing ${this.pendingRequests.length} pending requests`);

    // Step 1: Sort requests by priority (highest priority first)
    this.sortRequestsByPriority();

    // Step 2: Process each pending request in priority order
    for (let i = 0; i < this.pendingRequests.length; i++) {
      const request = this.pendingRequests[i];

      // Skip if request is undefined or already assigned
      if (!request || request.isAssigned) {
        continue;
      }

      this.log(
        `🔍 Processing request ${request.id}: Floor ${
          request.fromFloor
        } → Floor ${request.toFloor} (Priority: ${request
          .getPriority(this.currentTime)
          .toFixed(2)})`
      );

      // If request already has an assigned elevator (manual assignment),
      // directly assign it without finding the best elevator
      if (request.assignedElevatorId !== undefined) {
        const assignedElevator = this.elevators.find(
          (e) => e.id === request.assignedElevatorId
        );
        if (assignedElevator) {
          this.scheduler.assignRequest(request, assignedElevator);
          this.log(
            `🎛️ Manual request assigned to Elevator ${
              assignedElevator.id
            } (Priority: ${request.getPriority(this.currentTime).toFixed(2)})`
          );
          continue;
        } else {
          this.log(
            `⚠️ Assigned elevator ${request.assignedElevatorId} not found, will find best elevator`
          );
        }
      }

      // Find best elevator for this request
      const bestElevator = this.scheduler.findBestElevator(request);

      if (bestElevator !== null) {
        this.log(
          `🎯 Best elevator found: Elevator ${
            bestElevator.id
          } (Distance: ${bestElevator.getDistanceToFloor(
            request.fromFloor
          )} floors)`
        );

        // Check if elevator is currently serving a high-priority request
        const currentHighPriorityRequest = this.pendingRequests.find(
          (r) =>
            r.isAssigned &&
            r.assignedElevatorId === bestElevator.id &&
            r.getPriority(this.currentTime) > 10 &&
            !r.isDeliveryComplete
        );

        // Only assign new requests if elevator is not serving a high-priority request
        if (!currentHighPriorityRequest) {
          // Assign request to elevator
          this.scheduler.assignRequest(request, bestElevator);
          this.log(
            `✅ Request assigned to Elevator ${
              bestElevator.id
            } (Priority: ${request.getPriority(this.currentTime).toFixed(2)})`
          );
        } else {
          this.log(
            `⏸️ Skipping request assignment - Elevator ${bestElevator.id} serving high-priority request`
          );
        }
      } else {
        this.log(
          `❌ No suitable elevator found for request Floor ${request.fromFloor} → Floor ${request.toFloor}`
        );
      }
    }
  }

  /**
   * Sort pending requests by priority (highest priority first)
   * This ensures that requests waiting longer get served first
   */
  private sortRequestsByPriority(): void {
    this.log(`🔄 Sorting ${this.pendingRequests.length} requests by priority`);

    this.pendingRequests.sort((a, b) => {
      // Get priority scores for both requests
      const priorityA = a.getPriority(this.currentTime);
      const priorityB = b.getPriority(this.currentTime);

      // Log priority comparison for debugging
      this.log(
        `🔍 Priority comparison: Request ${a.id} (${priorityA.toFixed(
          2
        )}) vs Request ${b.id} (${priorityB.toFixed(2)})`
      );

      // Sort in descending order (highest priority first)
      return priorityB - priorityA;
    });

    this.log(
      `📊 Request priority order: ${this.pendingRequests
        .map((r) => `${r.id}(${r.getPriority(this.currentTime).toFixed(2)})`)
        .join(" → ")}`
    );
  }

  /**
   * Update elevator movements and handle requests
   */
  private updateElevators(): void {
    for (const elevator of this.elevators) {
      // Log elevator status
      this.log(
        `🛗 Elevator ${elevator.id} at Floor ${elevator.currentFloor} | Direction: ${elevator.direction} | Passengers: ${elevator.passengerCount}/${elevator.maxCapacity} | Moving: ${elevator.isMoving}`
      );

      // Move elevator if it has a target
      if (elevator.targetFloor !== undefined) {
        if (elevator.hasReachedTarget()) {
          this.log(
            `🎯 Elevator ${elevator.id} reached target floor ${elevator.currentFloor}`
          );
          elevator.stop();
          elevator.openDoors();
          this.log(
            `🚪 Elevator ${elevator.id} doors opened at floor ${elevator.currentFloor}`
          );

          // Process passengers at this floor
          this.processPassengers(elevator);

          // Close doors after processing
          setTimeout(() => {
            elevator.closeDoors();
            this.log(
              `🚪 Elevator ${elevator.id} doors closed at floor ${elevator.currentFloor}`
            );
          }, 1000);
        } else {
          elevator.move();
          this.log(
            `🚀 Elevator ${elevator.id} moved ${elevator.direction} to floor ${elevator.currentFloor}`
          );
        }
      } else {
        // Elevator is idle, check for new requests
        this.updateElevatorTargetsForRequests(elevator);
      }
    }
  }

  /**
   * Process passengers for an elevator at its current floor
   * @param elevator - The elevator to process passengers for
   */
  private processPassengers(elevator: ElevatorClass): void {
    this.log(
      `👥 Processing passengers for Elevator ${elevator.id} at Floor ${elevator.currentFloor}`
    );

    // Find requests that need pickup or delivery at this floor
    const requestsAtFloor = this.pendingRequests.filter(
      (request) =>
        request.isAssigned &&
        request.assignedElevatorId === elevator.id &&
        ((request.fromFloor === elevator.currentFloor &&
          !request.isPickupComplete) ||
          (request.toFloor === elevator.currentFloor &&
            request.isPickupComplete &&
            !request.isDeliveryComplete))
    );

    this.log(
      `📋 Found ${requestsAtFloor.length} requests to process at Floor ${elevator.currentFloor}`
    );

    for (const request of requestsAtFloor) {
      // Pickup passengers
      if (
        request.fromFloor === elevator.currentFloor &&
        !request.isPickupComplete
      ) {
        if (elevator.hasCapacity()) {
          elevator.addPassengers(1);
          request.isPickupComplete = true;
          this.log(
            `✅ Pickup completed for request Floor ${request.fromFloor} → Floor ${request.toFloor} at time ${this.currentTime}`
          );
        } else {
          this.log(
            `⚠️ Elevator ${elevator.id} at capacity, cannot pickup passenger for request Floor ${request.fromFloor} → Floor ${request.toFloor}`
          );
        }
      }

      // Drop off passengers
      if (
        request.toFloor === elevator.currentFloor &&
        request.isPickupComplete &&
        !request.isDeliveryComplete
      ) {
        elevator.removePassengers(1);
        request.isDeliveryComplete = true;
        this.log(
          `✅ Delivery completed for request Floor ${request.fromFloor} → Floor ${request.toFloor} at time ${this.currentTime}`
        );
      }
    }
  }

  /**
   * Complete requests that were served by this elevator
   * @param elevator - The elevator that served the requests
   */
  private completeRequestsForElevator(elevator: ElevatorClass): void {
    // Find requests that were assigned to this elevator and are now completed
    // Sort by priority (highest priority first) to ensure high-priority requests are processed first
    const assignedRequests = this.pendingRequests
      .filter((request) => request.assignedElevatorId === elevator.id)
      .sort(
        (a, b) =>
          b.getPriority(this.currentTime) - a.getPriority(this.currentTime)
      );

    for (const request of assignedRequests) {
      if (
        request &&
        request.isAssigned &&
        request.assignedElevatorId === elevator.id
      ) {
        // Check if this request was served using two-phase completion
        const isAtOrigin = elevator.currentFloor === request.fromFloor;
        const isAtDestination = elevator.currentFloor === request.toFloor;
        const hasPassengers = elevator.passengerCount > 0;

        // Phase 1: Pickup - when elevator is at origin and passengers get on
        if (
          isAtOrigin &&
          !request.isPickupComplete &&
          elevator.passengerCount > 0
        ) {
          request.isPickupComplete = true;
          request.pickupTime = this.currentTime; // Track when pickup happened
          console.log(
            `🔄 Pickup completed for request Floor ${request.fromFloor} → Floor ${request.toFloor} at time ${this.currentTime}`
          );
          // Break after marking pickup complete for this specific request
          break;
        }

        // Alternative pickup completion: when elevator is at origin and has capacity
        if (isAtOrigin && !request.isPickupComplete && elevator.hasCapacity()) {
          request.isPickupComplete = true;
          console.log(
            `🔄 Pickup completed for request Floor ${request.fromFloor} → Floor ${request.toFloor} (at origin with capacity)`
          );
          // Break after marking pickup complete for this specific request
          break;
        }

        // Debug: Log what's happening with each request
        console.log(
          `🔍 Request ${request.id}: atOrigin=${isAtOrigin}, pickupComplete=${request.isPickupComplete}, passengers=${elevator.passengerCount}`
        );

        // Phase 2: Delivery - when elevator is at destination and passengers get off
        const wasServed =
          isAtDestination &&
          request.isPickupComplete &&
          !request.isDeliveryComplete &&
          elevator.passengerCount === 0;

        if (wasServed) {
          // Mark delivery as complete
          request.isDeliveryComplete = true;

          // Mark request as completed
          request.isAssigned = false;
          delete request.assignedElevatorId;

          // Remove from pending requests
          const index = this.pendingRequests.findIndex(
            (r) => r.id === request.id
          );
          if (index !== -1) {
            this.pendingRequests.splice(index, 1);
          }

          // Calculate timing metrics for this completed request
          const waitTime = request.getWaitTime(this.currentTime);
          const travelTime = request.pickupTime
            ? this.currentTime - request.pickupTime
            : 0; // Time from pickup to delivery

          // Store timing data for statistics
          this.completedRequestsWithTimes.push({
            waitTime: waitTime,
            travelTime: travelTime,
            completionTime: this.currentTime,
          });

          // Increment completed requests
          this.completedRequests++;

          // Determine if this was a manual or auto request
          const requestType = request.isManual ? "MANUAL" : "AUTO";

          console.log(
            `🎉 ${requestType} request completed: Floor ${
              request.fromFloor
            } → Floor ${request.toFloor} by Elevator ${
              elevator.id
            } (waited ${waitTime.toFixed(1)}s, travel: ${travelTime.toFixed(
              1
            )}s, priority: ${request.getPriority(this.currentTime).toFixed(1)})`
          );
        } else {
          // Debug: Log why request wasn't completed
          console.log(
            `🔍 Request ${request.id} not completed: atDestination=${isAtDestination}, pickupComplete=${request.isPickupComplete}, deliveryComplete=${request.isDeliveryComplete}, passengers=${elevator.passengerCount}, elevatorFloor=${elevator.currentFloor}, requestToFloor=${request.toFloor}`
          );
        }
      }
    }
  }

  /**
   * Update elevator targets based on assigned requests
   * @param elevator - The elevator to update targets for
   */
  private updateElevatorTargetsForRequests(elevator: ElevatorClass): void {
    // Find requests assigned to this elevator
    const assignedRequests = this.pendingRequests.filter(
      (request) => request.assignedElevatorId === elevator.id
    );

    if (assignedRequests.length > 0) {
      // Sort by priority (highest priority first) to ensure high-priority requests are served first
      const sortedRequests = assignedRequests.sort(
        (a, b) =>
          b.getPriority(this.currentTime) - a.getPriority(this.currentTime)
      );

      // Get the highest priority request
      const nextRequest = sortedRequests[0];

      if (nextRequest) {
        // Two-phase targeting: origin first, then destination
        if (!nextRequest.isPickupComplete) {
          // Phase 1: Go to origin floor to pick up passengers
          elevator.setTarget(nextRequest.fromFloor);
          console.log(
            `🎯 Elevator ${elevator.id} targeting Floor ${
              nextRequest.fromFloor
            } (pickup) for request Floor ${nextRequest.fromFloor} → Floor ${
              nextRequest.toFloor
            } (Priority: ${nextRequest
              .getPriority(this.currentTime)
              .toFixed(1)})`
          );
        } else if (!nextRequest.isDeliveryComplete) {
          // Phase 2: Go to destination floor to drop off passengers
          elevator.setTarget(nextRequest.toFloor);
          console.log(
            `🎯 Elevator ${elevator.id} targeting Floor ${
              nextRequest.toFloor
            } (delivery) for request Floor ${nextRequest.fromFloor} → Floor ${
              nextRequest.toFloor
            } (Priority: ${nextRequest
              .getPriority(this.currentTime)
              .toFixed(1)})`
          );
        } else {
          // Request is complete, remove it and move to next request
          console.log(
            `✅ Request completed: Floor ${nextRequest.fromFloor} → Floor ${nextRequest.toFloor}`
          );
          // The request will be removed in completeRequestsForElevator
        }
      }
    } else {
      // No more requests, go idle
      elevator.stop();
    }
  }

  /**
   * Update simulation statistics
   */
  private updateStatistics(): void {
    // Calculate average wait time for completed requests
    if (this.completedRequests > 0) {
      // Calculate average wait time from completed requests
      const totalWaitTime = this.completedRequestsWithTimes.reduce(
        (sum, request) => sum + request.waitTime,
        0
      );
      this.averageWaitTime = totalWaitTime / this.completedRequests;

      // Calculate max wait time
      this.maxWaitTime = Math.max(
        ...this.completedRequestsWithTimes.map((request) => request.waitTime)
      );

      // Calculate average travel time
      const totalTravelTime = this.completedRequestsWithTimes.reduce(
        (sum, request) => sum + request.travelTime,
        0
      );
      this.averageTravelTime = totalTravelTime / this.completedRequests;
    }

    // Calculate elevator utilization rate
    const totalElevatorTime = this.elevators.reduce(
      (sum, elevator) => sum + (elevator.isMoving ? 1 : 0),
      0
    );
    this.elevatorUtilization = (totalElevatorTime / this.totalElevators) * 100;
  }

  /**
   * Main simulation step - called every tick
   */
  public step(): void {
    if (!this.isRunning) {
      return;
    }

    // Update time
    this.currentTime += this.speed;

    // Generate new requests
    this.generateRequests();

    // Process pending requests
    this.processRequests();

    // Update elevator movements
    this.updateElevators();

    // Update statistics
    this.updateStatistics();
  }

  /**
   * Get current simulation state
   */
  public getState(): any {
    return {
      isRunning: this.isRunning,
      currentTime: this.currentTime,
      speed: this.speed,
      totalFloors: this.totalFloors,
      totalElevators: this.totalElevators,
      elevators: this.elevators.map((elevator) => ({
        id: elevator.id,
        currentFloor: elevator.currentFloor,
        direction: elevator.direction,
        passengerCount: elevator.passengerCount,
        maxCapacity: elevator.maxCapacity,
        doorsOpen: elevator.doorsOpen,
        targetFloor: elevator.targetFloor,
        isMoving: elevator.isMoving,
      })),
      pendingRequests: this.pendingRequests.length,
      totalRequests: this.totalRequests,
      completedRequests: this.completedRequests,
      averageWaitTime: this.averageWaitTime,
      maxWaitTime: this.maxWaitTime,
      averageTravelTime: this.averageTravelTime,
      elevatorUtilization: this.elevatorUtilization,
      // NEW: Rush hour state
      isRushHour: this.isRushHour,
      rushHourType:
        this.rushHourType === "morning"
          ? "🌅 MORNING RUSH"
          : this.rushHourType === "evening"
          ? "🌆 EVENING RUSH"
          : "⏰ NORMAL HOURS",
      simulationHour: this.simulationHour,
    };
  }

  /**
   * Set request frequency
   * @param frequency - Requests per second
   */
  public setRequestFrequency(frequency: number): void {
    this.requestFrequency = frequency;
    console.log(`Request frequency set to ${frequency} requests/second`);
  }

  /**
   * Add manual request from frontend
   * @param fromFloor - Origin floor
   * @param toFloor - Destination floor
   */
  public addManualRequest(fromFloor: number, toFloor: number): void {
    const request = new RequestClass(fromFloor, toFloor, this.currentTime);
    request.isManual = true; // Mark as manual request
    this.pendingRequests.push(request);
    this.totalRequests++;
    console.log(
      `📋 Manual request: { fromFloor: ${fromFloor}, toFloor: ${toFloor} } [${new Date().toLocaleTimeString()}]`
    );
  }

  /**
   * Add a test request that simulates a long-waiting request
   * This helps test the priority escalation system
   */
  public addLongWaitingRequest(fromFloor: number, toFloor: number): void {
    // Create a request that appears to have been waiting for 45 seconds
    const request = new RequestClass(fromFloor, toFloor, this.currentTime - 45);
    request.isManual = true;
    this.pendingRequests.push(request);
    this.totalRequests++;
    console.log(
      `⏰ Long-waiting request: { fromFloor: ${fromFloor}, toFloor: ${toFloor} } (waiting 45s) [${new Date().toLocaleTimeString()}]`
    );
  }

  /**
   * Add manual elevator-specific request from frontend
   * @param elevatorId - Specific elevator to handle the request
   * @param fromFloor - Origin floor
   * @param toFloor - Destination floor
   */
  public addManualElevatorRequest(
    elevatorId: number,
    fromFloor: number,
    toFloor: number
  ): void {
    const request = new RequestClass(fromFloor, toFloor, this.currentTime);
    request.isManual = true; // Mark as manual request
    request.assignedElevatorId = elevatorId; // Assign to specific elevator

    // Find the assigned elevator and mark request as assigned
    const assignedElevator = this.elevators.find((e) => e.id === elevatorId);
    if (assignedElevator) {
      request.isAssigned = true; // Mark as assigned immediately
      this.scheduler.assignRequest(request, assignedElevator);
    }

    this.pendingRequests.push(request);
    this.totalRequests++;
    console.log(
      `🎛️ Manual elevator request: Elevator ${elevatorId}, { fromFloor: ${fromFloor}, toFloor: ${toFloor} } [${new Date().toLocaleTimeString()}]`
    );
  }
}
