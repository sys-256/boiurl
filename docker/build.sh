#!/bin/sh

# Fix the sqlite3 database file location
sed -i "4s|[.]/|/data/|g" src/index.ts

# Build the app
npm i; npm run build

# Remove obsolete files
rm node_modules package-lock.json -rf

# Build the image
docker build -f ./docker/Dockerfile . -t boiurl --no-cache