#!/bin/bash
# ClipMate — One-command setup
set -e

echo "🪒 ClipMate Setup"
echo "=================="
echo ""

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js required. Install: https://nodejs.org"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "⚠️  Docker not found — DB/Redis won't start"; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm required."; exit 1; }

# Copy env
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env from .env.example"
  echo "⚠️  Edit .env with real STRIPE_SECRET_KEY and OPENAI_API_KEY"
fi

# Install backend
echo ""
echo "📦 Installing backend..."
cd backend
npm install --silent
echo "✅ Backend dependencies installed"

# Generate Prisma client
npx prisma generate
echo "✅ Prisma client generated"

cd ..

# Install mobile
echo ""
echo "📦 Installing mobile..."
cd mobile
npm install --silent 2>/dev/null || echo "⚠️  Mobile deps skipped (run: cd mobile && npm install)"
cd ..

# Install web admin
echo ""
echo "📦 Installing web admin..."
cd web
npm install --silent 2>/dev/null || echo "⚠️  Web deps skipped (run: cd web && npm install)"
cd ..

echo ""
echo "=================="
echo "✅ ClipMate setup complete!"
echo ""
echo "🚀 Start dev:"
echo "   docker-compose up -d postgres redis"
echo "   cd backend && npx prisma migrate dev && npm run dev"
echo "   cd mobile && npx expo start"
echo "   cd web && npm run dev"
echo ""
echo "📱 Admin: http://localhost:3001 (login: admin / admin)"
echo "📱 GraphQL: http://localhost:4000/graphql"
echo "📱 Health: http://localhost:4000/health"
echo ""
