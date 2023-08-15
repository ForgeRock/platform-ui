/**
 * Copyright (c) 2019-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const path = require('path');

process.env.VUE_APP_AM_URL = 'https://default.iam.example.com/am';

module.exports = {
  moduleFileExtensions: [
    'js',
    'json',
    'vue',
  ],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '^.+\\.js$': path.join(__dirname, 'config', 'jest', 'babel-transform.js'),
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(babel-jest|jest-vue-preprocessor|vee-validate/dist|vue-multiselect)/)',
  ],
  moduleNameMapper: {
    axios: '<rootDir>/../../__mocks__/axios.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css)$': '<rootDir>/../../node_modules/jest-css-modules',
    d3: '<rootDir>/../../node_modules/d3/dist/d3.min.js',
  },
  testMatch: [
    '**/*.test.js',
  ],
  setupFiles: [
    path.join(__dirname, 'config', 'jest', 'register-context.js'),
  ],
  setupFilesAfterEnv: [
    path.join(__dirname, 'config', 'jest', 'snapshot-errors.js'),
    path.join(__dirname, 'config', 'jest', 'jest-dom.js'),
    path.join(__dirname, 'config', 'jest', 'domrect-polyfill.js'),
  ],
};
