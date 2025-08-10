/**
 * HYBRID AGGRESSIVE Elevator Scheduler - BREAK 60% BARRIER
 *
 * ULTIMATE GOAL: MAXIMIZE COMPLETED REQUESTS (TARGET: 60%+)
 * STRATEGY: Combine multiple approaches for maximum effectiveness
 * 1. Minimizes average wait time (time between floor request and pickup)
 * 2. Prevents request starvation (no request waits indefinitely)
 * 3. Balances elevator utilization (no overcrowding)
 * 4. Prioritizes user experience with explicit biases:
 *    - Escalate priority for requests waiting > 30 seconds
 *    - Prioritize lobby-to-upper-floor requests during morning rush hour
 *    - Keep elevators near high-traffic floors during predictable peaks
 * 5. NEW: HYBRID strategy - combine distance, load, and efficiency
 * 6. NEW: Ultra-aggressive load balancing that considers elevator direction and current path
 */

import { RequestClass } from "../models/Request";
import { ElevatorClass } from "../models/Elevator";

interface ElevatorScore {
  elevator: ElevatorClass;
  score: number;
  distance: number;
  load: number;
  priority: number;
  routeEfficiency: number;
  directionMatch: number;
}

export class Scheduler {
  private elevators: ElevatorClass[] = [];
  private totalFloors: number = 20;
  private pendingRequests: RequestClass[] = [];

  constructor(elevators: ElevatorClass[]) {
    this.elevators = elevators;
  }

  /**
   * Find the best elevator using HYBRID AGGRESSIVE algorithm
   * @param request - The request to assign
   * @param pendingRequests - All pending requests (for optimization)
   * @returns The best elevator or null if none available
   */
  public findBestElevator(
    request: RequestClass,
    pendingRequests: RequestClass[] = []
  ): ElevatorClass | null {
    if (this.elevators.length === 0) return null;

    // Filter available elevators (must have capacity)
    const availableElevators = this.elevators.filter((elevator) => {
      return elevator.hasCapacity();
    });

    if (availableElevators.length === 0) return null;

    // HYBRID AGGRESSIVE SCORING: Combine multiple strategies for maximum effectiveness
    const elevatorScores: ElevatorScore[] = availableElevators
      .map((elevator) =>
        this.calculateHybridAggressiveScore(elevator, request, pendingRequests)
      )
      .sort((a, b) => b.score - a.score);

    if (elevatorScores.length === 0) return null;

    // Return the best elevator
    return elevatorScores[0]?.elevator || null;
  }

  /**
   * Calculate HYBRID AGGRESSIVE score based on multiple strategies
   * @param elevator - The elevator to score
   * @param request - The request to consider
   * @param pendingRequests - All pending requests for context
   * @returns Score object with breakdown
   */
  private calculateHybridAggressiveScore(
    elevator: ElevatorClass,
    request: RequestClass,
    pendingRequests: RequestClass[]
  ): ElevatorScore {
    // REQUIREMENT 1: Minimize wait time - use distance as primary factor
    const distance = elevator.getDistanceToFloor(request.fromFloor);

    // REQUIREMENT 2: Smart load balancing - consider current load and capacity
    const currentLoad = elevator.assignedRequests.length;
    const passengerLoad = elevator.passengerCount / elevator.maxCapacity;
    const totalLoad = currentLoad + passengerLoad;

    // REQUIREMENT 3: Prevent starvation - consider request priority
    const requestPriority = request.getPriority(Date.now());

    // NEW REQUIREMENT 4: Route efficiency - how well does this request fit the elevator's current path?
    const routeEfficiency = this.calculateRouteEfficiency(
      elevator,
      request,
      pendingRequests
    );

    // NEW REQUIREMENT 5: Direction matching - prefer elevators going in the right direction
    const directionMatch = this.calculateDirectionMatch(elevator, request);

    // NEW REQUIREMENT 6: User experience bonuses
    const userExperienceBonus = this.calculateUserExperienceBonus(request);

    // HYBRID AGGRESSIVE SCORING FORMULA - MULTIPLE STRATEGIES:
    // 1. Distance (35%) - closer is better (PRIMARY)
    // 2. Load balancing (20%) - less loaded is better (BALANCED)
    // 3. Route efficiency (25%) - how well request fits current path
    // 4. Direction matching (15%) - prefer elevators going in right direction
    // 5. Priority (3%) - higher priority is better
    // 6. User experience (2%) - special cases

    // HYBRID DISTANCE SCORING - Multiple distance factors
    const directDistance = Math.max(0, 100 - distance * 0.6); // Reduced penalty
    const loadAdjustedDistance = directDistance * (1 - totalLoad * 0.1); // Adjust for load
    const distanceScore = Math.max(0, loadAdjustedDistance);

    // HYBRID LOAD SCORING - Consider both current and potential load
    const loadScore = Math.max(0, 100 - totalLoad * 25); // Reduced penalty

    // HYBRID ROUTE SCORING - Enhanced route efficiency
    const routeScore = routeEfficiency * 100;

    // HYBRID DIRECTION SCORING - Enhanced direction matching
    const directionScore = directionMatch * 100;

    // HYBRID PRIORITY SCORING - Enhanced priority handling
    const priorityScore = Math.min(100, requestPriority * 1.5);

    // HYBRID EXPERIENCE SCORING - Enhanced user experience
    const experienceScore = userExperienceBonus;

    // FINAL HYBRID SCORE - Weighted combination
    const totalScore =
      distanceScore * 0.35 +
      loadScore * 0.2 +
      routeScore * 0.25 +
      directionScore * 0.15 +
      priorityScore * 0.03 +
      experienceScore * 0.02;

    return {
      elevator,
      score: totalScore,
      distance,
      load: totalLoad,
      priority: requestPriority,
      routeEfficiency,
      directionMatch,
    };
  }

