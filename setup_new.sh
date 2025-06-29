#!/bin/bash

echo "🚀 Starting GIS Church Location Search Application..."

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

# Stop any running containers first
echo "📦 Stopping existing containers..."
$COMPOSE_CMD down

# Build and start services
echo "🔨 Building and starting services..."
$COMPOSE_CMD up -d --build

echo "⏳ Waiting for services to be ready..."

# Wait for database to be healthy
echo "🔍 Checking database..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if $COMPOSE_CMD ps db | grep -q "healthy"; then
        echo "✅ Database is ready!"
        break
    fi
    
    echo "⏳ Waiting for database... (attempt $attempt/$max_attempts)"
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ Database failed to start. Please check the logs with: $COMPOSE_CMD logs db"
    exit 1
fi

# Wait for backend to be ready (automatic import will happen here)
echo "🔍 Checking backend (data import happens automatically)..."
max_attempts=60  # Give more time for potential data import
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    
    echo "⏳ Waiting for backend and data import... (attempt $attempt/$max_attempts)"
    sleep 3
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ Backend failed to start. Please check the logs with: $COMPOSE_CMD logs backend"
    exit 1
fi

# Wait for frontend to be ready
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
    echo "❌ Frontend failed to start. Please check the logs with: $COMPOSE_CMD logs frontend"
    exit 1
fi

# Wait for Metabase to be healthy
echo "🔍 Checking Metabase..."
max_attempts=60  # Metabase takes longer to start
attempt=1

while [ $attempt -le $max_attempts ]; do
    if $COMPOSE_CMD ps metabase | grep -q "healthy"; then
        echo "✅ Metabase is ready!"
        break
    fi
    
    echo "⏳ Waiting for Metabase... (attempt $attempt/$max_attempts)"
    sleep 3
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "⚠️ Metabase may still be starting up. Check status with: $COMPOSE_CMD logs metabase"
fi

# Check church data
echo "📊 Checking imported data..."
CHURCH_COUNT=$($COMPOSE_CMD exec -T db psql -U postgres -d church_locator -t -c "SELECT COUNT(*) FROM churches;" 2>/dev/null | tr -d ' \n\r')

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📊 Services Status:"
echo "   • Database: ✅ Running with $CHURCH_COUNT churches"
echo "   • Backend API: ✅ Running on http://localhost:8000"
echo "   • Frontend: ✅ Running on http://localhost:3000"
echo "   • Metabase: ✅ Running on http://localhost:3001"
echo ""
echo "🔗 Access your application:"
echo "   • Web App: http://localhost:3000"
echo "   • API Docs: http://localhost:8000/docs"
echo "   • Metabase: http://localhost:3001"
echo ""
echo "📈 Analytics Views Available in Metabase:"
echo "   • churches_analytics - Church data with coordinates"
echo "   • denomination_stats - Denomination statistics"
echo "   • churches_by_region - Regional analysis"
echo "   • church_density_analysis - Distance analysis"
echo "   • church_additions_by_month - Growth tracking"
echo ""
echo "🎯 Data Import: ✅ Automatic (completed)"
echo "💡 Note: Data import happens automatically when starting with empty database"
echo ""
echo "🔧 Useful commands:"
echo "   Stop services: $COMPOSE_CMD down"
echo "   View logs: $COMPOSE_CMD logs [service]"
echo "   Restart with fresh data: $COMPOSE_CMD down -v && ./setup.sh"
