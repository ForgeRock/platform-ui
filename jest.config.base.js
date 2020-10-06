/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const path = require('path');

process.env.VUE_APP_AM_URL = 'https://default.iam.example.com/am';

module.exports = {
  moduleFileExtensions: [
    'js',
    'json',
    'vue',
  ],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '^.+\\.js$': path.join(__dirname, 'config', 'jest', 'babel-transform.js'),
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
  },
  transformIgnorePatterns: [
    '/node_modules/.*',
    'node_modules/(?!(babel-jest|jest-vue-preprocessor)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css)$': '<rootDir>/../../node_modules/jest-css-modules',
  },
  snapshotSerializers: [
    'jest-serializer-vue',
  ],
  testMatch: [
    '**/*.test.js',
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  collectCoverageFrom: [
    '**/*.vue',
    '!**/node_modules/**',
  ],
  setupFiles: [
    path.join(__dirname, 'config', 'jest', 'register-context.js'),
  ],
  setupFilesAfterEnv: [
    path.join(__dirname, 'config', 'jest', 'snapshot-errors.js'),
  ],
};
