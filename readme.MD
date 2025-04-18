Prompt inicial
Quiero que generes una aplicación web completa para reemplazar Moodle como plataforma educativa. La aplicación debe permitir la gestión y control de cursos.
Requisitos técnicos:
Utiliza una arquitectura de capas.
El frontend debe estar desarrollado con React.
El backend debe estar desarrollado con Express (Node.js).
Utiliza MariaDB como base de datos.
Todo el proyecto debe ejecutarse localmente mediante Docker Compose.
Integra SonarQube para análisis de calidad del código.
Incluye pruebas unitarias para frontend y backend.
Implementa un sistema de autenticación basado en JWT, con endpoints para registro, login y protección de rutas.
Implementa control de acceso basado en roles. Al menos deben existir los siguientes roles:
Administrador: puede gestionar usuarios y cursos.
Profesor: puede crear y administrar sus cursos.
Estudiante: puede inscribirse y acceder a sus cursos.
Interfaz de usuario:
La interfaz debe ser básica pero funcional para cada rol:
Administrador: Pantalla para gestionar usuarios, asignar roles y administrar cursos.
Profesor: Pantalla para crear, editar y gestionar los cursos que imparte.
Estudiante: Pantalla para inscribirse en cursos y visualizar el contenido de los cursos en los que está inscrito.
La estructura del proyecto debe ser clara, modular y seguir buenas prácticas de desarrollo. Empezá generando la estructura base del proyecto con los contenedores y carpetas necesarias, incluyendo un servicio de autenticación y un módulo CRUD de cursos como ejemplo funcional. Asegúrate de que el control de acceso esté bien definido y respetado en los endpoints protegidos.
