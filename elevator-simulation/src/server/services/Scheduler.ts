/**
 * SCAN Scheduler - Simple elevator scheduling algorithm
 * This class decides which elevator should serve which request
 */

// Import our classes
import { RequestClass } from "../models/Request";
import { ElevatorClass } from "../models/Elevator";

/**
 * SCAN Scheduler Class
 * Implements the SCAN (Elevator) algorithm for scheduling
 */
export class Scheduler {
  // List of all elevators in the building
  private elevators: ElevatorClass[] = [];

  /**
   * Constructor - Creates a new scheduler
   * @param elevators - Array of elevators to manage
   */
  constructor(elevators: ElevatorClass[]) {
    this.elevators = elevators;
  }

  /**
   * Find the best elevator for a request using SCAN algorithm
   * @param request - The request to assign
   * @returns The best elevator or null if none available
   */
  public findBestElevator(request: RequestClass): ElevatorClass | null {
    // Step 1: Find idle elevators (easiest to assign)
    const idleElevators = this.elevators.filter((elevator) =>
      elevator.isIdle()
    );

    if (idleElevators.length > 0) {
      // If we have idle elevators, pick the closest one
      return this.findClosestElevator(idleElevators, request.fromFloor);
    }

    // Step 2: Find elevators going in the right direction
    const suitableElevators = this.findSuitableElevators(request);

    if (suitableElevators.length > 0) {
      // Pick the closest suitable elevator
      return this.findClosestElevator(suitableElevators, request.fromFloor);
    }

    // Step 3: If no suitable elevators, pick any available one
    const availableElevators = this.elevators.filter((elevator) =>
      elevator.hasCapacity()
    );

    if (availableElevators.length > 0) {
      return this.findClosestElevator(availableElevators, request.fromFloor);
    }

    // No elevators available
    return null;
  }

  /**
   * Find elevators that are suitable for this request
   * @param request - The request to check
   * @returns Array of suitable elevators
   */
  private findSuitableElevators(request: RequestClass): ElevatorClass[] {
    return this.elevators.filter((elevator) => {
      // Check if elevator has capacity
      if (!elevator.hasCapacity()) {
        return false;
      }

      // Check if elevator is going in the right direction
      if (request.isGoingUp() && elevator.direction === "up") {
        // Request is going up, elevator is going up
        return elevator.currentFloor <= request.fromFloor;
      }

      if (request.isGoingDown() && elevator.direction === "down") {
        // Request is going down, elevator is going down
        return elevator.currentFloor >= request.fromFloor;
      }

      return false;
    });
  }

  /**
   * Find the closest elevator to a floor
   * @param elevators - Array of elevators to check
   * @param floor - Target floor
   * @returns The closest elevator
   */
  private findClosestElevator(
    elevators: ElevatorClass[],
    floor: number
  ): ElevatorClass {
    if (elevators.length === 0) {
      throw new Error("No elevators available");
    }

    let closestElevator = elevators[0]!;
    let shortestDistance = closestElevator.getDistanceToFloor(floor);

    for (const elevator of elevators) {
      const distance = elevator.getDistanceToFloor(floor);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        closestElevator = elevator;
      }
    }

    return closestElevator;
  }

  /**
   * Assign a request to an elevator
   * @param request - The request to assign
   * @param elevator - The elevator to assign it to
   */
  public assignRequest(request: RequestClass, elevator: ElevatorClass): void {
    // Mark request as assigned
    request.isAssigned = true;
    request.assignedElevatorId = elevator.id;

    // Add request to elevator's assigned requests
    elevator.assignedRequests.push(request.id);

    // Set elevator's target to the request's origin floor
    elevator.setTarget(request.fromFloor);
  }

  /**
   * Update elevator targets based on assigned requests
   * This is called after an elevator reaches its current target
   */
  public updateElevatorTargets(): void {
    for (const elevator of this.elevators) {
      // If elevator has reached its target and has assigned requests
      if (elevator.hasReachedTarget() && elevator.assignedRequests.length > 0) {
        // Simple approach: just move in the current direction
        if (elevator.direction === "up") {
          // Don't go beyond the top floor
          const nextFloor = Math.min(elevator.currentFloor + 1, 5); // Hardcoded for now
          elevator.setTarget(nextFloor);
        } else if (elevator.direction === "down") {
          // Don't go below the ground floor
          const nextFloor = Math.max(elevator.currentFloor - 1, 1);
          elevator.setTarget(nextFloor);
        } else {
          // If idle, start moving up
          const nextFloor = Math.min(elevator.currentFloor + 1, 5);
          elevator.setTarget(nextFloor);
        }
      }
    }
  }
}
