#!/bin/bash

# Build the new image
sudo docker build -t poker-calculator .

# Stop and remove the old container if it exists
sudo docker rm -f poker-calculator || true

# Start the new container
sudo docker run -d \
  --name poker-calculator \
  --restart unless-stopped \
  --cap-add=NET_BIND_SERVICE \
  --cap-add=NET_ADMIN \
  -p 80:80 \
  -p 443:443 \
  -v caddy_data:/data \
  -v caddy_config:/config \
  poker-calculator

# Clean up unused images
sudo docker image prune -f 