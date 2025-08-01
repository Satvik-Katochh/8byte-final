# Elevator System Simulation & Optimization Assignment

## 🎯 **PROJECT OVERVIEW**

A web-based elevator simulation system with intelligent scheduling algorithm that efficiently handles passenger requests while prioritizing user experience.

## 📚 **LEARNING APPROACH - CRITICAL**

### **Step-by-Step Methodology:**

- **ONE file at a time** - Never generate multiple files simultaneously
- **ONE concept at a time** - Explain each TypeScript concept thoroughly before moving on
- **LINE-BY-LINE explanation** - Explain what each line of code does
- **SLOW pace** - User is learning TypeScript, so take it very slow
- **ASK for understanding** - Check if user understands before proceeding
- **NO overwhelming code** - Keep files small and simple

### **Code Generation Rules:**

- **Maximum 20-30 lines per file** initially
- **Explain every TypeScript concept** as it's introduced
- **Break complex concepts** into simple parts
- **Use comments extensively** to explain what each part does
- **Let user type the code** or ask for changes if needed

### **Teaching Style:**

- **Beginner-friendly explanations** - Assume no prior TypeScript knowledge
- **Real-world analogies** - Explain concepts using everyday examples
- **Visual explanations** - Use diagrams or examples when helpful
- **Repetition** - Reinforce concepts multiple times
- **Questions encouraged** - Always ask if user has questions

## 📋 **ASSIGNMENT REQUIREMENTS**

### **Core Requirements:**

1. **Visual Simulation:** Display real-time elevator positions, directions (↑/↓/idle), door states, and passenger counts
2. **Interactive Controls:** Adjust number of elevators (n), floors (k), request frequency, start/stop/reset, speed controls (1x, 2x, 5x)
3. **Request Handling:** Generate random requests with timestamp, origin floor, destination floor
4. **Peak Traffic Scenarios:** Simulate 70% requests from lobby at 9 AM morning rush hour
5. **Algorithm Design:** Minimize average wait time, prevent request starvation, balance elevator utilization

### **User Experience Biases (MUST IMPLEMENT):**

- **Priority Escalation:** Requests waiting > 30 seconds get higher priority
- **Morning Rush Optimization:** Prioritize lobby-to-upper-floor requests during 8-10 AM
- **Predictive Positioning:** Keep elevators near high-traffic floors during predictable peaks

### **Evaluation Criteria:**

1. **Simulation Quality:** Smooth animations, intuitive UI, real-time parameter adjustments
2. **Algorithm Performance:** Average/max wait time, average travel time, elevator utilization rate
3. **Stress Testing:** Handle 100+ simultaneous requests smoothly
4. **Code Quality:** Clean, modular, well-documented code

### **Deliverables:**

1. **Web Simulation:** Hosted locally or public demo link
2. **Source Code:** Include README with setup instructions
3. **Report (1-2 pages):** Algorithm design, user experience biases, performance metrics for 3 test scenarios

### **Bonus Points:**

- Compare two scheduling algorithms (SCAN vs custom approach)
- Add elevator capacity limits with visual warnings
- Pre-position idle elevators based on predicted demand

## 🏗️ **TECHNICAL ARCHITECTURE**

### **Tech Stack:**

- **Frontend:** React + TypeScript (recommended)
- **Backend:** Node.js for simulation logic
- **Real-time:** WebSocket for live updates
- **Styling:** CSS3 with responsive design

### **Project Structure:**

```
elevator-simulation/
├── src/
│   ├── server/          # Backend simulation engine
│   │   ├── models/      # Data models (Request, Elevator, Building)
│   │   ├── services/    # Core services (Scheduler, RequestGenerator, MetricsCollector)
│   │   └── utils/       # Helper functions and constants
│   └── client/          # React frontend
│       ├── components/  # UI components
│       ├── hooks/       # Custom React hooks
│       └── types/       # Frontend TypeScript types
├── shared/              # Shared TypeScript interfaces
└── docs/               # Documentation and reports
```

## 📅 **DEVELOPMENT TIMELINE**

### **Day 1 (Aug 1): TypeScript Basics & Core Interfaces**

**Time:** 5-6 hours

- ✅ Project setup and configuration
- ✅ Simple Request interface
- ✅ Simple Elevator interface
- **Next:** Building interface, basic Request class
- **Learning:** TypeScript interfaces, types, basic concepts

### **Day 2 (Aug 2): Core Logic & Scheduling**

**Time:** 5-6 hours

- Basic Elevator class with movement logic
- Simple SCAN scheduling algorithm
- Request assignment logic
- **Learning:** Classes, methods, basic algorithms

### **Day 3 (Aug 3): Simulation Engine**

**Time:** 5-6 hours

- Main simulation loop with real-time updates
- Random request generation
- WebSocket communication setup
- **Learning:** Loops, timers, state management

### **Day 4 (Aug 4): Frontend Foundation**

**Time:** 5-6 hours

- React application setup
- Basic elevator visualization
- Real-time display of elevator states
- **Learning:** React basics, components, props

### **Day 5 (Aug 5): Interactive Features**

**Time:** 5-6 hours

- Start/stop/reset simulation controls
- Speed controls (1x, 2x, 5x, 10x)
- Parameter adjustment (elevators, floors, request frequency)
- **Learning:** React state, event handling

### **Day 6 (Aug 6): Advanced Algorithm Features**

**Time:** 5-6 hours

- Priority escalation system (30-second rule)
- Rush hour detection and optimization
- Morning rush hour bias implementation
- **Learning:** Advanced algorithms, time-based logic

### **Day 7 (Aug 7): Performance & Testing**

