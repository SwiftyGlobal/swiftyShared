/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.spec.ts', '**/*.test.ts'],
  coverageReporters: ['text'], // Show in console only
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}', // Include all TypeScript files
    '!src/**/*.d.ts', // Exclude TypeScript declaration files
    '!src/**/index.ts', // (Optional) Exclude index files
    '!src/common/**/*', // (Optional) Exclude common files
    '!src/middlewares/**/*', // (Optional) Exclude middlewares files
  ],
};
