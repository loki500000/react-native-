module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/integration'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: [
    'ai-engine/src/**/*.ts',
    'preview-server/src/**/*.ts',
    'mcp-servers/*/src/**/*.ts',
  ],
  testTimeout: 60000, // 60 seconds for integration tests
};