  /**
   * Calculate route efficiency - how well does this request fit the elevator's current path?
   */
  private calculateRouteEfficiency(
    elevator: ElevatorClass,
    request: RequestClass,
    pendingRequests: RequestClass[]
  ): number {
    const assignedRequests = this.getAssignedRequests(elevator);

    if (assignedRequests.length === 0) {
      // If no assigned requests, efficiency is based on distance
      return Math.max(
        0,
        1 - elevator.getDistanceToFloor(request.fromFloor) / this.totalFloors
      );
    }

    // Get all floors the elevator will visit (including current target)
    const floorsToVisit = new Set<number>();

    // Add current floor and target floor
    floorsToVisit.add(elevator.currentFloor);
    if (elevator.targetFloor !== undefined) {
      floorsToVisit.add(elevator.targetFloor);
    }

    // Add all assigned request floors
    for (const assignedRequest of assignedRequests) {
      if (!assignedRequest.isPickupComplete) {
        floorsToVisit.add(assignedRequest.fromFloor);
      }
      if (!assignedRequest.isDeliveryComplete) {
        floorsToVisit.add(assignedRequest.toFloor);
      }
    }

    // Check if request floors are already in the path
    const fromFloorInPath = floorsToVisit.has(request.fromFloor);
    const toFloorInPath = floorsToVisit.has(request.toFloor);

    if (fromFloorInPath && toFloorInPath) {
      return 1.0; // Perfect fit - both floors already in path
    } else if (fromFloorInPath || toFloorInPath) {
      return 0.95; // Excellent fit - one floor in path (INCREASED)
    } else {
      // Calculate how much the request would add to the route
      const currentFloors = Array.from(floorsToVisit);
      const newFloors = [...currentFloors, request.fromFloor, request.toFloor];
      const currentRouteLength = this.calculateRouteLength(currentFloors);
      const newRouteLength = this.calculateRouteLength(newFloors);
      const routeIncrease = newRouteLength - currentRouteLength;

      // Efficiency decreases as route increase gets larger (but less aggressively)
      return Math.max(0, 1 - routeIncrease / (this.totalFloors * 3.5)); // Reduced penalty
    }
  }

  /**
   * Calculate the length of a route (sum of distances between consecutive floors)
   */
  private calculateRouteLength(floors: number[]): number {
    if (floors.length <= 1) return 0;

    // Sort floors to get optimal route
    const sortedFloors = [...floors].sort((a, b) => a - b);
    let totalDistance = 0;

    for (let i = 1; i < sortedFloors.length; i++) {
      const currentFloor = sortedFloors[i];
      const previousFloor = sortedFloors[i - 1];
      if (currentFloor !== undefined && previousFloor !== undefined) {
        totalDistance += Math.abs(currentFloor - previousFloor);
      }
    }

    return totalDistance;
  }

