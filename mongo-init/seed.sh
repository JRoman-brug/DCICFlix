#!/bin/bash
echo "Starting 'seed' database..."

# --- Espera robusta para MongoDB ---
# Intenta conectarse a 'localhost' en un bucle hasta que tenga éxito
until mongosh --host localhost --username admin --password admin --authenticationDatabase admin --eval "print('MongoDB is ready!')"
do
  echo "Waiting for MongoDB to start..."
  sleep 1
done

echo "MongoDB is up - proceeding with import."

mongoimport --host localhost \
            --username admin \
            --password admin \
            --authenticationDatabase admin \
            --db moviesdb \
            --collection movies \
            --type json \
            --file /docker-entrypoint-initdb.d/movies.json

echo "'Seed' complete."