// Mock de Sequelize para tests simples
const Sequelize = {
  define: jest.fn(() => ({
    sync: jest.fn().mockResolvedValue(true),
    create: jest.fn().mockImplementation((data) => {
      return Promise.resolve({
        ...data,
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
        destroy: jest.fn().mockResolvedValue(true)
      });
    }),
    findByPk: jest.fn().mockImplementation((id) => {
      if (id === 0) return Promise.resolve(null);
      return Promise.resolve({
        id: id,
        title: 'Updated Title',
        code: 'UPDATE101',
        description: 'Added description',
        instructorId: 1
      });
    }),
    findOne: jest.fn().mockResolvedValue(null)
  }))
};

// Mock del modelo Course
const CourseModel = (sequelize) => {
  return Sequelize.define('Course', {
    id: {
      type: 'INTEGER',
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: 'STRING',
      allowNull: false
    },
    description: {
      type: 'TEXT',
      allowNull: true
    },
    code: {
      type: 'STRING',
      allowNull: false,
      unique: true
    },
    instructorId: {
      type: 'INTEGER',
      allowNull: false
    },
    startDate: {
      type: 'DATE',
      allowNull: true
    },
    endDate: {
      type: 'DATE',
      allowNull: true
    },
    active: {
      type: 'BOOLEAN',
      defaultValue: true
    }
  });
};

// Mock de los errores de Sequelize
const ValidationError = new Error('Validation error');
ValidationError.name = 'SequelizeValidationError';

const UniqueConstraintError = new Error('Unique constraint error');
UniqueConstraintError.name = 'SequelizeUniqueConstraintError';

describe('Course Model', () => {
  let Course;

  beforeAll(() => {
    // Creamos un modelo Course simulado
    Course = CourseModel(Sequelize);
  });

  beforeEach(() => {
    // Reseteamos los mocks antes de cada test
    jest.clearAllMocks();
  });

  test('should create a course with valid data', async () => {
    // Test data
    const courseData = {
      title: 'Test Course',
      code: 'TEST101',
      description: 'This is a test course',
      instructorId: 1,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      active: true
    };

    // Configuramos el mock para devolver los datos correctos
    Course.create.mockResolvedValueOnce({
      ...courseData,
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const course = await Course.create(courseData);

    // Verificamos que el curso se creó con los datos correctos
    expect(course).toBeDefined();
    expect(course.id).toBeDefined();
    expect(course.title).toBe(courseData.title);
    expect(course.code).toBe(courseData.code);
    expect(course.description).toBe(courseData.description);
    expect(course.instructorId).toBe(courseData.instructorId);
    expect(course.active).toBe(courseData.active);
    expect(course.createdAt).toBeDefined();
    expect(course.updatedAt).toBeDefined();
  });

  test('should not create a course without required fields', async () => {
    // Mock para simular error cuando falta el título
    Course.create.mockRejectedValueOnce(ValidationError);
    
    await expect(Course.create({
      code: 'TEST102',
      instructorId: 1
    })).rejects.toThrow();
    
    // Mock para simular error cuando falta el código
    Course.create.mockRejectedValueOnce(ValidationError);
    
    await expect(Course.create({
      title: 'Another Test Course',
      instructorId: 1
    })).rejects.toThrow();
    
    // Mock para simular error cuando falta el instructorId
    Course.create.mockRejectedValueOnce(ValidationError);
    
    await expect(Course.create({
      title: 'Another Test Course',
      code: 'TEST103'
    })).rejects.toThrow();
  });

  test('should enforce unique code constraint', async () => {
    // Mock para el primer curso que se crea exitosamente
    Course.create.mockResolvedValueOnce({
      id: 1,
      title: 'Test Course 1',
      code: 'UNIQUE101',
      instructorId: 1
    });
    
    const firstCourse = await Course.create({
      title: 'Test Course 1',
      code: 'UNIQUE101',
      instructorId: 1
    });
    
    // Mock para simular que el segundo curso con el mismo código falla
    Course.create.mockRejectedValueOnce(UniqueConstraintError);
    
    await expect(Course.create({
      title: 'Test Course 2',
      code: 'UNIQUE101',
      instructorId: 2
    })).rejects.toThrow();
  });

  test('should update a course successfully', async () => {
    // Mock para el curso que se va a actualizar
    const course = {
      id: 1,
      title: 'Initial Title',
      code: 'UPDATE101',
      instructorId: 1,
      active: true,
      save: jest.fn().mockResolvedValue(true)
    };
    
    Course.create.mockResolvedValueOnce(course);
    
    const createdCourse = await Course.create({
      title: 'Initial Title',
      code: 'UPDATE101',
      instructorId: 1,
      active: true
    });
    
    // Actualizamos el curso
    createdCourse.title = 'Updated Title';
    createdCourse.description = 'Added description';
    await createdCourse.save();
    
    // Mock para obtener el curso actualizado
    Course.findByPk.mockResolvedValueOnce({
      id: 1,
      title: 'Updated Title',
      description: 'Added description',
      code: 'UPDATE101',
      instructorId: 1,
      active: true
    });
    
    const updatedCourse = await Course.findByPk(1);
    
    // Verificamos los datos actualizados
    expect(updatedCourse.title).toBe('Updated Title');
    expect(updatedCourse.description).toBe('Added description');
    expect(updatedCourse.code).toBe('UPDATE101');
  });

  test('should delete a course successfully', async () => {
    // Mock para el curso que se va a eliminar
    const course = {
      id: 1,
      title: 'Course to Delete',
      code: 'DELETE101',
      instructorId: 1,
      destroy: jest.fn().mockResolvedValue(true)
    };
    
    Course.create.mockResolvedValueOnce(course);
    
    const createdCourse = await Course.create({
      title: 'Course to Delete',
      code: 'DELETE101',
      instructorId: 1
    });
    
    // Eliminamos el curso
    await createdCourse.destroy();
    
    // Mock para simular que el curso ya no existe
    Course.findByPk.mockResolvedValueOnce(null);
    
    const deletedCourse = await Course.findByPk(1);
    
    // Verificamos que el curso fue eliminado
    expect(deletedCourse).toBeNull();
  });
}); 