/**
 * ElevatorDisplay Component - Visual representation of the building
 * Shows elevators, floors, and real-time movement
 */

import React, { useState } from "react";
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
  pendingRequests?: number;
  onGenerateRequest?: (fromFloor: number, toFloor: number) => void;
  onManualElevatorRequest?: (
    elevatorId: number,
    fromFloor: number,
    toFloor: number
  ) => void;
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
  pendingRequests = 0,
  onGenerateRequest,
  onManualElevatorRequest,
}) => {
  // State for manual floor selection
  const [selectedElevator, setSelectedElevator] = useState<number | null>(null);
  const [manualFromFloor, setManualFromFloor] = useState<number>(1);
  const [manualToFloor, setManualToFloor] = useState<number>(1);

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

  // Handle manual elevator request
  const handleManualRequest = () => {
    if (selectedElevator && onManualElevatorRequest) {
      onManualElevatorRequest(selectedElevator, manualFromFloor, manualToFloor);
      // Reset selection
      setSelectedElevator(null);
      setManualFromFloor(1);
      setManualToFloor(1);
    }
  };

  return (
    <div className="elevator-display">
      <h3>🏢 Building View</h3>

      {/* Manual Elevator Control Panel */}
      <div className="manual-control-panel">
        <h4>🎛️ Manual Elevator Control</h4>
        <div className="manual-controls">
          <div className="control-group">
            <label>Select Elevator:</label>
            <select
              value={selectedElevator || ""}
              onChange={(e) =>
                setSelectedElevator(
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              <option value="">Choose elevator...</option>
              {elevators.map((elevator) => (
                <option key={elevator.id} value={elevator.id}>
                  Elevator {elevator.id} (Floor {elevator.currentFloor})
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>From Floor:</label>
            <select
              value={manualFromFloor}
              onChange={(e) => setManualFromFloor(Number(e.target.value))}
            >
              {floors.map((floor) => (
                <option key={floor} value={floor}>
                  Floor {floor}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>To Floor:</label>
            <select
              value={manualToFloor}
              onChange={(e) => setManualToFloor(Number(e.target.value))}
            >
              {floors.map((floor) => (
                <option key={floor} value={floor}>
                  Floor {floor}
                </option>
              ))}
            </select>
          </div>

          <button
            className="manual-request-btn"
            onClick={handleManualRequest}
            disabled={!selectedElevator || manualFromFloor === manualToFloor}
          >
            🚀 Send Request
          </button>
        </div>
      </div>

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

                {/* Individual elevator buttons for this floor */}
                <div className="elevator-buttons">
                  {Array.from({ length: totalElevators }, (_, i) => {
                    const elevator = elevators.find((e) => e.id === i + 1);
                    return (
                      <div key={i} className="elevator-button-group">
                        <button
                          className="elevator-button up"
                          onClick={() => {
                            console.log(
                              `Clicked UP button for Elevator ${
                                i + 1
                              } on floor ${floor}`
                            );
                            onManualElevatorRequest?.(
                              i + 1,
                              floor,
                              Math.min(floor + 1, totalFloors)
                            );
                          }}
                          title={`Request Elevator ${
                            i + 1
                          } to go up from floor ${floor}`}
                        >
                          ⬆️
                        </button>
                        <button
                          className="elevator-button down"
                          onClick={() => {
                            console.log(
                              `Clicked DOWN button for Elevator ${
                                i + 1
                              } on floor ${floor}`
                            );
                            onManualElevatorRequest?.(
                              i + 1,
                              floor,
                              Math.max(floor - 1, 1)
                            );
                          }}
                          title={`Request Elevator ${
                            i + 1
                          } to go down from floor ${floor}`}
                        >
                          ⬇️
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Request indicator */}
                {pendingRequests > 0 && (
                  <div className="request-indicator">
                    📋 {pendingRequests} requests
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Simple Elevator Status */}
        <div className="ground-floor">
          <div className="ground-label">Elevator Status</div>
          <div className="ground-elevators">
            {Array.from({ length: totalElevators }, (_, i) => {
              const elevator = elevators.find((e) => e.id === i + 1);
              return (
                <div key={i} className="ground-elevator-shaft">
                  <div className="elevator-shaft-label">
                    🛗{i + 1}: Floor {elevator?.currentFloor || "?"}
                  </div>
                  {elevator && (
                    <div className="elevator-shaft-status">
                      {elevator.direction} | 👥{elevator.passengerCount}/
                      {elevator.maxCapacity}
                    </div>
                  )}
                </div>
              );
            })}
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
