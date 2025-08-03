/**
 * Example showing how scheduler functions are called together
 * This demonstrates the complete flow from request to assignment
 */

import { RequestClass } from "../models/Request";
import { ElevatorClass } from "../models/Elevator";
import { Scheduler } from "./Scheduler";

/**
 * Example function showing the complete flow
 */
export function exampleSchedulerFlow(): void {
  // Step 1: Create elevators
  const elevator1 = new ElevatorClass(1, 8, 1); // ID 1, max 8 passengers, starts at floor 1
  const elevator2 = new ElevatorClass(2, 8, 5); // ID 2, max 8 passengers, starts at floor 5

  // Step 2: Create scheduler
  const scheduler = new Scheduler([elevator1, elevator2]);

  // Step 3: Create a request
  const request = new RequestClass(3, 8, Date.now()); // From floor 3 to floor 8

  // Step 4: Find the best elevator for this request
  const bestElevator = scheduler.findBestElevator(request);
  // findBestElevator() returns elevator1
  // So now: bestElevator = elevator1

  // Step 5: Check if we found a suitable elevator
  if (bestElevator !== null) {
    // Step 6: Assign the request to the best elevator
    scheduler.assignRequest(request, bestElevator);
    // This is the same as: scheduler.assignRequest(request, elevator1)

    console.log(`Request assigned to Elevator ${bestElevator.id}`);
    console.log(
      `Elevator ${bestElevator.id} is now going to floor ${bestElevator.targetFloor}`
    );
  } else {
    console.log("No suitable elevator found!");
  }
}

/**
 * Alternative way to write the same thing (more compact)
 */
export function compactSchedulerFlow(): void {
  const elevator1 = new ElevatorClass(1, 8, 1);
  const elevator2 = new ElevatorClass(2, 8, 5);
  const scheduler = new Scheduler([elevator1, elevator2]);

  const request = new RequestClass(3, 8, Date.now());

  // Find best elevator AND assign in one step
  const bestElevator = scheduler.findBestElevator(request);
  if (bestElevator) {
    scheduler.assignRequest(request, bestElevator);
  }
}
