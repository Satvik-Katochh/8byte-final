/**
 * Request Class - Handles elevator request logic
 * This class extends the Request interface with behavior and methods
 */

// Import the Request interface from shared types
import { Request } from "../../../shared/types";

/**
 * Request Class
 * This class represents an elevator request with additional behavior
 */
export class RequestClass implements Request {
  // Properties from the Request interface
  public id: string;
  public fromFloor: number;
  public toFloor: number;
  public timestamp: number;

  // Additional properties for the class
  public isAssigned: boolean = false; // Whether an elevator has been assigned
  public assignedElevatorId?: number; // Which elevator is handling this request
  public isManual: boolean = false; // Whether this request was manually generated

  /**
   * Constructor - Creates a new request
   * @param fromFloor - Floor where the request originated
   * @param toFloor - Floor where the person wants to go
   * @param timestamp - When the request was made
   */
  constructor(fromFloor: number, toFloor: number, timestamp: number) {
    // Generate a unique ID for this request
    this.id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Set the floor information
    this.fromFloor = fromFloor;
    this.toFloor = toFloor;

    // Set the timestamp
    this.timestamp = timestamp;
  }

  /**
   * Calculate how long this request has been waiting
   * @param currentTime - Current simulation time
   * @returns Wait time in seconds
   */
  public getWaitTime(currentTime: number): number {
    return currentTime - this.timestamp;
  }

  /**
   * Calculate the priority of this request based on wait time
   * @param currentTime - Current simulation time
   * @returns Priority score (higher = more urgent)
   */
  public getPriority(currentTime: number): number {
    const waitTime = this.getWaitTime(currentTime);

    // Base priority is 1
    let priority = 1;

    // If waiting more than 30 seconds, increase priority
    if (waitTime > 30) {
      // Priority increases exponentially after 30 seconds
      priority += Math.pow(waitTime - 30, 1.5);
    }

    return priority;
  }

  /**
   * Check if this request is for going up
   * @returns true if going up, false if going down
   */
  public isGoingUp(): boolean {
    return this.toFloor > this.fromFloor;
  }

  /**
   * Check if this request is for going down
   * @returns true if going down, false if going up
   */
  public isGoingDown(): boolean {
    return this.toFloor < this.fromFloor;
  }
}
