/**
 * Simple TypeScript Interface for Elevator Request
 * This is what we'll use to define the shape of our request data
 */

// This interface defines what a request should look like
export interface Request {
  // Unique ID for each request
  id: string;

  // Which floor the person wants to go FROM
  fromFloor: number;

  // Which floor the person wants to go TO
  toFloor: number;

  // When the request was made (timestamp)
  timestamp: number;
}

/**
 * Simple TypeScript Interface for Elevator
 * This defines what an elevator should look like
 */

// This interface defines what an elevator should look like
export interface Elevator {
  // Unique ID for each elevator
  id: number;

  // Which floor the elevator is currently on
  currentFloor: number;

  // Which direction the elevator is moving (up, down, or idle)
  direction: "up" | "down" | "idle";

  // How many people are in the elevator
  passengerCount: number;

  // Maximum number of people the elevator can hold
  maxCapacity: number;

  // Whether the elevator doors are open or closed
  doorsOpen: boolean;
}
