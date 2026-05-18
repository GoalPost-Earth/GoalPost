/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  testTimeout: 45000,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
