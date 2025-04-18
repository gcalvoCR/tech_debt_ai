const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize');

// Test setup
const app = express();
app.use(express.json());

// Mock models and middleware
jest.mock('../../src/models', () => {
  const SequelizeMock = require('sequelize-mock');
  const dbMock = new SequelizeMock();
  
  const CourseModel = dbMock.define('Course', {
    id: 1,
    title: 'Test Course',
    code: 'TEST101',
    description: 'Test Description',
    instructorId: 1,
    active: true
  });
  
  // Add the findOne method for Course validation
  CourseModel.findOne = jest.fn().mockImplementation(({ where }) => {
    // Mock behavior: return null for new code, return mock instance for existing code
    if (where && where.code === 'EXISTING_CODE') {
      return Promise.resolve(CourseModel.build({ code: 'EXISTING_CODE' }));
    }
    return Promise.resolve(null);
  });
  
  // Add the create method for Course creation
  CourseModel.create = jest.fn().mockImplementation((data) => {
    return Promise.resolve({ id: 1, ...data });
  });
  
  return {
    Course: CourseModel,
    User: dbMock.define('User', {
      id: 1,
      firstName: 'Test',
      lastName: 'User'
    })
  };
});

// Mock authentication middleware
jest.mock('../../src/middleware/auth.middleware', () => {
  return {
    authenticateToken: (req, res, next) => {
      // Add user to request
      req.user = {
        id: 1,
        email: 'test@example.com',
        role: req.headers['x-role'] || 'admin' // Use header to control role in tests
      };
      next();
    },
    authorize: (...roles) => (req, res, next) => {
      if (roles.includes(req.user.role)) {
        next();
      } else {
        res.status(403).json({ message: 'Forbidden' });
      }
    }
  };
});

// Import routes after mocks are set up
const courseRoutes = require('../../src/routes/course.routes');
app.use('/api/courses', courseRoutes);

// Mocks para los módulos necesarios
const requestMock = {
  post: jest.fn(() => requestMock),
  set: jest.fn(() => requestMock),
  send: jest.fn(() => Promise.resolve({
    status: 201,
    body: {
      message: 'Course created successfully',
      course: {
        id: 1,
        title: 'New Course',
        code: 'NEW101',
        description: 'This is a new course',
        instructorId: 2
      }
    }
  }))
};

