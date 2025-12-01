#!/bin/bash

# Build the new image
sudo podman build -t poker-calculator .

# Stop and remove the old container if it exists
sudo podman rm -f poker-calculator || true

# Start the new container
sudo podman run -d \
  --name poker-calculator \
  --restart unless-stopped \
  --network host \
  -v caddy_data:/data \
  -v caddy_config:/config \
  poker-calculator

# Clean up unused images
sudo podman image prune -f 