const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Enrollment = sequelize.define('Enrollment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    CourseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'id'
      }
    },
    enrollmentDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    grade: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'dropped'),
      defaultValue: 'active'
    }
  }, {
    timestamps: true
  });

  return Enrollment;
}; 