#!/bin/bash

EXPOSE=false
for arg in "$@"; do
  [[ "$arg" == "--expose" ]] && EXPOSE=true
done

echo "Démarrage du backend..."
cd backend
source venv/bin/activate
if $EXPOSE; then
  uvicorn app.main:app --reload --host 0.0.0.0 &
else
  uvicorn app.main:app --reload &
fi
cd ..

echo "Démarrage du frontend..."
cd frontend
if $EXPOSE; then
  npm run dev -- --host &
else
  npm run dev &
fi
cd ..

if $EXPOSE; then
  echo "Backend  : http://0.0.0.0:8000 (réseau exposé)"
  echo "Frontend : http://0.0.0.0:5173 (réseau exposé)"
else
  echo "Backend  : http://localhost:8000"
  echo "Frontend : http://localhost:5173"
fi

wait
