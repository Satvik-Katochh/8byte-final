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
    let closestElevator = elevators[0];
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
        // Find the next request for this elevator
        // For now, we'll just pick the first assigned request
        // In a real implementation, this would be more sophisticated

        // For simplicity, we'll just set a new target
        // This is where the SCAN logic would be more complex
        this.setNextTargetForElevator(elevator);
      }
    }
  }

  /**
   * Set the next target for an elevator based on SCAN algorithm
   * @param elevator - The elevator to set target for
   */
  private setNextTargetForElevator(elevator: ElevatorClass): void {
    // Simple SCAN logic:
    // If elevator is going up, find the highest request above current floor
    // If elevator is going down, find the lowest request below current floor

    // For now, we'll implement a simple version
    // In a real implementation, this would look at all assigned requests

    if (elevator.direction === "up") {
      // Look for requests above current floor
      // For simplicity, we'll just move up one floor
      elevator.setTarget(elevator.currentFloor + 1);
    } else if (elevator.direction === "down") {
      // Look for requests below current floor
      // For simplicity, we'll just move down one floor
      elevator.setTarget(elevator.currentFloor - 1);
    } else {
      // Elevator is idle, pick a direction based on requests
      // For simplicity, we'll just go up
      elevator.setTarget(elevator.currentFloor + 1);
    }
  }
}
