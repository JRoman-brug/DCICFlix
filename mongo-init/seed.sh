#!/bin/bash
sleep 2
echo "Starting 'seed' database..."

mongoimport --host localhost \
            --username admin \
            --password admin \
            --authenticationDatabase admin \
            --db moviesdb \
            --collection movies \
            --file /docker-entrypoint-initdb.d/movies.json \

echo "'Seed' complete."