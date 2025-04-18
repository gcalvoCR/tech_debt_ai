const { Sequelize } = require('sequelize');

// Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

// Import models
const User = require('./user.model')(sequelize);
const Course = require('./course.model')(sequelize);
const Enrollment = require('./enrollment.model')(sequelize);

// Define associations
User.hasMany(Course, { foreignKey: 'instructorId', as: 'courses' });
Course.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

User.belongsToMany(Course, { through: Enrollment, as: 'enrolledCourses' });
Course.belongsToMany(User, { through: Enrollment, as: 'students' });

// Export models and connection
module.exports = {
  sequelize,
  User,
  Course,
  Enrollment
}; 