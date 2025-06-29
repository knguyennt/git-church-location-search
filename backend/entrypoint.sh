#!/bin/bash
set -e

echo "Starting backend service..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! pg_isready -h db -p 5432 -U postgres; do
    echo "Database is not ready yet. Waiting..."
    sleep 2
done

echo "Database is ready!"

# Check if data has already been imported
echo "Checking if data import is needed..."
CHURCH_COUNT=$(python -c "
from database import get_db, Church
db = next(get_db())
count = db.query(Church).count()
db.close()
print(count)
")

echo "Current church count: $CHURCH_COUNT"

if [ "$CHURCH_COUNT" -eq "0" ]; then
    echo "No churches found in database. Running data import..."
    python import_data.py
    echo "Data import completed!"
else
    echo "Churches already exist in database. Skipping import."
fi

# Start the FastAPI application
echo "Starting FastAPI application..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
