/**
 * Simple TypeScript Interface for Elevator Request
 * This is what we'll use to define the shape of our request data
 */
export interface Request {
    id: string;
    fromFloor: number;
    toFloor: number;
    timestamp: number;
    assignedElevatorId?: number;
    pickupTime?: number;
    deliveryTime?: number;
}
/**
 * Simple TypeScript Interface for Elevator
 * This defines what an elevator should look like
 */
export interface Elevator {
    id: number;
    currentFloor: number;
    direction: "up" | "down" | "idle";
    passengerCount: number;
    maxCapacity: number;
    doorsOpen: boolean;
}
/**
 * Simple TypeScript Interface for Building
 * This defines what our building should look like
 */
export interface Building {
    totalFloors: number;
    totalElevators: number;
    elevators: Elevator[];
    pendingRequests: Request[];
    currentTime: number;
    isRunning: boolean;
}
//# sourceMappingURL=types.d.ts.map