module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!**/node_modules/**',
  ],
  coverageReporters: ['text', 'lcov'],
  testMatch: ['**/test/**/*.test.js'],
  verbose: true,
}; 