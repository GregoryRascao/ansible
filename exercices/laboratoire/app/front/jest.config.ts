import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.(ts|mjs|html|js)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/projects/core/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$'
      }
    ]
  },
  moduleFileExtensions: ['ts', 'html', 'js', 'mjs', 'json'],
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/projects/core/$1',
    '^@features/(.*)$': '<rootDir>/projects/core/src/app/features/$1',
    '^@shared/(.*)$': '<rootDir>/projects/core/src/app/shared/$1',
    '^@i18n/(.*)$': '<rootDir>/projects/i18n/$1',
    '^@themes/(.*)$': '<rootDir>/projects/themes/$1'
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/']
};

export default config;
