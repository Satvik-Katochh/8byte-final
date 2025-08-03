/**
 * Main App Component - Entry point for the elevator simulation
 * This component manages the overall application state and layout
 */

import React, { useState, useEffect } from 'react';
import './App.css';

// Import our components (we'll create these next)
import ElevatorDisplay from './components/ElevatorDisplay';
import ControlPanel from './components/ControlPanel';
import StatisticsPanel from './components/StatisticsPanel';

/**
 * App Component
 * Main application component that manages the simulation
 */
function App() {
  // Application state
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [totalFloors, setTotalFloors] = useState(20);
  const [totalElevators, setTotalElevators] = useState(4);
  const [requestFrequency, setRequestFrequency] = useState(1);

  // Simulation state (we'll connect this to the backend later)
  const [simulationState, setSimulationState] = useState({
    currentTime: 0,
    elevators: [],
    pendingRequests: 0,
    totalRequests: 0,
    completedRequests: 0,
    averageWaitTime: 0
  });

  /**
   * Start the simulation
   */
  const handleStart = () => {
    setIsRunning(true);
    console.log('Starting simulation...');
    // TODO: Connect to backend simulation engine
  };

  /**
   * Stop the simulation
   */
  const handleStop = () => {
    setIsRunning(false);
    console.log('Stopping simulation...');
    // TODO: Connect to backend simulation engine
  };

  /**
   * Reset the simulation
   */
  const handleReset = () => {
    setIsRunning(false);
    setSimulationState({
      currentTime: 0,
      elevators: [],
      pendingRequests: 0,
      totalRequests: 0,
      completedRequests: 0,
      averageWaitTime: 0
    });
    console.log('Resetting simulation...');
    // TODO: Connect to backend simulation engine
  };

  /**
   * Change simulation speed
   */
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    console.log(`Speed changed to ${newSpeed}x`);
    // TODO: Connect to backend simulation engine
  };

  /**
   * Change number of floors
   */
  const handleFloorsChange = (newFloors: number) => {
    setTotalFloors(newFloors);
    console.log(`Floors changed to ${newFloors}`);
    // TODO: Connect to backend simulation engine
  };

  /**
   * Change number of elevators
   */
  const handleElevatorsChange = (newElevators: number) => {
    setTotalElevators(newElevators);
    console.log(`Elevators changed to ${newElevators}`);
    // TODO: Connect to backend simulation engine
  };

  /**
   * Change request frequency
   */
  const handleFrequencyChange = (newFrequency: number) => {
    setRequestFrequency(newFrequency);
    console.log(`Request frequency changed to ${newFrequency}/sec`);
    // TODO: Connect to backend simulation engine
  };

  // Mock simulation update (we'll replace this with real backend connection)
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setSimulationState(prevState => ({
          ...prevState,
          currentTime: prevState.currentTime + speed
        }));
      }, 100); // Update every 100ms

      return () => clearInterval(interval);
    }
  }, [isRunning, speed]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏢 Elevator Simulation</h1>
        <p>Real-time elevator system with intelligent scheduling</p>
      </header>

      <main className="App-main">
        {/* Control Panel - Top of the page */}
        <ControlPanel
          isRunning={isRunning}
          speed={speed}
          totalFloors={totalFloors}
          totalElevators={totalElevators}
          requestFrequency={requestFrequency}
          onStart={handleStart}
          onStop={handleStop}
          onReset={handleReset}
          onSpeedChange={handleSpeedChange}
          onFloorsChange={handleFloorsChange}
          onElevatorsChange={handleElevatorsChange}
          onFrequencyChange={handleFrequencyChange}
        />

        {/* Main Simulation Display */}
        <div className="simulation-container">
          <ElevatorDisplay
            totalFloors={totalFloors}
            totalElevators={totalElevators}
            elevators={simulationState.elevators}
            isRunning={isRunning}
          />
        </div>

        {/* Statistics Panel - Bottom of the page */}
        <StatisticsPanel
          currentTime={simulationState.currentTime}
          pendingRequests={simulationState.pendingRequests}
          totalRequests={simulationState.totalRequests}
          completedRequests={simulationState.completedRequests}
          averageWaitTime={simulationState.averageWaitTime}
        />
      </main>
    </div>
  );
}

export default App; 