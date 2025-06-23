#!/bin/bash

# Function to kill processes on a specific port
kill_port() {
    local port=$1
    echo "Checking port $port..."

    # Try multiple methods to find and kill processes

    # Method 1: Using lsof with better error handling
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "Found processes on port $port: $pids"
        echo $pids | xargs kill -9 2>/dev/null
        sleep 1
    fi

    # Method 2: Using netstat as fallback
    local netstat_pids=$(netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1 | grep -v -)
    if [ ! -z "$netstat_pids" ]; then
        echo "Found additional processes via netstat on port $port: $netstat_pids"
        echo $netstat_pids | xargs kill -9 2>/dev/null
        sleep 1
    fi

    # Method 3: Using ss command as another fallback
    local ss_pids=$(ss -tlnp 2>/dev/null | grep ":$port " | sed 's/.*pid=\([0-9]*\).*/\1/' | grep -o '[0-9]*')
    if [ ! -z "$ss_pids" ]; then
        echo "Found processes via ss on port $port: $ss_pids"
        echo $ss_pids | xargs kill -9 2>/dev/null
        sleep 1
    fi

    # Verify the port is now free
    if lsof -i:$port >/dev/null 2>&1; then
        echo "Warning: Port $port may still be in use"
    else
        echo "Port $port is now free"
    fi
}

# Function to check if a port is available
check_port() {
    local port=$1
    if lsof -i:$port >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is free
    fi
}

echo "=== Port Cleanup and Server Startup Script ==="

# Kill processes on ports 3000 and 8082
kill_port 3001
kill_port 3000

# Additional cleanup for common Node.js processes
echo "Cleaning up any remaining Node.js processes..."
pkill -f "node.*index.js" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Wait for ports to be released
echo "Waiting for ports to be released..."
sleep 3

# Verify ports are free before starting
echo "Verifying ports are available..."
if ! check_port 3000; then
    echo "Error: Port 3000 is still in use. Please check manually."
    exit 1
fi

if ! check_port 8082; then
    echo "Error: Port 8082 is still in use. Please check manually."
    exit 1
fi

echo "Ports are available. Starting servers..."

# Start Node.js server
echo "Starting Node.js server..."
if [ -d "classroom" ]; then
    cd classroom
    if [ -f "package.json" ]; then
        echo "Installing server dependencies..."
        npm install
        echo "Starting Node.js server on port 8082..."
        nohup npm start > ../server.log 2>&1 &
        SERVER_PID=$!
        echo "Node.js server started with PID: $SERVER_PID"
        cd ..
    else
        echo "Error: No package.json found in server directory"
        exit 1
    fi
else
    echo "Error: Server directory not found"
    exit 1
fi

# Wait a moment for server to start
sleep 2

# Start React app
echo "Starting React app..."
if [ -d "Backend" ]; then
    cd Backend
    if [ -f "package.json" ]; then
        echo "Installing client dependencies..."
        npm install
        echo "Starting React development server on port 3000..."
        npm start
    else
        echo "Error: No package.json found in client directory"
        exit 1
    fi
else
    echo "Error: Client directory not found"
    exit 1
fi
