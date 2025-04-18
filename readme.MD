# Educational Platform

Una plataforma educativa moderna y completa diseñada para reemplazar Moodle, con control de acceso basado en roles, gestión de cursos y capacidades de inscripción para estudiantes.

## Características

- **Autenticación de Usuarios**: Sistema seguro de registro e inicio de sesión
- **Control de Acceso Basado en Roles**: Roles de Administrador, Profesor y Estudiante con permisos específicos
- **Gestión de Cursos**: Crear, actualizar y administrar cursos
- **Inscripción de Estudiantes**: Los estudiantes pueden inscribirse en cursos disponibles
- **Diseño Responsivo**: Funciona en dispositivos de escritorio y móviles
- **Interfaz Moderna**: Construida con React y Bootstrap para una interfaz limpia y moderna

## Stack Tecnológico

### Backend
- Node.js con Express
- Base de datos MySQL con Sequelize ORM
- JWT para autenticación
- Validación de entrada con Express Validator

### Frontend
- React 18 con React Router v6
- Componentes UI de Bootstrap 5
- Axios para peticiones API

### Desarrollo y Calidad
- Docker para configuración y despliegue fácil
- SonarQube para análisis estático de código (opcional)

## Requisitos Previos

- Docker y Docker Compose
- Node.js (para desarrollo local)
- npm o yarn (para desarrollo local)
- Make (opcional, para usar los comandos del Makefile)

## Primeros Pasos

### Usando Makefile (Recomendado)

El proyecto incluye un Makefile para simplificar operaciones comunes:

1. Iniciar la aplicación:
   ```
   make up
   ```

2. Inicializar la base de datos con datos de ejemplo:
   ```
   make setup-db
   ```

3. Ver logs:
   ```
   make logs
   ```

4. Detener la aplicación:
   ```
   make down
   ```

5. Para ver una lista de todos los comandos disponibles:
   ```
   make help
   ```

### Usando Docker Directamente

1. Clonar el repositorio:
   ```
   git clone [repository-url]
   cd educational-platform
   ```

2. Iniciar la aplicación usando Docker Compose:
   ```
   docker compose up -d
   ```

3. Acceder a la aplicación:
   - Frontend: http://localhost:3000
   - API Backend: http://localhost:5000

### Configuración Manual (Desarrollo)

#### Configuración del Backend

1. Navegar al directorio del backend:
   ```
   cd backend
   ```

2. Instalar dependencias:
   ```
   npm install
   ```

3. Crear un archivo `.env` con el siguiente contenido:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=password
   DB_NAME=edu_platform
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

4. Iniciar el servidor de desarrollo:
   ```
   npm run dev
   ```

#### Configuración del Frontend

1. Navegar al directorio del frontend:
   ```
   cd frontend
   ```

2. Instalar dependencias:
   ```
   npm install
   ```

3. Crear un archivo `.env` con:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Iniciar el servidor de desarrollo:
   ```
   npm start
   ```

## Análisis de Código con SonarQube

SonarQube se proporciona como un servicio separado para análisis estático de código y no se inicia automáticamente con la aplicación principal.

### Iniciar SonarQube

Para usar SonarQube para análisis de código:

1. Iniciar el contenedor de SonarQube:
   ```
   make sonar-up
   ```

2. Acceder a la interfaz de SonarQube: http://localhost:9000
   (credenciales por defecto: admin/admin)

3. Ejecutar análisis (requiere sonar-scanner instalado):
   ```
   make sonar-analyze
   ```

4. Detener el contenedor de SonarQube cuando ya no sea necesario:
   ```
   make sonar-down
   ```

## Documentación de la API

### Endpoints de Autenticación

- `POST /api/auth/register` - Registrar un nuevo usuario
- `POST /api/auth/login` - Iniciar sesión

### Endpoints de Cursos

- `GET /api/courses` - Obtener todos los cursos (filtrados por rol de usuario)
- `GET /api/courses/:id` - Obtener detalles de un curso
- `POST /api/courses` - Crear un nuevo curso (admin/profesor)
- `PUT /api/courses/:id` - Actualizar un curso (admin/profesor)
- `DELETE /api/courses/:id` - Eliminar un curso (solo admin)
- `POST /api/courses/enroll/:id` - Inscribirse en un curso (estudiante)
- `DELETE /api/courses/enroll/:id` - Cancelar inscripción de un curso (estudiante)

### Endpoints de Usuarios

- `GET /api/users` - Obtener todos los usuarios (solo admin)
- `GET /api/users/:id` - Obtener detalles de un usuario (admin/propio)
- `POST /api/users` - Crear un nuevo usuario (solo admin)
- `PUT /api/users/:id` - Actualizar un usuario (admin/propio)
- `DELETE /api/users/:id` - Eliminar un usuario (solo admin)

## Usuarios Predeterminados

Al iniciar la aplicación por primera vez, puedes registrar nuevos usuarios o usar estas credenciales:

1. **Administrador**
   - Email: admin@example.com
   - Contraseña: admin123

2. **Profesor**
   - Email: instructor@example.com
   - Contraseña: instructor123

3. **Estudiante**
   - Email: student@example.com
   - Contraseña: student123

Para inicializar la base de datos con estos usuarios predeterminados y cursos de ejemplo, ejecuta:
```
make setup-db
```

## Estructura del Proyecto

```
/
├── backend/                # Aplicación backend Node.js/Express
│   ├── src/
│   │   ├── middleware/     # Middleware de autenticación y autorización
│   │   ├── models/         # Modelos Sequelize
│   │   ├── routes/         # Rutas API
│   │   ├── scripts/        # Scripts de utilidad (población de base de datos)
│   │   └── index.js        # Punto de entrada
│   ├── Dockerfile          # Configuración Docker para backend
│   └── package.json        # Dependencias Node.js
├── frontend/               # Aplicación frontend React
│   ├── public/             # Archivos estáticos
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   │   ├── admin/      # Componentes específicos de admin
│   │   │   ├── auth/       # Componentes de autenticación
│   │   │   ├── courses/    # Componentes relacionados con cursos
│   │   │   ├── instructor/ # Componentes específicos de profesor
│   │   │   └── student/    # Componentes específicos de estudiante
│   │   ├── App.js          # Componente principal de la aplicación
│   │   └── index.js        # Punto de entrada
│   ├── Dockerfile          # Configuración Docker para frontend
│   └── package.json        # Dependencias Node.js
├── docker-compose.yml              # Configuración Docker Compose principal
├── docker-compose.sonarqube.yml    # Configuración separada para SonarQube
├── Makefile                        # Comandos Make para simplificar operaciones
└── README.md                       # Documentación del proyecto
```

## Licencia

Este proyecto está licenciado bajo la Licencia MIT.
