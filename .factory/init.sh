#!/bin/bash
set -e

echo "Initializing SSC GD EdTech Platform environment..."

# Check and create .env if not exists
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "Created .env from .env.example"
    fi
fi

# Ensure Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Warning: Docker is not running. Start Docker to use docker compose services."
fi

# Create necessary directories
mkdir -p apps/api/internal
mkdir -p apps/web/src/app
mkdir -p apps/web/src/components
mkdir -p apps/web/src/lib

# Install frontend dependencies
if [ -f apps/web/package.json ]; then
    cd apps/web && npm install
    cd ../..
fi

# Install backend dependencies
if [ -f apps/api/requirements.txt ]; then
    cd apps/api && pip install -r requirements.txt
    cd ../..
fi

# Build Docker images if docker compose is configured
if [ -f docker-compose.yml ]; then
    echo "Docker Compose configuration found. Run 'docker compose up --build' to start all services."
fi

echo "Environment initialization complete!"
echo ""
echo "To start development:"
echo "  1. Start infrastructure: docker compose up -d postgres redis minio"
echo "  2. Start API: cd apps/api && uvicorn internal.main:app --reload --port 3100"
echo "  3. Start Web: cd apps/web && npm run dev"
echo ""
echo "Or start all at once: docker compose up --build"
