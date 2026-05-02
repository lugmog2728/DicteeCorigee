#!/bin/bash

echo "Démarrage du backend..."
cd backend
source venv/bin/activate
uvicorn app.main:app --reload &
cd ..

echo "Démarrage du frontend..."
cd frontend
npm run dev &
cd ..

echo "Backend : http://localhost:8000"
echo "Frontend : http://localhost:5173"

wait
