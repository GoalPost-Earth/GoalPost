#!/bin/bash

# GoalPost Environment Setup Script
# Sets up the entire environment: database, vector indexes, initial user, and workers

set -e  # Exit on error

echo "🚀 GoalPost Environment Setup"
echo "================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local file not found"
  echo ""
  echo "Please create a .env.local file with the following variables:"
  echo "  NEO4J_URI=neo4j://localhost:7687"
  echo "  NEO4J_USER=neo4j"
  echo "  NEO4J_PASSWORD=your_password"
  echo "  OPENAI_API_KEY=your_openai_key"
  echo "  REDIS_HOST=localhost"
  echo "  REDIS_PORT=6379"
  echo "  SEED_USER_EMAIL=demo@goalpost.app (optional)"
  echo "  SEED_USER_NAME=Demo User (optional)"
  echo "  SEED_USER_PASSWORD=password123 (optional)"
  echo ""
  exit 1
fi

echo "✓ Found .env.local configuration"
echo ""

# Step 1: Initialize database and create vector indexes
echo "📊 Step 1: Initializing database and creating vector indexes..."
npm run init:db

if [ $? -eq 0 ]; then
  echo "✅ Database initialized successfully"
else
  echo "❌ Database initialization failed"
  exit 1
fi
echo ""

# Step 2: Seed initial user
echo "👤 Step 2: Creating initial user..."
node scripts/seed-initial-user.js

if [ $? -eq 0 ]; then
  echo "✅ Initial user created successfully"
else
  echo "❌ User seeding failed"
  exit 1
fi
echo ""

# Step 3: Install dependencies (if needed)
echo "📦 Step 3: Checking dependencies..."
if [ ! -d node_modules ] || [ ! -d node_modules/bullmq ]; then
  echo "Installing missing dependencies..."
  npm install
else
  echo "✓ Dependencies already installed"
fi
echo ""

# Step 4: Check Redis connection
echo "🔴 Step 4: Checking Redis connection..."
if command -v redis-cli &> /dev/null; then
  redis-cli ping &> /dev/null
  if [ $? -eq 0 ]; then
    echo "✅ Redis is running and accessible"
  else
    echo "⚠️  Redis is not responding. Please start Redis:"
    echo "    brew services start redis (macOS)"
    echo "    redis-server (manual)"
  fi
else
  echo "⚠️  redis-cli not found. Please ensure Redis is installed and running:"
  echo "    brew install redis (macOS)"
  echo "    apt-get install redis (Ubuntu)"
fi
echo ""

# Step 5: Setup information
echo "✅ Environment setup complete!"
echo ""
echo "────────────────────────────────────────"
echo "Next Steps:"
echo "────────────────────────────────────────"
echo ""
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Start the background workers (in a separate terminal):"
echo "   node src/lib/jobs/workers.ts"
echo ""
echo "3. (Optional) Manually trigger resonance discovery:"
echo "   curl -X POST http://localhost:3000/api/resonance/discover"
echo ""
echo "4. Access the application:"
echo "   http://localhost:3000"
echo ""
echo "────────────────────────────────────────"
echo "Scheduled Jobs:"
echo "────────────────────────────────────────"
echo ""
echo "• Resonance Discovery: Daily at 2 AM (configurable via RESONANCE_DISCOVERY_CRON)"
echo "• Pulse Processing: On every pulse creation"
echo "• Person Enrichment: On every pulse creation"
echo ""
echo "────────────────────────────────────────"
echo "API Endpoints:"
echo "────────────────────────────────────────"
echo ""
echo "• POST /api/pulse/create-from-conversation - Create pulse with conversation chunks"
echo "• POST /api/resonance/search - Semantic search for pulses/chunks/resonances"
echo "• GET  /api/resonance/review - Get pending resonances for review"
echo "• POST /api/resonance/review - Confirm/edit/reject resonance links"
echo ""
echo "🎉 Happy coding!"
