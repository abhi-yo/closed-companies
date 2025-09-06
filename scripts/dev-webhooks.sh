#!/bin/bash

# Development Webhook Setup Script
echo "🚀 Setting up development webhooks..."

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "📦 Installing ngrok..."
    npm install -g ngrok
fi

# Start ngrok tunnel
echo "🌐 Starting ngrok tunnel..."
ngrok http 3000 --log=stdout > ngrok.log &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get the public URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*ngrok[^"]*')

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL"
    exit 1
fi

echo "✅ Ngrok tunnel created: $NGROK_URL"
echo ""
echo "🔗 Use these webhook URLs in your services:"
echo "📍 Polar webhook: $NGROK_URL/api/polar/webhook"
echo "📍 Resend webhook: $NGROK_URL/api/resend/webhook"
echo ""
echo "💡 Keep this terminal open to maintain the tunnel"
echo "💡 Press Ctrl+C to stop ngrok"

# Keep the script running
trap "kill $NGROK_PID" EXIT
wait $NGROK_PID
