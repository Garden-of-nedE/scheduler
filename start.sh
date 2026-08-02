#!/bin/bash
set -e

echo "Starting the Scheduler application..."
docker compose -f docker-compose.prod.yml up -d --build --quiet-pull

echo "Waiting for database to be ready..."
sleep 5

echo "Ensuring database schema is up to date..."
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

echo ""
echo "Scheduler is running at http://localhost"
echo "(Run ./stop.sh to shut it down)"
