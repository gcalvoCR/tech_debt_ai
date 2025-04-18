const { sequelize, User, Course } = require('../models');

// Seed database with initial data
async function seedDatabase() {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synchronized');

    // Create default users
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      active: true
    });

    const instructor = await User.create({
      firstName: 'Instructor',
      lastName: 'User',
      email: 'instructor@example.com',
      password: 'instructor123',
      role: 'instructor',
      active: true
    });

    const student = await User.create({
      firstName: 'Student',
      lastName: 'User',
      email: 'student@example.com',
      password: 'student123',
      role: 'student',
      active: true
    });

    console.log('Default users created');

    // Create sample courses
    const course1 = await Course.create({
      title: 'Introduction to Programming',
      code: 'CS101',
      description: 'A beginner-friendly course covering the fundamentals of programming logic and syntax.',
      instructorId: instructor.id,
      active: true,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3))
    });

    const course2 = await Course.create({
      title: 'Web Development Basics',
      code: 'WEB200',
      description: 'Learn HTML, CSS, and JavaScript to build interactive websites from scratch.',
      instructorId: instructor.id,
      active: true,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3))
    });

    const course3 = await Course.create({
      title: 'Database Design',
      code: 'DB300',
      description: 'Introduction to database concepts, SQL, and relational database design principles.',
      instructorId: instructor.id,
      active: true,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3))
    });

    console.log('Sample courses created');

    // Enroll student in a course
    await student.addEnrolledCourse(course1);
    console.log('Student enrolled in sample course');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase(); 