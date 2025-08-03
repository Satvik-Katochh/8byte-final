/**
 * ElevatorDisplay Component - Visual representation of the building
 * Shows elevators, floors, and real-time movement
 */

import React from "react";
import "./ElevatorDisplay.css";

/**
 * Elevator data interface
 */
interface Elevator {
  id: number;
  currentFloor: number;
  direction: "up" | "down" | "idle";
  passengerCount: number;
  maxCapacity: number;
  doorsOpen: boolean;
  targetFloor?: number;
  isMoving: boolean;
}

/**
 * Props for ElevatorDisplay component
 */
interface ElevatorDisplayProps {
  totalFloors: number;
  totalElevators: number;
  elevators: Elevator[];
  isRunning: boolean;
}

/**
 * ElevatorDisplay Component
 * Visualizes the building with elevators and floors
 */
const ElevatorDisplay: React.FC<ElevatorDisplayProps> = ({
  totalFloors,
  totalElevators,
  elevators,
  isRunning,
}) => {
  // Create array of floors (from top to bottom)
  const floors = Array.from({ length: totalFloors }, (_, i) => totalFloors - i);

  // Get elevator at a specific floor
  const getElevatorsAtFloor = (floor: number): Elevator[] => {
    return elevators.filter((elevator) => elevator.currentFloor === floor);
  };

  // Get direction arrow
  const getDirectionArrow = (direction: string): string => {
    switch (direction) {
      case "up":
        return "⬆️";
      case "down":
        return "⬇️";
      default:
        return "⏸️";
    }
  };

  // Get door status
  const getDoorStatus = (doorsOpen: boolean): string => {
    return doorsOpen ? "🚪" : "🚪";
  };

  return (
    <div className="elevator-display">
      <h3>🏢 Building View</h3>

      <div className="building-container">
        {/* Floor numbers and elevators */}
        <div className="building">
          {floors.map((floor) => {
            const elevatorsAtFloor = getElevatorsAtFloor(floor);

            return (
              <div key={floor} className="floor-row">
                {/* Floor number */}
                <div className="floor-number">{floor}</div>

                {/* Elevator shafts */}
                <div className="elevator-shafts">
                  {Array.from({ length: totalElevators }, (_, i) => {
                    const elevator = elevators.find((e) => e.id === i + 1);
                    const isAtThisFloor = elevator?.currentFloor === floor;

                    return (
                      <div key={i} className="elevator-shaft">
                        {isAtThisFloor && elevator ? (
                          <div
                            className={`elevator ${
                              elevator.isMoving ? "moving" : ""
                            }`}
                          >
                            <div className="elevator-info">
                              <div className="elevator-id">🛗{elevator.id}</div>
                              <div className="elevator-direction">
                                {getDirectionArrow(elevator.direction)}
                              </div>
                              <div className="elevator-doors">
                                {getDoorStatus(elevator.doorsOpen)}
                              </div>
                              <div className="elevator-passengers">
                                👥{elevator.passengerCount}/
                                {elevator.maxCapacity}
                              </div>
                              {elevator.targetFloor && (
                                <div className="elevator-target">
                                  →{elevator.targetFloor}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="empty-shaft">│</div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Floor buttons */}
                <div className="floor-buttons">
                  <button className="floor-button up">⬆️</button>
                  <button className="floor-button down">⬇️</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ground floor indicator */}
        <div className="ground-floor">
          <div className="ground-label">Ground Floor</div>
          <div className="ground-elevators">
            {Array.from({ length: totalElevators }, (_, i) => (
              <div key={i} className="ground-elevator-shaft">
                <div className="elevator-shaft-label">🛗{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="legend">
        <div className="legend-item">
          <span>⬆️</span> Going Up
        </div>
        <div className="legend-item">
          <span>⬇️</span> Going Down
        </div>
        <div className="legend-item">
          <span>⏸️</span> Idle
        </div>
        <div className="legend-item">
          <span>🚪</span> Doors Open
        </div>
        <div className="legend-item">
          <span>👥</span> Passengers
        </div>
      </div>
    </div>
  );
};

export default ElevatorDisplay;
