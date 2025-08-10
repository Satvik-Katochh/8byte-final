#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔍 Verifying build output...\n");

// Check if dist directory exists
const distPath = path.join(__dirname, "..", "dist");
if (fs.existsSync(distPath)) {
  console.log("✅ dist/ directory exists");

  // List contents of dist
  const distContents = fs.readdirSync(distPath, { recursive: true });
  console.log("📁 dist/ contents:", distContents);

  // Check for server files
  const serverPath = path.join(distPath, "server");
  if (fs.existsSync(serverPath)) {
    console.log("✅ dist/server/ directory exists");

    const serverContents = fs.readdirSync(serverPath, { recursive: true });
    console.log("📁 dist/server/ contents:", serverContents);

    // Check for main server file
    const mainServerFile = path.join(serverPath, "index.js");
    if (fs.existsSync(mainServerFile)) {
      console.log("✅ dist/server/index.js exists");
    } else {
      console.log("❌ dist/server/index.js missing!");
    }
  } else {
    console.log("❌ dist/server/ directory missing!");
  }

  // Check for client files
  const clientPath = path.join(distPath, "client");
  if (fs.existsSync(clientPath)) {
    console.log("✅ dist/client/ directory exists");

    const clientContents = fs.readdirSync(clientPath, { recursive: true });
    console.log("📁 dist/client/ contents:", clientContents);
  } else {
    console.log("❌ dist/client/ directory missing!");
  }
} else {
  console.log("❌ dist/ directory missing!");
}

console.log("\n🔍 Build verification complete!");
