#!/bin/bash

echo "🏗️  Setting up Church Locator Application..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available (try both old and new syntax)
COMPOSE_CMD=""
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "❌ Docker Compose is not available. Please install Docker Desktop or Docker Compose and try again."
    exit 1
fi

echo "✅ Docker is running and Docker Compose is available"

# Build and start services
echo "🐳 Building and starting Docker containers..."
$COMPOSE_CMD up --build -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if backend is running
echo "🔍 Checking backend health..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    
    echo "⏳ Waiting for backend... (attempt $attempt/$max_attempts)"
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ Backend failed to start. Please check the logs with: docker-compose logs backend"
    exit 1
fi

# Check if frontend is running
echo "🔍 Checking frontend..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Frontend is ready!"
        break
    fi
    
    echo "⏳ Waiting for frontend... (attempt $attempt/$max_attempts)"
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ Frontend failed to start. Please check the logs with: docker-compose logs frontend"
    exit 1
fi

# Import data if data.json exists
if [ -f "data.json" ]; then
    echo "📊 Found data.json file. Copying to backend and importing church data..."
    cp data.json backend/
    $COMPOSE_CMD exec -T backend python import_data.py
    if [ $? -eq 0 ]; then
        echo "✅ Data import completed successfully!"
    else
        echo "⚠️  Data import failed. You can try again later with:"
        echo "   cp data.json backend/ && $COMPOSE_CMD exec backend python import_data.py"
    fi
else
    echo "📝 No data.json file found. You can add churches manually through the web interface."
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo ""
echo "🔧 Useful commands:"
echo "   Stop services: $COMPOSE_CMD down"
echo "   View logs: $COMPOSE_CMD logs"
echo "   Import data: $COMPOSE_CMD exec backend python import_data.py"
echo ""
echo "📖 For more information, see README.md"
