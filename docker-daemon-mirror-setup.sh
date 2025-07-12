#!/bin/bash

# Docker Registry Mirror Setup Script
# Run this on your Linux server to fix image pull issues

echo "🌐 Configuring Docker Registry Mirrors..."

# Backup existing daemon.json if it exists
if [ -f /etc/docker/daemon.json ]; then
    echo "📋 Backing up existing daemon.json..."
    sudo cp /etc/docker/daemon.json /etc/docker/daemon.json.backup
fi

# Create or update daemon.json with registry mirrors
echo "📝 Creating Docker daemon configuration..."
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "registry-mirrors": [
    "https://mirror.gcr.io",
    "https://registry.docker-cn.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ],
  "insecure-registries": [],
  "dns": ["8.8.8.8", "8.8.4.4"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

echo "🔄 Restarting Docker daemon..."
sudo systemctl daemon-reload
sudo systemctl restart docker

echo "✅ Docker daemon configured with registry mirrors!"
echo "🧪 Testing Docker connectivity..."

# Test image pull
if docker pull hello-world:latest; then
    echo "✅ Docker registry mirrors working correctly!"
else
    echo "❌ Docker registry mirrors may need additional configuration"
fi

echo "🎯 Now you can run: docker compose build" 
