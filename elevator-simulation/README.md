# 🏢 Elevator System Simulation & Optimization

A sophisticated web-based elevator simulation system featuring intelligent scheduling algorithms, real-time visualization, and comprehensive performance analytics.

## ✨ Features

- **Real-time Simulation**: Live elevator movement with smooth animations
- **Intelligent Scheduling**: Hybrid Aggressive Scheduler with multi-factor optimization
- **Interactive Controls**: Adjustable floors, elevators, speed, and request frequency
- **Peak Traffic Handling**: Optimized for morning rush hour scenarios
- **Performance Analytics**: Comprehensive metrics and stress testing
- **WebSocket Communication**: Real-time updates between frontend and backend

## 🚀 Live Demo

[Deploy to Railway](https://railway.app) - Full-stack deployment with real-time WebSocket support

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React + TypeScript + CSS3
- **Backend**: Node.js + Express + Socket.IO
- **Real-time**: WebSocket communication
- **Build**: TypeScript compilation + React build

### Project Structure
```
elevator-simulation/
├── src/
│   ├── server/          # Backend simulation engine
│   │   ├── models/      # Elevator, Request models
│   │   ├── services/    # Scheduler, SimulationEngine
│   │   └── index.ts     # Server entry point
│   └── client/          # React frontend
│       ├── components/  # UI components
│       ├── hooks/       # Custom React hooks
│       └── types/       # TypeScript interfaces
├── shared/              # Shared types and utilities
└── docs/               # Documentation and reports
```

## 🎯 Core Algorithm

### Hybrid Aggressive Scheduler
- **Multi-factor Scoring**: Distance, load, route efficiency, direction matching
- **Priority Escalation**: Long-waiting requests get higher priority
- **Morning Rush Optimization**: Prioritizes lobby-to-upper-floor requests
- **Predictive Positioning**: Keeps elevators near high-traffic floors

### Performance Metrics
- Average wait time
- Maximum wait time
- Average travel time
- Elevator utilization rate
- Request completion rate

## 🎮 Usage

### Basic Simulation
1. Set number of floors and elevators
2. Click Start to begin auto-generation
3. Use manual request buttons (⬆️/⬇️) for specific requests
4. Adjust simulation speed (1x to 10x)

### Peak Traffic Testing
- Click "Peak Traffic" for stress testing
- Simulates 30 floors, 6 elevators, 2 requests/second
- Tests algorithm performance under high load

### Real-time Monitoring
- Live elevator positions and directions
- Passenger counts and door states
- Request log with timestamps
- Performance statistics panel

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm install
cd src/client && npm install

# Start development servers
npm run dev          # Backend + Frontend
npm run dev:server   # Backend only
npm run dev:client   # Frontend only
```

### Production Build
```bash
npm run build        # Build both server and client
npm start           # Start production server
```

## 📊 Test Scenarios

### Scenario 1: Basic Operation
- 5 floors, 1 elevator
- Manual and auto requests
- Verify smooth movement and scheduling

### Scenario 2: Peak Traffic
- 30 floors, 6 elevators
- High-frequency requests (2/sec)
- Stress test algorithm performance

### Scenario 3: Speed Testing
- Various simulation speeds (1x to 10x)
- Performance under accelerated time

## 🔧 Configuration

### Environment Variables
```bash
NODE_ENV=development
PORT=8080
CLIENT_URL=http://localhost:3000
```

### Railway Deployment
- Automatic build and deployment
- WebSocket support enabled
- Environment variable configuration in dashboard

## 📈 Performance

- **Request Handling**: 100+ simultaneous requests
- **Real-time Updates**: 1-second refresh rate
- **Animation Smoothness**: 60fps elevator movement
- **Memory Usage**: Optimized for long-running simulations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the 8byte-final assignment.

## 🆘 Support

For deployment issues or questions, refer to the `DEPLOYMENT_GUIDE.md` file.
