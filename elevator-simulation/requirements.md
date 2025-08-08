# Elevator System Simulation & Optimization Assignment

## Objective
Design a web-based elevator simulation system with an intelligent scheduling algorithm that efficiently handles passenger requests while prioritizing user experience.

## Problem Statement
You must create:
1. A visual simulation of n elevators serving k floors.
2. An algorithm to optimize elevator scheduling for r passenger requests.

## Key Requirements

### 1. Simulation (Frontend)
- Display real-time elevator positions, directions (↑/↓/idle), door states, and passenger counts.
- Visualize floor requests (up/down buttons) and destination requests (inside elevators).
- Interactive controls:
  - Adjust number of elevators (n), floors (k), and request frequency.
  - Start/stop/reset simulation.
  - Speed controls (1x, 2x, 5x).

### 2. Request Handling
- Generate random requests with:
  - Timestamp
  - Origin floor (for external requests)
  - Destination floor (for internal requests)
- Simulate peak traffic scenarios (e.g., 70% requests from the lobby at 9 AM).

### 3. Algorithm Design (Backend)
Design a scheduler that:
- Minimizes average wait time (time between floor request and pickup) and travel time (pickup to destination).
- Prevents request starvation (no request waits indefinitely).
- Balances elevator utilization (no overcrowding).
- Prioritizes user experience with explicit biases:
  - Escalate priority for requests waiting > 30 seconds.
  - Prioritize lobby-to-upper-floor requests during morning rush hour.
  - Keep elevators near high-traffic floors during predictable peaks.

## Evaluation Criteria

### 1. Simulation Quality
- Smooth animations, intuitive UI, real-time parameter adjustments.

### 2. Algorithm Performance
- Metrics: Average/max wait time, average travel time, elevator utilization rate.
- Stress test: Handle 100+ simultaneous requests smoothly.

### 3. Code Quality
- Clean, modular, and well-documented code.

### 4. User-Centric Design
- Clear implementation of priority biases.

## Deliverables

### 1. Web Simulation
- Hosted locally or via a public demo link.

### 2. Source Code
- Include a README with setup instructions.

### 3. Report (1–2 pages max) explaining:
- Algorithm design and trade-offs.
- How user experience biases were implemented.
- Performance metrics for 3 test scenarios.

## Bonus Points (Optional)
- Compare two scheduling algorithms (e.g., SCAN vs. your custom approach).
- Add elevator capacity limits with visual warnings.
- Pre-position idle elevators based on predicted demand.

## Technical Guidelines
- Frontend: React/TypeScript recommended (or similar framework).
- Backend: Node.js/Python/Go for simulation logic.
- Timeframe: 5–7 days.
