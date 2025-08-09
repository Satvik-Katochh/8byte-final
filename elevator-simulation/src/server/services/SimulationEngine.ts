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
      const elevator = new ElevatorClass(i + 1, 15, startingFloor);
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
   * Process pending requests with HYBRID AGGRESSIVE strategy
   */
  private processRequests(): void {
    this.log(`📋 Processing ${this.pendingRequests.length} pending requests`);

    // Step 1: Emergency rebalancing - only if load imbalance is too high (ultra-aggressive threshold)
    this.emergencyRebalancing();

    // Step 2: Predictive positioning - move idle elevators to high-traffic areas
    this.predictivePositioning();

    // Step 3: Sort requests by priority (highest priority first) - ultra-frequent sorting
    if (this.pendingRequests.length > 3) {
      // Ultra-reduced threshold for more frequent sorting
      this.sortRequestsByPriority();
    }

    // Step 4: Process each request in priority order
    for (let i = 0; i < this.pendingRequests.length; i++) {
      const request = this.pendingRequests[i];

      // Skip if request is undefined or already assigned
      if (!request || request.isAssigned) {
        continue;
      }

      // If request already has an assigned elevator (manual assignment),
      // directly assign it without finding the best elevator
      if (request.assignedElevatorId !== undefined) {
        const assignedElevator = this.elevators.find(
          (e) => e.id === request.assignedElevatorId
        );
        if (assignedElevator) {
          this.scheduler.assignRequest(request, assignedElevator);
          continue;
        }
      }

      // Find best elevator for this request using the hybrid aggressive scheduler
      this.scheduler.setPendingRequests(this.pendingRequests);
      const bestElevator = this.scheduler.findBestElevator(
        request,
        this.pendingRequests
      );

      if (bestElevator !== null) {
        // Assign request to elevator
        this.scheduler.assignRequest(request, bestElevator);
        this.log(
          `✅ Request assigned to Elevator ${
            bestElevator.id
          } (Priority: ${request
            .getPriority(this.currentTime)
            .toFixed(2)}) - Loads: E1=${
            this.elevators[0]?.assignedRequests.length || 0
          } E2=${this.elevators[1]?.assignedRequests.length || 0}`
        );
      } else {
        this.log(
          `❌ No suitable elevator found for request Floor ${request.fromFloor} → Floor ${request.toFloor}`
        );
      }
    }
  }

  /**
   * Emergency rebalancing - redistribute requests when load imbalance is too high
   */
  private emergencyRebalancing(): void {
    const loads = this.elevators.map((e) => e.assignedRequests.length);
    const maxLoad = Math.max(...loads);
    const minLoad = Math.min(...loads);
    const loadDifference = maxLoad - minLoad;

    // Ultra-reduced threshold for rebalancing to improve completion rate
    if (loadDifference > 3) {
      // Ultra-reduced threshold for more aggressive rebalancing
      this.log(
        `🚨 EMERGENCY REBALANCING: Load difference ${loadDifference} (E1=${loads[0]} E2=${loads[1]})`
      );

      const overloadedElevator = this.elevators.find(
        (e) => e.assignedRequests.length === maxLoad
      );
      const underloadedElevator = this.elevators.find(
        (e) => e.assignedRequests.length === minLoad
      );

      if (overloadedElevator && underloadedElevator) {
        // Move some requests from overloaded to underloaded elevator
        const requestsToMove = Math.floor(loadDifference / 1.5); // Ultra-aggressive reassignment
        const requests = overloadedElevator.assignedRequests.slice(
          0,
          requestsToMove
        );

        for (const requestId of requests) {
          const request = this.pendingRequests.find((r) => r.id === requestId);
          if (request && !request.isPickupComplete) {
            // Reassign to underloaded elevator
            request.assignedElevatorId = underloadedElevator.id;
            overloadedElevator.assignedRequests =
              overloadedElevator.assignedRequests.filter(
                (id) => id !== requestId
              );
            underloadedElevator.assignedRequests.push(requestId);
            this.log(
              `🔄 Reassigned request ${requestId} from E${overloadedElevator.id} to E${underloadedElevator.id}`
            );
          }
        }
      }
    }
  }

  /**
   * Predictive positioning - move idle elevators to high-traffic areas
   */
  private predictivePositioning(): void {
    for (const elevator of this.elevators) {
      // Only reposition if elevator is idle and has no passengers and no assigned requests
      if (
        elevator.isIdle() &&
        elevator.passengerCount === 0 &&
        elevator.assignedRequests.length === 0
      ) {
        const highTrafficFloor = this.getHighTrafficFloor();
        if (
          highTrafficFloor &&
          Math.abs(elevator.currentFloor - highTrafficFloor) > 2
        ) {
          // Ultra-reduced threshold for more aggressive positioning
          elevator.setTarget(highTrafficFloor);
          this.log(
            `🎯 Predictive positioning: Elevator ${elevator.id} moving to high-traffic floor ${highTrafficFloor}`
          );
        }
      }
    }
  }

  /**
   * Get the highest traffic floor based on pending requests with improved logic
   */
  private getHighTrafficFloor(): number | null {
    const floorCounts = new Map<number, number>();

    // Count requests by floor with weighted scoring
    for (const request of this.pendingRequests) {
      if (!request.isAssigned) {
        // Count origin floors with higher weight
        const originCount = floorCounts.get(request.fromFloor) || 0;
        floorCounts.set(request.fromFloor, originCount + 3); // Increased weight for origin floors

        // Count destination floors with lower weight
        const destCount = floorCounts.get(request.toFloor) || 0;
        floorCounts.set(request.toFloor, destCount + 1);
      }
    }

    // Find floor with most requests
    let maxFloor = null;
    let maxCount = 0;

    for (const [floor, count] of floorCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        maxFloor = floor;
      }
    }

    // Ultra-reduced threshold for more aggressive predictive positioning
    return maxCount >= 1 ? maxFloor : null; // Ultra-reduced threshold
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

      // Sort in descending order (highest priority first)
      return priorityB - priorityA;
    });

    // Only log the top 5 requests for performance
    const topRequests = this.pendingRequests.slice(0, 5);
    this.log(
      `📊 Top 5 requests by priority: ${topRequests
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

          // Update targets for remaining requests
          this.updateElevatorTargetsForRequests(elevator);

          // Close doors immediately after processing (no delay)
          elevator.closeDoors();
          this.log(
            `🚪 Elevator ${elevator.id} doors closed at floor ${elevator.currentFloor}`
          );
        } else {
          // Move elevator towards target
          elevator.move();
        }
      } else {
        // No target, try to find one
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

    const completedRequests: RequestClass[] = [];

    for (const request of requestsAtFloor) {
      // Pickup passengers
      if (
        request.fromFloor === elevator.currentFloor &&
        !request.isPickupComplete
      ) {
        if (elevator.hasCapacity()) {
          elevator.addPassengers(1);
          request.isPickupComplete = true;
          request.pickupTime = this.currentTime;
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
        request.deliveryTime = this.currentTime;

        // Calculate completion times
        const waitTime =
          (request.pickupTime || this.currentTime) - request.timestamp;
        const travelTime =
          (request.deliveryTime || this.currentTime) -
          (request.pickupTime || this.currentTime);

        // Add to completed requests
        this.completedRequests++;
        this.completedRequestsWithTimes.push({
          waitTime,
          travelTime,
          completionTime: this.currentTime,
        });

        this.log(
          `✅ Delivery completed for request Floor ${
            request.fromFloor
          } → Floor ${request.toFloor} at time ${
            this.currentTime
          } (Wait: ${waitTime.toFixed(1)}s, Travel: ${travelTime.toFixed(1)}s)`
        );

        // Mark request as completed and add to cleanup list
        request.isAssigned = false;
        delete request.assignedElevatorId;
        completedRequests.push(request);
      }
    }

    // Cleanup completed requests from pendingRequests array
    for (const completedRequest of completedRequests) {
      const index = this.pendingRequests.findIndex(
        (req) => req.id === completedRequest.id
      );
      if (index !== -1) {
        this.pendingRequests.splice(index, 1);
        this.log(
          `🧹 Cleaned up completed request ${completedRequest.id} from pendingRequests array`
        );
      }
    }

    // Cleanup completed requests from elevator's assignedRequests array
    for (const completedRequest of completedRequests) {
      const index = elevator.assignedRequests.findIndex(
        (reqId) => reqId === completedRequest.id
      );
      if (index !== -1) {
        elevator.assignedRequests.splice(index, 1);
        this.log(
          `🧹 Cleaned up completed request ${completedRequest.id} from Elevator ${elevator.id} - New load: ${elevator.assignedRequests.length}`
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
    const assignedRequests = this.pendingRequests.filter(
      (request) => request.assignedElevatorId === elevator.id
    );

    // Log current load for debugging
    if (assignedRequests.length > 0) {
      this.log(
        `🔍 Elevator ${elevator.id} has ${assignedRequests.length} assigned requests, ${elevator.assignedRequests.length} in assignedRequests array`
      );
    }

    // Check for completed requests that need cleanup
    const completedRequests = assignedRequests.filter(
      (request) => request.isDeliveryComplete
    );

    for (const completedRequest of completedRequests) {
      // Remove from elevator's assigned requests array
      const assignedIndex = elevator.assignedRequests.indexOf(
        completedRequest.id
      );
      if (assignedIndex > -1) {
        elevator.assignedRequests.splice(assignedIndex, 1);
        this.log(
          `🧹 Cleaned up completed request ${completedRequest.id} from Elevator ${elevator.id} - New load: ${elevator.assignedRequests.length}`
        );
      }

      // Remove from pending requests
      const requestIndex = this.pendingRequests.indexOf(completedRequest);
      if (requestIndex > -1) {
        this.pendingRequests.splice(requestIndex, 1);
        this.log(
          `🗑️ Removed completed request ${completedRequest.id} from pending list`
        );
      }
    }
  }

  /**
   * Get all assigned requests for an elevator
   * @param elevator - The elevator to get requests for
   * @returns Array of assigned requests
   */
  private getAssignedRequests(elevator: ElevatorClass): RequestClass[] {
    return this.pendingRequests.filter(
      (request) => request.assignedElevatorId === elevator.id
    );
  }

  /**
   * Update elevator targets based on current assignments with improved logic
   */
  private updateElevatorTargetsForRequests(elevator: ElevatorClass): void {
    const assignedRequests = this.getAssignedRequests(elevator);

    if (assignedRequests.length === 0) return;

    // Sort by priority (highest priority first) and then by wait time
    const sortedRequests = assignedRequests.sort((a, b) => {
      const priorityA = a.getPriority(this.currentTime);
      const priorityB = b.getPriority(this.currentTime);

      if (Math.abs(priorityA - priorityB) > 50) {
        return priorityB - priorityA; // Priority difference is significant
      }

      // If priorities are close, consider wait time
      const waitTimeA = a.getWaitTime(this.currentTime);
      const waitTimeB = b.getWaitTime(this.currentTime);
      return waitTimeB - waitTimeA;
    });

    const nextRequest = sortedRequests[0];
    if (!nextRequest) return;

    // Simple targeting logic:
    // 1. If pickup not complete, go to pickup floor
    // 2. If pickup complete, go to destination floor
    let targetFloor: number;

    if (!nextRequest.isPickupComplete) {
      targetFloor = nextRequest.fromFloor;
    } else {
      targetFloor = nextRequest.toFloor;
    }

    // Only change target if it's different from current target
    if (elevator.targetFloor !== targetFloor) {
      elevator.setTarget(targetFloor);
      this.log(
        `🎯 Elevator ${elevator.id} targeting Floor ${targetFloor} (${
          !nextRequest.isPickupComplete ? "pickup" : "delivery"
        }) for request Floor ${nextRequest.fromFloor} → Floor ${
          nextRequest.toFloor
        } (Priority: ${nextRequest.getPriority(this.currentTime).toFixed(1)})`
      );
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
