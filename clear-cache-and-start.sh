#!/bin/bash

echo "Clearing Vite cache..."
rm -rf node_modules/.vite

echo "Starting dev server..."
npm run dev