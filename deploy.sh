#!/bin/bash

# PassportPal Deployment Script
echo "🚀 Starting PassportPal Deployment..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set your PostgreSQL database URL:"
    echo "export DATABASE_URL='postgresql://username:password@host:port/database'"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🚀 Starting production server..."
    npm run start
else
    echo "❌ Build failed!"
    exit 1
fi 