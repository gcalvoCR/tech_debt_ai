module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['**/test/**/*.test.js'],
  // No require mock para la mayoría de los módulos
  moduleNameMapper: {
    '^sequelize$': '<rootDir>/test/mocks/sequelize.js'
  }
}; 