**Time:** 5-6 hours

- Performance metrics calculation
- Stress testing with 100+ simultaneous requests
- Statistics dashboard and real-time metrics
- **Learning:** Performance optimization, testing strategies

### **Day 8 (Aug 8): Polish & Documentation**

**Time:** 5-6 hours

- Algorithm report writing (1-2 pages)
- Code documentation and comments
- Final testing and bug fixes
- **Learning:** Documentation, deployment preparation

### **Day 9 (Aug 9): Submission Day**

**Time:** 2-3 hours

- Final review and testing
- Submission preparation
- Demo verification

## 🧠 **ALGORITHM DESIGN STRATEGY**

### **Base Algorithm: Enhanced SCAN**

- **SCAN (Elevator):** Elevators move in one direction until no more requests, then reverse
- **Priority Enhancement:** Requests get higher priority after 30 seconds
- **Traffic Pattern Recognition:** Detects morning rush (9 AM) and prioritizes lobby→upper floor requests
- **Load Balancing:** Distributes requests across elevators to prevent overcrowding
- **Predictive Positioning:** Keeps elevators near high-traffic floors during predictable peaks

### **Key Features to Implement:**

1. **Priority Escalation:** `priority = baseScore + (waitTime > 30 ? (waitTime - 30) ^ 1.5 : 0)`
2. **Morning Rush Detection:** `isMorningRush = (hour >= 8 && hour <= 10)`
3. **Lobby Priority:** `if (isMorningRush && request.originFloor === 1) priority += 3`
4. **Anti-Starvation:** Maximum wait time cap of 120 seconds
5. **Load Balancing:** Dynamic elevator utilization monitoring

## 📊 **PERFORMANCE TARGETS**

### **Key Performance Indicators:**

- **Average Wait Time:** Target < 15 seconds
- **Maximum Wait Time:** Target < 60 seconds
- **Average Travel Time:** Target < 30 seconds
- **Elevator Utilization:** Target 60-80%
- **Request Throughput:** Target 2.0 requests/minute per elevator

### **Test Scenarios:**

1. **Normal Traffic:** 4 elevators, 20 floors, 1 request/3 seconds, 10 minutes
2. **Morning Rush Hour:** 6 elevators, 30 floors, 70% lobby-to-upper, 1 request/second, 30 minutes
3. **Stress Test:** 3 elevators, 50 floors, 100+ simultaneous requests, 5 minutes

## 🎮 **USER INTERFACE REQUIREMENTS**

### **Real-time Visualization:**

- Elevator shafts with smooth animations
- Floor indicators with up/down request buttons
- Passenger count display inside each elevator
- Direction arrows (↑/↓/idle)
- Door state indicators (open/closed)

### **Interactive Controls:**

- **Simulation Parameters:** Number of elevators (1-10), floors (5-100), request frequency (0.1-10 req/sec)
- **Simulation Controls:** Start/Stop/Reset buttons
- **Speed Control:** 1x, 2x, 5x, 10x speed multipliers
- **Manual Requests:** Click floors to generate custom requests
- **Peak Traffic Toggle:** Enable/disable rush hour simulation

### **Metrics Dashboard:**

- Live performance charts
- Request queue visualization
- Elevator status panel
- System alerts and warnings

## 🔧 **CURRENT PROGRESS**

### **Completed (Day 1):**

```typescript
// shared/types.ts
export interface Request {
  id: string;
  fromFloor: number;
  toFloor: number;
  timestamp: number;
}

export interface Elevator {
  id: number;
  currentFloor: number;
  direction: "up" | "down" | "idle";
  passengerCount: number;
  maxCapacity: number;
  doorsOpen: boolean;
}
```

### **Next Steps:**

1. Create Building interface
2. Create basic Request class
3. Start Day 2: Core logic & scheduling

## 🚀 **QUICK START**

### **Prerequisites:**

- Node.js 18+
- npm or yarn
- Modern web browser

### **Installation:**

```bash
git clone <repository-url>
cd elevator-simulation
npm install
```

### **Development:**

```bash
# Start backend server
npm run dev:server

# Start frontend (in new terminal)
npm run dev:client

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
```

## 📚 **LEARNING OBJECTIVES**

### **TypeScript Concepts:**

- Interfaces and type definitions
- Classes and object-oriented programming
- Union types and type safety
- Generics and advanced types

### **React Concepts:**

- Components and props
- State management
- Hooks (useState, useEffect, custom hooks)
- Real-time updates with WebSocket

### **Algorithm Concepts:**

- SCAN elevator algorithm
- Priority queues and scheduling
- Performance optimization
- Load balancing strategies

## 🎯 **SUCCESS CRITERIA**

### **Functional Requirements:**

- ✅ Real-time elevator simulation
- ✅ Interactive controls working
- ✅ Intelligent scheduling algorithm
- ✅ Performance metrics tracking
- ✅ Rush hour scenario simulation
- ✅ Stress testing capability

### **Technical Requirements:**

- ✅ Clean, modular TypeScript code
- ✅ Responsive React UI
- ✅ Real-time WebSocket communication
- ✅ Comprehensive documentation
- ✅ Performance optimization

### **Assignment Deliverables:**

- ✅ Working web simulation
- ✅ Complete source code
- ✅ Algorithm report (1-2 pages)
- ✅ Performance analysis
- ✅ Stress test results

---

**Note:** This project is designed for learning TypeScript and React while building a complex real-world simulation. Each day builds upon the previous, ensuring steady progress toward the final goal.

**IMPORTANT:** The user is learning TypeScript step by step. Take it slow, explain everything clearly, and never overwhelm with too much code at once.
