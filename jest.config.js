module.exports = {
  moduleFileExtensions: [
    'js',
  ],
  moduleDirectories: [
    'node_modules',
    'src',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.vscode/',
    '/.history/',
    '/.*.config.js/',
    '/__snapshots__/',
  ],
  timers: 'fake',
  collectCoverage: true,
  coverageDirectory: './coverage/jest',
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
};
