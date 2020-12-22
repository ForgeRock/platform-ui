/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const path = require('path');

module.exports = {
  rootDir: path.resolve(__dirname, '..', '..', '..'),
  runner: 'jest-runner-eslint',
  displayName: 'lint',
  testMatch: ['<rootDir>/**/*.{js,vue,mjs}'],
  moduleFileExtensions: ['js', 'json', 'vue', 'mjs'],
};
