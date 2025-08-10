# Railway Deployment Guide

## Overview

This guide explains how to deploy the Elevator Simulation project to Railway.

## What Was Fixed

The original deployment was failing because:

1. **Missing Build Output**: Railway was ignoring the `dist/` folder due to `.railwayignore`
2. **Incorrect File Structure**: TypeScript was creating files in `dist/src/server/` instead of `dist/server/`
3. **Missing Client Build**: The client build wasn't being copied to the `dist/` directory
4. **Import Path Issues**: Server couldn't find the compiled files

## Configuration Files

### .railwayignore

- Removed `dist/` from ignore list so Railway can access compiled files
- Only ignores development files and node_modules

### .nixpacks

- Explicitly defines build phases for Railway
- Installs dependencies for both root and client
- Builds server and client separately
- Runs verification before starting

### railway.toml

- Configures Railway-specific settings
- Sets health check endpoint
- Configures restart policies

## Build Process

### 1. Server Build

```bash
npm run build:server
```

- Compiles TypeScript server code
- Reorganizes files from `dist/src/server/` to `dist/server/`
- Includes shared types

### 2. Client Build

```bash
npm run build:client
```

- Builds React client
- Copies build output to `dist/client/`

### 3. Verification

```bash
npm run verify-build
```

- Checks that all required files exist
- Ensures proper directory structure

## Deployment Steps

1. **Push Changes**: Commit and push all configuration changes
2. **Railway Build**: Railway will automatically detect and build using `.nixpacks`
3. **Health Check**: Server starts and responds to `/health` endpoint
4. **Static Files**: Client is served from `/` route

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Verify TypeScript configuration in `tsconfig.server.json`
- Ensure client build completes successfully

### Server Crashes

- Check Railway logs for missing modules
- Verify `dist/server/index.js` exists
- Ensure all import paths are correct

### Client Not Loading

- Check that `dist/client/` directory exists
- Verify static file serving in server code
- Check browser console for errors

## Environment Variables

Railway will automatically set:

- `PORT`: Server port
- `RAILWAY_ENVIRONMENT`: Set to "production"
- `RAILWAY_PUBLIC_DOMAIN`: Public URL for the app

## Monitoring

- Health endpoint: `https://your-app.railway.app/health`
- Railway dashboard shows build and runtime logs
- Automatic restarts on failure (configured in railway.toml)
