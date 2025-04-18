.PHONY: up down restart build logs clean setup-dev help install-backend install-frontend start-backend start-frontend sonar-up sonar-down sonar-status sonar-analyze

# Variables
DC = docker compose

# Default target
.DEFAULT_GOAL := help

# Start all containers
up:
	$(DC) up -d

# Stop all containers
down:
	$(DC) down

# Restart all containers
restart: down up

# Build containers
build:
	$(DC) build

# Show logs of all containers
logs:
	$(DC) logs -f

# Show logs of a specific service
logs-%:
	$(DC) logs -f $*

# Clean Docker data
clean:
	$(DC) down -v
	docker system prune -f

# Local development setup (install all dependencies)
setup-dev: install-backend install-frontend

# Install backend dependencies
install-backend:
	cd backend && npm install

# Install frontend dependencies
install-frontend:
	cd frontend && npm install

# Start backend in development mode
start-backend:
	cd backend && npm run dev

# Start frontend in development mode
start-frontend:
	cd frontend && npm start

# Setup initial database with seed data
setup-db:
	$(DC) exec backend node src/scripts/seed.js

# Start SonarQube container
sonar-up:
	$(DC) -f docker-compose.sonarqube.yml up -d

# Stop SonarQube container
sonar-down:
	$(DC) -f docker-compose.sonarqube.yml down

# Check SonarQube status
sonar-status:
	$(DC) -f docker-compose.sonarqube.yml ps

# Run SonarQube analysis (requires sonar-scanner CLI installed)
sonar-analyze:
	@echo "Ejecutando análisis de SonarQube..."
	@echo "Asegúrate de tener sonar-scanner instalado y configurado"
	@echo "Para más información, consulta: https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/"
	@echo "El servidor SonarQube debe estar en ejecución (make sonar-up)"
	sonar-scanner -Dsonar.projectKey=edu-platform -Dsonar.sources=. -Dsonar.host.url=http://localhost:9000

# Display help information
help:
	@echo "Plataforma Educativa - Comandos de Gestión"
	@echo ""
	@echo "Uso: make [comando]"
	@echo ""
	@echo "Comandos:"
	@echo "  up               Iniciar todos los contenedores Docker"
	@echo "  down             Detener todos los contenedores Docker"
	@echo "  restart          Reiniciar todos los contenedores Docker"
	@echo "  build            Construir todos los contenedores Docker"
	@echo "  logs             Mostrar logs de todos los contenedores"
	@echo "  logs-backend     Mostrar logs del contenedor backend"
	@echo "  logs-frontend    Mostrar logs del contenedor frontend"
	@echo "  logs-db          Mostrar logs del contenedor de base de datos"
	@echo "  clean            Eliminar contenedores Docker, volúmenes y limpiar sistema"
	@echo "  setup-dev        Instalar dependencias para desarrollo local"
	@echo "  install-backend  Instalar dependencias del backend"
	@echo "  install-frontend Instalar dependencias del frontend"
	@echo "  start-backend    Iniciar backend en modo desarrollo"
	@echo "  start-frontend   Iniciar frontend en modo desarrollo"
	@echo "  setup-db         Configurar base de datos inicial con datos de ejemplo"
	@echo ""
	@echo "Comandos SonarQube (análisis estático):"
	@echo "  sonar-up         Iniciar el contenedor de SonarQube"
	@echo "  sonar-down       Detener el contenedor de SonarQube"
	@echo "  sonar-status     Verificar el estado del contenedor de SonarQube"
	@echo "  sonar-analyze    Ejecutar análisis de SonarQube (requiere sonar-scanner)"
	@echo ""
	@echo "Para documentación completa, ver README.md" 