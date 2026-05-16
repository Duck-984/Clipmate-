#!/bin/bash
# ClipMate — Production deploy script (Ubuntu 22.04+)
set -e

echo "🪒 ClipMate Deploy"
echo "=================="

# Variables
APP_DIR="/opt/clipmate"
DOMAIN="${DOMAIN:-clipmate.app}"

# Install Docker if needed
if ! command -v docker &> /dev/null; then
  echo "📦 Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
fi

# Clone / copy project
echo "📂 Setting up $APP_DIR..."
sudo mkdir -p $APP_DIR
sudo cp -r ./* $APP_DIR/
sudo chown -R $USER:$USER $APP_DIR
cd $APP_DIR

# Production env
cp .env.example .env
echo "⚠️  Edit .env with production keys:"
echo "   STRIPE_SECRET_KEY=sk_live_..."
echo "   OPENAI_API_KEY=sk-..."
echo "   JWT_SECRET=$(openssl rand -hex 32)"
echo "   NODE_ENV=production"
read -p "Press enter after editing .env..."

# Build and start
echo "🚀 Building containers..."
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
echo "📊 Running migrations..."
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Nginx
echo "🌐 Setting up Nginx..."
sudo apt-get install -y nginx certbot python3-certbot-nginx

sudo tee /etc/nginx/sites-available/clipmate << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /admin {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/clipmate /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "✅ Deploy complete!"
echo "🌍 https://$DOMAIN/graphql"
echo "📊 https://$DOMAIN/admin"
echo ""
