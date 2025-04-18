#!/bin/bash

# Script para ejecutar análisis SonarQube completo
# Uso: ./run-sonar-analysis.sh [token]

# Verificar si se proporcionó un token
if [ -z "$1" ]; then
  echo "Error: Se requiere un token de SonarQube"
  echo "Uso: ./run-sonar-analysis.sh [token]"
  exit 1
fi

SONAR_TOKEN=$1
PROJECT_DIR=$(pwd)

echo "=== Ejecutando pruebas con cobertura ==="
echo "Frontend..."
cd "$PROJECT_DIR/frontend" || exit 1
npm run test:coverage

echo "Backend..."
cd "$PROJECT_DIR/backend" || exit 1
npm run test:coverage

echo "=== Ejecutando análisis SonarQube ==="
cd "$PROJECT_DIR" || exit 1

# Verificar si SonarQube está en ejecución
if ! docker ps | grep -q sonarqube; then
  echo "Iniciando SonarQube..."
  docker compose -f docker-compose.sonarqube.yml up -d
  echo "Esperando 60 segundos para que SonarQube se inicie completamente..."
  sleep 60
fi

# Ejecutar análisis mediante Docker con token explícito
echo "Ejecutando análisis..."
docker run --rm \
  --network=tech_debt_ai_default \
  -e SONAR_HOST_URL="http://sonarqube:9000" \
  -e SONAR_LOGIN="$SONAR_TOKEN" \
  -v "$PROJECT_DIR:/usr/src" \
  -v "$PROJECT_DIR/sonar-project.properties:/usr/src/sonar-project.properties" \
  sonarsource/sonar-scanner-cli \
  -Dsonar.projectBaseDir=/usr/src \
  -Dsonar.login="$SONAR_TOKEN"

echo "=== Análisis completado ==="
echo "Puedes ver los resultados en http://localhost:9000" 