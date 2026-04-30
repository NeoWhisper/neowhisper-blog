import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
    dir: './',
});

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/tests/'],
    testMatch: ['**/*.test.ts', '**/*.test.tsx'],
    transformIgnorePatterns: [
        'node_modules/(?!(isomorphic-dompurify|dompurify|@exodus)/)',
    ],
};

export default createJestConfig(customJestConfig);
