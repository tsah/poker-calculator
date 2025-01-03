#!/bin/bash

# Build the new image
docker build -t poker-calculator .

# Stop and remove the old container if it exists
docker rm -f poker-calculator || true

# Start the new container
docker run -d \
  --name poker-calculator \
  --restart unless-stopped \
  -p 80:80 \
  -p 443:443 \
  -v caddy_data:/data \
  -v caddy_config:/config \
  poker-calculator

# Clean up unused images
docker image prune -f 