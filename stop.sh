#!/bin/bash
echo "Stopping the Scheduler application..."
docker compose -f docker-compose.prod.yml down
echo "Stopped"