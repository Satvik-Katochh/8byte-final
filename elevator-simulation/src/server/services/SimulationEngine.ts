/**
 * Simulation Engine - Main simulation loop and state management
 * This class runs the elevator simulation and manages all the logic
 */

import { RequestClass } from "../models/Request";
import { ElevatorClass } from "../models/Elevator";
import { Scheduler } from "./Scheduler";

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
    console.log("Simulation started");
  }

  /**
   * Stop the simulation
   */
  public stop(): void {
    this.isRunning = false;
    console.log("Simulation stopped");
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
   * @param speed - Speed multiplier (1, 2, 5, 10)
   */
  public setSpeed(speed: number): void {
    this.speed = speed;
    console.log(`Simulation speed set to ${speed}x`);
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
   * Generate rush hour request with lobby bias
   */
  private generateRushHourRequest(): RequestClass {
    // 70% chance of request from lobby (floor 1) to upper floors
    const isFromLobby = Math.random() < 0.7;
    const fromFloor = isFromLobby
      ? 1
      : Math.floor(Math.random() * this.totalFloors) + 1;

    let toFloor: number;
    if (isFromLobby) {
      // If from lobby, go to upper floors (2 to totalFloors)
      toFloor = Math.floor(Math.random() * (this.totalFloors - 1)) + 2;
    } else {
      // Random destination
      toFloor = Math.floor(Math.random() * this.totalFloors) + 1;
      while (toFloor === fromFloor) {
        toFloor = Math.floor(Math.random() * this.totalFloors) + 1;
      }
    }

    return new RequestClass(fromFloor, toFloor, this.currentTime);
  }

  /**
   * Generate a random request with rush hour logic
   */
  private generateRandomRequest(): RequestClass {
    // Check if it's morning rush hour
    if (this.isMorningRushHour()) {
      return this.generateRushHourRequest();
    }

    // Normal random request generation
    const fromFloor = Math.floor(Math.random() * this.totalFloors) + 1;
    let toFloor = Math.floor(Math.random() * this.totalFloors) + 1;

    // Make sure destination is different from origin
    while (toFloor === fromFloor) {
      toFloor = Math.floor(Math.random() * this.totalFloors) + 1;
    }

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

      console.log(
        `New request: Floor ${request.fromFloor} → Floor ${request.toFloor}`
      );
    }
  }

  /**
   * Process pending requests
   */
  private processRequests(): void {
    // Step 1: Sort requests by priority (highest priority first)
    this.sortRequestsByPriority();

    // Step 2: Process each pending request in priority order
    for (let i = 0; i < this.pendingRequests.length; i++) {
      const request = this.pendingRequests[i];

      // Skip if request is undefined or already assigned
      if (!request || request.isAssigned) {
        continue;
      }

      // Find best elevator for this request
      const bestElevator = this.scheduler.findBestElevator(request);

      if (bestElevator !== null) {
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
          console.log(
            `Request assigned to Elevator ${
              bestElevator.id
            } (Priority: ${request.getPriority(this.currentTime).toFixed(2)})`
          );
        } else {
          console.log(
            `⏸️ Skipping request assignment - Elevator ${bestElevator.id} serving high-priority request`
          );
        }
      }
    }
  }

  /**
   * Sort pending requests by priority (highest priority first)
   * This ensures that requests waiting longer get served first
   */
  private sortRequestsByPriority(): void {
    this.pendingRequests.sort((a, b) => {
      // Get priority scores for both requests
      const priorityA = a.getPriority(this.currentTime);
      const priorityB = b.getPriority(this.currentTime);

      // Log priority comparison for debugging
      console.log(
        `🔍 Priority comparison: Request ${a.id} (${priorityA.toFixed(
          2
        )}) vs Request ${b.id} (${priorityB.toFixed(2)})`
      );

      // Sort in descending order (highest priority first)
      return priorityB - priorityA;
    });
  }

  /**
   * Update elevator movements
   */
  private updateElevators(): void {
    for (const elevator of this.elevators) {
      // Move elevator if it has a target
      if (
        elevator.targetFloor !== undefined &&
        elevator.currentFloor !== elevator.targetFloor
      ) {
        elevator.move();
        console.log(
          `🚀 Elevator ${elevator.id} moved to floor ${elevator.currentFloor}`
        );
      }

      // Check if elevator reached its target
      if (elevator.hasReachedTarget()) {
        console.log(
          `🎯 Elevator ${elevator.id} reached target floor ${elevator.currentFloor}`
        );

        // Open doors
        elevator.openDoors();

        // Process passengers (simplified)
        this.processPassengers(elevator);

        // Close doors
        elevator.closeDoors();

        // Update elevator targets based on assigned requests
        this.updateElevatorTargetsForRequests(elevator);
      }
    }
  }

  /**
   * Process passengers getting on/off elevator and complete requests
   * @param elevator - The elevator to process
   */
  private processPassengers(elevator: ElevatorClass): void {
    // Simulate some passengers getting off (if elevator has passengers)
    if (elevator.passengerCount > 0) {
      const passengersGettingOff =
        Math.floor(Math.random() * elevator.passengerCount) + 1;
      if (elevator.removePassengers(passengersGettingOff)) {
        console.log(
          `${passengersGettingOff} passengers got off Elevator ${elevator.id}`
        );

        // Complete requests that were served by this elevator
        this.completeRequestsForElevator(elevator);
      }
    }

    // Simulate some passengers getting on (if elevator has capacity)
    if (elevator.hasCapacity()) {
      const passengersGettingOn = Math.floor(Math.random() * 2) + 1; // 1-2 passengers
      if (elevator.addPassengers(passengersGettingOn)) {
        console.log(
          `${passengersGettingOn} passengers got on Elevator ${elevator.id}`
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
  public addManualElevatorRequest(elevatorId: number, fromFloor: number, toFloor: number): void {
    const request = new RequestClass(fromFloor, toFloor, this.currentTime);
    request.isManual = true; // Mark as manual request
    request.assignedElevatorId = elevatorId; // Assign to specific elevator
    this.pendingRequests.push(request);
    this.totalRequests++;
    console.log(
      `🎛️ Manual elevator request: Elevator ${elevatorId}, { fromFloor: ${fromFloor}, toFloor: ${toFloor} } [${new Date().toLocaleTimeString()}]`
    );
  }
}