  /**
   * Calculate direction matching - how well does the request direction match elevator direction?
   */
  private calculateDirectionMatch(
    elevator: ElevatorClass,
    request: RequestClass
  ): number {
    if (elevator.direction === "idle") {
      return 0.8; // Increased score for idle elevators (HYBRID)
    }

    const requestDirection =
      request.toFloor > request.fromFloor ? "up" : "down";

    if (elevator.direction === requestDirection) {
      return 1.0; // Perfect match
    } else {
      return 0.5; // Increased score for poor match (HYBRID)
    }
  }

  /**
   * Calculate user experience bonus based on requirements
   */
  private calculateUserExperienceBonus(request: RequestClass): number {
    let bonus = 0;

    // REQUIREMENT: Escalate priority for requests waiting > 30 seconds
    const waitTime = request.getWaitTime(Date.now());
    if (waitTime > 30) {
      bonus += 400; // Increased bonus for old requests (HYBRID)
    } else if (waitTime > 20) {
      bonus += 200; // Increased bonus for older requests
    } else if (waitTime > 10) {
      bonus += 100; // Increased bonus for older requests
    }

    // REQUIREMENT: Prioritize lobby-to-upper-floor requests during morning rush hour
    if (
      this.isMorningRushHour() &&
      request.fromFloor === 1 &&
      request.toFloor > 1
    ) {
      bonus += 150; // Increased bonus
    }

    // REQUIREMENT: Keep elevators near high-traffic floors during predictable peaks
    if (this.isHighTrafficFloor(request.fromFloor)) {
      bonus += 80; // Increased bonus
    }

    return bonus;
  }

  /**
   * Check if it's morning rush hour (9 AM)
   */
  private isMorningRushHour(): boolean {
    const hour = new Date().getHours();
    return hour >= 8 && hour <= 10;
  }

  /**
   * Check if floor is high-traffic
   */
  private isHighTrafficFloor(floor: number): boolean {
    // Lobby (floor 1) and middle floors (10-15) are typically high-traffic
    return floor === 1 || (floor >= 10 && floor <= 15);
  }

  /**
   * Assign a request to an elevator
   */
  public assignRequest(request: RequestClass, elevator: ElevatorClass): void {
    request.isAssigned = true;
    request.assignedElevatorId = elevator.id;
    elevator.assignedRequests.push(request.id);

    // Set target based on request state
    this.updateElevatorTarget(elevator);
  }

  /**
   * Update elevator target based on assigned requests with HYBRID AGGRESSIVE logic
   */
  private updateElevatorTarget(elevator: ElevatorClass): void {
    const assignedRequests = this.getAssignedRequests(elevator);

    if (assignedRequests.length === 0) return;

    // Sort by priority and route efficiency
    const sortedRequests = assignedRequests.sort((a, b) => {
      const priorityA = a.getPriority(Date.now());
      const priorityB = b.getPriority(Date.now());

      // If priorities are close, prefer requests that fit the current route better
      if (Math.abs(priorityA - priorityB) < 25) {
        // Increased threshold for HYBRID approach
        const routeEfficiencyA = this.calculateRouteEfficiency(
          elevator,
          a,
          this.pendingRequests
        );
        const routeEfficiencyB = this.calculateRouteEfficiency(
          elevator,
          b,
          this.pendingRequests
        );
        return routeEfficiencyB - routeEfficiencyA;
      }

      return priorityB - priorityA;
    });

    const nextRequest = sortedRequests[0];
    if (!nextRequest) return;

    // HYBRID AGGRESSIVE targeting logic:
    // 1. If pickup not complete, go to pickup floor
    // 2. If pickup complete, go to destination floor
    // 3. Consider route efficiency when choosing between multiple requests
    if (!nextRequest.isPickupComplete) {
      elevator.setTarget(nextRequest.fromFloor);
    } else {
      elevator.setTarget(nextRequest.toFloor);
    }
  }

  /**
   * Get all assigned requests for an elevator
   */
  private getAssignedRequests(elevator: ElevatorClass): RequestClass[] {
    return this.pendingRequests.filter(
      (request) =>
        request.isAssigned && request.assignedElevatorId === elevator.id
    );
  }

  /**
   * Set the pending requests list (called by SimulationEngine)
   */
  public setPendingRequests(requests: RequestClass[]): void {
    this.pendingRequests = requests;
  }

  /**
   * Update elevator targets based on current assignments
   */
  public updateElevatorTargets(): void {
    for (const elevator of this.elevators) {
      if (elevator.hasReachedTarget()) {
        this.updateElevatorTarget(elevator);
      }
    }
  }
}
