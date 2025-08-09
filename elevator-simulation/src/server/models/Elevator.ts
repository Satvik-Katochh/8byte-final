/**
 * Elevator Class - Handles elevator behavior and movement
 * This class extends the Elevator interface with behavior and methods
 */

// Import the Elevator interface from shared types
import { Elevator } from "../../../shared/types";

/**
 * Elevator Class
 * This class represents an elevator with movement and passenger management
 */
export class ElevatorClass implements Elevator {
  // Properties from the Elevator interface
  public id: number;
  public currentFloor: number;
  public direction: "up" | "down" | "idle";
  public passengerCount: number;
  public maxCapacity: number;
  public doorsOpen: boolean;

  // Additional properties for the class
  public targetFloor: number | undefined = undefined; // Which floor the elevator is heading to
  public isMoving: boolean = false; // Whether the elevator is currently moving
  public assignedRequests: string[] = []; // IDs of requests assigned to this elevator

  /**
   * Constructor - Creates a new elevator
   * @param id - Unique elevator ID
   * @param maxCapacity - Maximum number of passengers
   * @param startingFloor - Floor where elevator starts (default: 1)
   */
  constructor(id: number, maxCapacity: number, startingFloor: number = 1) {
    this.id = id;
    this.maxCapacity = maxCapacity;
    this.currentFloor = startingFloor;
    this.direction = "idle";
    this.passengerCount = 0;
    this.doorsOpen = false;
  }

  /**
   * Move the elevator multiple floors in its current direction (optimized for efficiency)
   */
  public move(): void {
    if (this.direction === "up") {
      // Move up by 10 floors, but don't overshoot the target
      const targetFloor = this.targetFloor || 50;
      const newFloor = Math.min(this.currentFloor + 10, targetFloor);
      this.currentFloor = Math.min(newFloor, 50);
    } else if (this.direction === "down") {
      // Move down by 10 floors, but don't overshoot the target
      const targetFloor = this.targetFloor || 1;
      const newFloor = Math.max(this.currentFloor - 10, targetFloor);
      this.currentFloor = Math.max(newFloor, 1);
    }

    this.isMoving = true;
  }

  /**
   * Stop the elevator and set direction to idle
   */
  public stop(): void {
    this.direction = "idle";
    this.isMoving = false;
    this.targetFloor = undefined;
  }

  /**
   * Set the elevator's target floor and direction with optimized logic
   * @param targetFloor - Floor to go to
   */
  public setTarget(targetFloor: number): void {
    this.targetFloor = targetFloor;

    if (targetFloor > this.currentFloor) {
      this.direction = "up";
    } else if (targetFloor < this.currentFloor) {
      this.direction = "down";
    } else {
      this.direction = "idle";
    }
  }

  /**
   * Check if elevator has reached its target floor
   * @returns true if at target floor
   */
  public hasReachedTarget(): boolean {
    return (
      this.targetFloor !== undefined && this.currentFloor === this.targetFloor
    );
  }

  /**
   * Open the elevator doors
   */
  public openDoors(): void {
    this.doorsOpen = true;
  }

  /**
   * Close the elevator doors
   */
  public closeDoors(): void {
    this.doorsOpen = false;
  }

  /**
   * Add passengers to the elevator
   * @param count - Number of passengers to add
   * @returns true if successful, false if over capacity
   */
  public addPassengers(count: number): boolean {
    if (this.passengerCount + count <= this.maxCapacity) {
      this.passengerCount += count;
      return true;
    }
    return false;
  }

  /**
   * Remove passengers from the elevator
   * @param count - Number of passengers to remove
   * @returns true if successful, false if not enough passengers
   */
  public removePassengers(count: number): boolean {
    if (this.passengerCount >= count) {
      this.passengerCount -= count;
      return true;
    }
    return false;
  }

  /**
   * Check if elevator has available capacity
   * @returns true if there's room for more passengers
   */
  public hasCapacity(): boolean {
    return this.passengerCount < this.maxCapacity;
  }

  /**
   * Get available capacity
   * @returns Number of available spots
   */
  public getAvailableCapacity(): number {
    return this.maxCapacity - this.passengerCount;
  }

  /**
   * Check if elevator is idle (not moving and no target)
   * @returns true if elevator is idle
   */
  public isIdle(): boolean {
    return (
      this.direction === "idle" &&
      !this.isMoving &&
      this.targetFloor === undefined
    );
  }

  /**
   * Calculate distance to a specific floor
   * @param floor - Target floor
   * @returns Distance in floors
   */
  public getDistanceToFloor(floor: number): number {
    return Math.abs(this.currentFloor - floor);
  }
}
