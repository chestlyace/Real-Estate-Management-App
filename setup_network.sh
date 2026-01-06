#!/bin/bash

# Real Estate App Network Setup Script
# Run this to fix network issues for physical devices!

echo "🔧 Setting up network for Real Estate App..."

# 1. Get Local IP
IP=$(hostname -I | awk '{print $1}')
echo "📍 Local IP found: $IP"

if [ -z "$IP" ]; then
    echo "❌ Could not detect local IP. Are you connected to a network?"
    exit 1
fi

# 2. Update Firewall (Fedora)
echo "🛡️  Configuring Firewall (requires sudo)..."
if sudo firewall-cmd --zone=FedoraWorkstation --add-port=3000/tcp --add-port=8081/tcp --permanent; then
    sudo firewall-cmd --reload
    echo "✅ Firewall ports 3000 and 8081 opened!"
else
    echo "⚠️  Firewall configuration failed. You might need to open ports 3000 and 8081 manually."
fi

# 3. Update api.config.js
CONFIG_FILE="my-app/src/config/api.config.js"
echo "📝 Updating $CONFIG_FILE..."

# Use sed to replace the IP address in the config file
# Matches http://...:3000 and replaces with http://$IP:3000
sed -i "s|http://[0-9.]*:3000|http://$IP:3000|g" $CONFIG_FILE

echo "✅ Configuration updated to use $IP"

echo "🎉 Setup Complete!"
echo "👉 Now run: npm start -- --reset-cache"
