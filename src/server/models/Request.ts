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
  public isPickupComplete: boolean = false; // Whether passengers have been picked up
  public isDeliveryComplete: boolean = false; // Whether passengers have been delivered
  public pickupTime?: number; // When the pickup was completed (for travel time calculation)
  public deliveryTime?: number; // When the delivery was completed (for travel time calculation)

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

    // HYBRID AGGRESSIVE escalation for better completion rates
    if (waitTime > 3) {
      // Start escalating after 3 seconds (reduced for faster completion)
      priority += Math.pow(waitTime - 3, 1.5); // Increased exponent for faster escalation
    }

    // Emergency boost for very old requests
    if (waitTime > 10) {
      // Reduced threshold for faster completion
      priority += 400; // Increased boost
    }

    // Super emergency for extremely old requests
    if (waitTime > 20) {
      // Reduced threshold for faster completion
      priority += 1000; // Increased boost
    }

    // HYBRID BONUS: Additional boost for requests that are going in the same direction as most pending requests
    if (this.isGoingUp()) {
      priority += 50; // Bonus for upward requests
    } else {
      priority += 30; // Bonus for downward requests
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
