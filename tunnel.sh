#!/bin/bash
# Paperclip Maximizer - Persistent Tunnel Script

PORT=8080
LOGFILE="/tmp/paperclip_tunnel.log"
PIDFILE="/tmp/paperclip_tunnel.pid"

# Kill existing tunnels
pkill -f "ssh.*serveo.*$PORT" 2>/dev/null
pkill -f "lt --port $PORT" 2>/dev/null
sleep 2

echo "Starting tunnel to port $PORT..."
echo "Logging to $LOGFILE"

# Start serveo tunnel
ssh -o StrictHostKeyChecking=no \
    -o ServerAliveInterval=60 \
    -o ServerAliveCountMax=3 \
    -o ExitOnForwardFailure=yes \
    -R 80:localhost:$PORT \
    serveo.net 2>&1 | tee "$LOGFILE" &

SSH_PID=$!
echo $SSH_PID > "$PIDFILE"

echo "Tunnel started with PID: $SSH_PID"
echo "Waiting for URL..."

# Wait for URL to appear in log
for i in {1..10}; do
    sleep 2
    URL=$(grep -o "https://[a-z0-9-]*-[0-9-]*\.serveousercontent\.com" "$LOGFILE" 2>/dev/null | head -1)
    if [ -n "$URL" ]; then
        echo ""
        echo "================================"
        echo "Tunnel URL: $URL"
        echo "================================"
        # Save URL to file for easy retrieval
        echo "$URL" > /tmp/paperclip_tunnel_url.txt
        break
    fi
    echo -n "."
done

if [ -z "$URL" ]; then
    echo ""
    echo "Warning: Could not extract URL. Check log: $LOGFILE"
fi

# Keep script running to maintain background process
wait $SSH_PID
