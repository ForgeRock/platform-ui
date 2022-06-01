/**
 * Copyright 2020-2022 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const path = require('path');

module.exports = {
  rootDir: path.resolve(__dirname, '..', '..', '..'),
  runner: 'stylelint',
  displayName: 'stylelint',
  moduleFileExtensions: [
    'css',
    'sass',
    'scss',
    'html',
    'vue',
  ],
  testMatch: [
    '**/*.css',
    '**/*.sass',
    '**/*.scss',
    '**/*.htm',
    '**/*.html',
    '**/*.vue',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '<rootDir>/mochawesome-report/',
    '<rootDir>/html_reports/',
    '<rootDir>/coverage/',
  ],
  watchPathIgnorePatterns: [
    // Stops watch mode from looping due to writing the report triggering a new test run.
    '<rootDir>/html_reports/',
  ],
};