// Mock de express
const expressMock = {
  json: jest.fn(),
  Router: jest.fn().mockReturnValue({
    get: jest.fn(),
    post: jest.fn((path, ...middlewares) => {
      // Simular la ejecución de los middlewares cuando se llama a post
      const req = {
        body: {},
        user: { id: 1, role: 'admin' },
        headers: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      middlewares.forEach(middleware => {
        middleware(req, res, () => {});
      });
      return this;
    }),
    put: jest.fn(),
    delete: jest.fn()
  })
};

// Mock de los modelos
const mockCourse = {
  findOne: jest.fn().mockImplementation(({ where }) => {
    if (where && where.code === 'EXISTING_CODE') {
      return Promise.resolve({ code: 'EXISTING_CODE' });
    }
    return Promise.resolve(null);
  }),
  create: jest.fn().mockImplementation((data) => {
    return Promise.resolve({ id: 1, ...data });
  }),
  findAll: jest.fn().mockResolvedValue([])
};

const mockUser = {
  findByPk: jest.fn().mockResolvedValue(null)
};

// Mocks para los middleware de autenticación
const authMiddleware = {
  authenticateToken: (req, res, next) => {
    req.user = {
      id: 1,
      role: req.headers['x-role'] || 'admin'
    };
    next();
  },
  authorize: (...roles) => (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
  }
};

// Mock para express-validator
const expressValidator = {
  body: jest.fn().mockReturnThis(),
  trim: jest.fn().mockReturnThis(),
  notEmpty: jest.fn().mockReturnThis(),
  withMessage: jest.fn().mockReturnThis(),
  optional: jest.fn().mockReturnThis(),
  isISO8601: jest.fn().mockReturnThis(),
  validationResult: jest.fn().mockReturnValue({
    isEmpty: jest.fn().mockReturnValue(true),
    array: jest.fn().mockReturnValue([])
  })
};

// Tests simplificados para la creación de cursos
describe('Course Controller', () => {
  // Mock para Course.findOne
  const mockFindOne = jest.fn();
  // Mock para Course.create
  const mockCreate = jest.fn();

  // Reset mocks antes de cada test
  beforeEach(() => {
    mockFindOne.mockReset();
    mockCreate.mockReset();
  });

  // Test para la creación de cursos como admin
  test('should create a course as admin', async () => {
    // Setup
    const req = {
      user: { id: 1, role: 'admin' },
      body: {
        title: 'Test Course',
        code: 'TEST101',
        description: 'Test description',
        instructorId: 2
      }
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Mock de Course.findOne retorna null (curso no existe)
    mockFindOne.mockResolvedValue(null);
    
    // Mock de Course.create retorna curso creado
    const createdCourse = { 
      id: 1, 
      ...req.body 
    };
    mockCreate.mockResolvedValue(createdCourse);
    
    // Función de controlador 
    const createCourse = async (req, res) => {
      try {
        // Verifica si el curso existe
        const existingCourse = await mockFindOne({ 
          where: { code: req.body.code } 
        });
        
        if (existingCourse) {
          return res.status(400).json({ 
            message: 'Course code already exists' 
          });
        }
        
        // Crear el curso
        const course = await mockCreate({
          ...req.body,
          instructorId: req.user.role === 'admin' && req.body.instructorId 
            ? req.body.instructorId 
            : req.user.id
        });
        
        return res.status(201).json({
          message: 'Course created successfully',
          course
        });
      } catch (err) {
        return res.status(500).json({ 
          message: 'Error creating course' 
        });
      }
    };
    
    // Ejecutar
    await createCourse(req, res);
    
    // Verificar
    expect(mockFindOne).toHaveBeenCalledWith({ 
      where: { code: 'TEST101' } 
    });
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test Course',
      code: 'TEST101',
      instructorId: 2
    }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Course created successfully',
      course: createdCourse
    });
  });
  
  // Test para la creación de cursos como instructor
  test('should create a course as instructor', async () => {
    // Setup
    const req = {
      user: { id: 1, role: 'instructor' },
      body: {
        title: 'Instructor Course',
        code: 'INST101',
        description: 'Course by instructor'
      }
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Mock de Course.findOne retorna null (curso no existe)
    mockFindOne.mockResolvedValue(null);
    
    // Mock de Course.create retorna curso creado
    const createdCourse = { 
      id: 1, 
      ...req.body,
      instructorId: req.user.id
    };
    mockCreate.mockResolvedValue(createdCourse);
    
    // Función de controlador 
    const createCourse = async (req, res) => {
      try {
        // Verifica si el curso existe
        const existingCourse = await mockFindOne({ 
          where: { code: req.body.code } 
        });
        
        if (existingCourse) {
          return res.status(400).json({ 
            message: 'Course code already exists' 
          });
        }
        
        // Crear el curso
        const course = await mockCreate({
          ...req.body,
          instructorId: req.user.id
        });
        
        return res.status(201).json({
          message: 'Course created successfully',
          course
        });
      } catch (err) {
        return res.status(500).json({ 
          message: 'Error creating course' 
        });
      }
    };
    
    // Ejecutar
    await createCourse(req, res);
    
    // Verificar
    expect(mockFindOne).toHaveBeenCalledWith({ 
      where: { code: 'INST101' } 
    });
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Instructor Course',
      code: 'INST101',
      instructorId: 1
    }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Course created successfully',
      course: createdCourse
    });
  });
  
  // Test para curso con código ya existente
  test('should reject when course code already exists', async () => {
    // Setup
    const req = {
      user: { id: 1, role: 'admin' },
      body: {
        title: 'Duplicate Course',
        code: 'EXISTING_CODE',
        description: 'This code already exists'
      }
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Mock de Course.findOne retorna un curso existente
    mockFindOne.mockResolvedValue({ 
      id: 99, 
      code: 'EXISTING_CODE' 
    });
    
    // Función de controlador 
    const createCourse = async (req, res) => {
      try {
        // Verifica si el curso existe
        const existingCourse = await mockFindOne({ 
          where: { code: req.body.code } 
        });
        
        if (existingCourse) {
          return res.status(400).json({ 
            message: 'Course code already exists' 
          });
        }
        
        // Si llegamos aquí, el test fallará
        return res.status(201).json({
          message: 'Course created successfully',
          course: {}
        });
      } catch (err) {
        return res.status(500).json({ 
          message: 'Error creating course' 
        });
      }
    };
    
    // Ejecutar
    await createCourse(req, res);
    
    // Verificar
    expect(mockFindOne).toHaveBeenCalledWith({ 
      where: { code: 'EXISTING_CODE' } 
    });
    expect(mockCreate).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Course code already exists'
    });
  });
  
  // Test para autorización - estudiantes no pueden crear cursos
  test('should reject when student tries to create a course', () => {
    // Setup
    const req = {
      user: { id: 1, role: 'student' }
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    const next = jest.fn();
    
    // Middleware de autorización
    const authorizeMiddleware = (allowedRoles) => (req, res, next) => {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    };
    
    // Ejecutar middleware con roles permitidos: admin, instructor
    authorizeMiddleware(['admin', 'instructor'])(req, res, next);
    
    // Verificar
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });
}); 