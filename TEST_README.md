# Pruebas Unitarias - Plataforma Educativa

Este proyecto ahora incluye pruebas unitarias tanto para el frontend como para el backend.

## Estructura de las Pruebas

### Frontend

Las pruebas del frontend se encuentran en el directorio `frontend/src/__tests__/` y utilizan las siguientes tecnologías:

- Jest: Framework de testing
- React Testing Library: Para probar componentes React
- Mock Service Worker (MSW): Para simular peticiones HTTP (si es necesario)

### Backend

Las pruebas del backend se encuentran en el directorio `backend/test/` y utilizan:

- Jest: Framework de testing
- Supertest: Para probar endpoints HTTP
- Sequelize Mock / SQLite: Para simular la base de datos

## Ejecutar las Pruebas

### Frontend

Para ejecutar las pruebas del frontend:

```bash
# Navegar al directorio frontend
cd frontend

# Ejecutar las pruebas
npm test

# Ejecutar las pruebas con cobertura
npm run test:coverage
```

### Backend

Para ejecutar las pruebas del backend:

```bash
# Navegar al directorio backend
cd backend

# Ejecutar las pruebas
npm test

# Ejecutar las pruebas con cobertura
npm run test:coverage
```

## Cobertura de Pruebas

Se ha configurado un umbral mínimo de cobertura del 50% para ambos frontend y backend. Esto asegura que al menos la mitad del código esté cubierto por pruebas.

## Tipos de Pruebas Implementadas

### Frontend

1. **Pruebas de Renderizado**: Verifican que los componentes se rendericen correctamente.
2. **Pruebas de Interacción**: Verifican que los componentes respondan correctamente a las interacciones del usuario.
3. **Pruebas de Formularios**: Verifican la validación y el envío de formularios.
4. **Pruebas de Integración**: Verifican que los componentes trabajen juntos correctamente.

### Backend

1. **Pruebas de Modelos**: Verifican que los modelos de Sequelize funcionen correctamente.
2. **Pruebas de Rutas**: Verifican que los endpoints de la API funcionen correctamente.
3. **Pruebas de Middleware**: Verifican que los middleware funcionen correctamente.
4. **Pruebas de Validación**: Verifican que las validaciones funcionen correctamente.

## Añadir Nuevas Pruebas

Al añadir nuevas características al proyecto, asegúrese de añadir pruebas unitarias correspondientes para mantener la cobertura del código.

Para añadir nuevas pruebas:

1. Identifique el componente o funcionalidad a probar.
2. Cree un archivo de prueba con extensión `.test.js` en el directorio correspondiente.
3. Escriba las pruebas siguiendo el patrón de las pruebas existentes.
4. Ejecute las pruebas para verificar que funcionan correctamente.

## Consejos para Escribir Buenas Pruebas

1. Pruebe comportamientos, no implementaciones.
2. Mantenga las pruebas simples y enfocadas.
3. Use mocks para aislar la funcionalidad a probar.
4. Evite pruebas frágiles que dependan de detalles de implementación.
5. Asegúrese de que cada prueba sea independiente de las demás. 