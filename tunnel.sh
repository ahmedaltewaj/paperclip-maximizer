#!/bin/bash
while true; do
  timeout 300 ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=60 -R 80:localhost:8888 serveo.net 2>/dev/null
  sleep 5
done
