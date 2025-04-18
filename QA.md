# Guía de Análisis de Calidad con SonarQube

Este documento proporciona instrucciones detalladas para configurar y ejecutar análisis de calidad de código con SonarQube en el proyecto.

## Requisitos previos

- Docker y Docker Compose instalados
- Acceso a internet para descargar imágenes de Docker
- Permisos para ejecutar contenedores Docker

## Configuración de SonarQube

### 1. Iniciar el servidor SonarQube

```bash
# Iniciar SonarQube usando Docker Compose
docker compose -f docker-compose.sonarqube.yml up -d
```

### 2. Acceder a la interfaz web de SonarQube

1. Abrir un navegador y navegar a `http://localhost:9000`
2. Iniciar sesión con las credenciales por defecto:
   - Usuario: `admin`
   - Contraseña: `admin`
3. En el primer inicio de sesión, se te pedirá cambiar la contraseña por defecto

### 3. Generar un token de autenticación

1. Inicia sesión en SonarQube
2. Haz clic en tu avatar en la esquina superior derecha
3. Selecciona "Mi cuenta"
4. Ve a la pestaña "Tokens de seguridad"
5. Genera un nuevo token (por ejemplo, nombre "tech_debt_ai")
6. Copia el token generado para usarlo en el siguiente paso

## Ejecutar el análisis de código

### Opción 1: Usando SonarScanner local

Si tienes SonarScanner instalado localmente:

```bash
# En MacOS (con Homebrew)
# brew install sonar-scanner

# Ejecutar el análisis
cd /ruta/al/proyecto
sonar-scanner \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=TU_TOKEN
```

### Opción 2: Usando Docker para ejecutar SonarScanner

Si prefieres no instalar SonarScanner:

```bash
# Ejecutar SonarScanner mediante Docker
cd /ruta/al/proyecto
docker run \
  --network=tech_debt_ai_default \
  -e SONAR_HOST_URL=http://sonarqube:9000 \
  -e SONAR_LOGIN=TU_TOKEN \
  -v "$(pwd):/usr/src" \
  sonarsource/sonar-scanner-cli
```

### Opción 3: Script automatizado para análisis completo

Puedes crear un script llamado `run-sonar-analysis.sh` para automatizar todo el proceso:

```bash
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

# Ejecutar análisis mediante Docker
echo "Ejecutando análisis..."
docker run --rm \
  --network=tech_debt_ai_default \
  -e SONAR_HOST_URL=http://sonarqube:9000 \
  -e SONAR_LOGIN="$SONAR_TOKEN" \
  -v "$PROJECT_DIR:/usr/src" \
  sonarsource/sonar-scanner-cli

echo "=== Análisis completado ==="
echo "Puedes ver los resultados en http://localhost:9000"
```

Para usarlo:

1. Crea el archivo `run-sonar-analysis.sh` en la raíz del proyecto
2. Dale permisos de ejecución: `chmod +x run-sonar-analysis.sh`
3. Ejecuta: `./run-sonar-analysis.sh TU_TOKEN`

## Generar informes de cobertura para mejorar el análisis

Para obtener métricas de cobertura de código:

### Frontend

```bash
cd frontend
npm run test:coverage
```

### Backend

```bash
cd backend
npm run test:coverage
```

## Interpretar los resultados

Una vez completado el análisis, regresa a la interfaz web de SonarQube (`http://localhost:9000`) para ver los resultados:

1. **Vista general del proyecto**: Proporciona un resumen de la salud del código
2. **Issues**: Lista de problemas encontrados clasificados por tipo:
   - Bugs: Problemas que pueden causar comportamientos incorrectos
   - Vulnerabilidades: Problemas de seguridad
   - Code Smells: Problemas que afectan la mantenibilidad del código
3. **Medidas**: Métricas detalladas sobre:
   - Cobertura de código
   - Duplicación de código
   - Complejidad
   - Documentación
4. **Código**: Explorador de código fuente con problemas resaltados

## Integración continua

Para incluir el análisis de SonarQube en tu flujo de integración continua, puedes agregar los siguientes pasos a tu pipeline de CI:

```yaml
# Ejemplo para GitHub Actions
sonarqube-analysis:
  needs: [test-frontend, test-backend]
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v2
      with:
        fetch-depth: 0
    - name: SonarQube Scan
      uses: sonarsource/sonarqube-scan-action@master
      env:
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

## Problemas comunes

1. **Error de conexión**: Verifica que el contenedor de SonarQube esté en ejecución (`docker ps`)
2. **Error de autenticación**: Asegúrate de usar el token correcto
3. **Errores de memoria**: SonarQube requiere al menos 2GB de RAM para funcionar correctamente

## Detener SonarQube

Cuando ya no necesites el servidor SonarQube, puedes detenerlo con:

```bash
docker compose -f docker-compose.sonarqube.yml down
```

Para eliminar también los volúmenes (esto borrará todos los datos de análisis):

```bash
docker compose -f docker-compose.sonarqube.yml down -v
```

comando final
./run-sonar-analysis.sh sqa_5a025ca8538bad92f9c4cbacfa46e9817931b171

