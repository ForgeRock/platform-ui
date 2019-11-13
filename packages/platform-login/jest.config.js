/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
const baseConfig = require('../../jest.config.base');

process.env.VUE_CLI_BABEL_TARGET_NODE = true;
process.env.VUE_CLI_BABEL_TRANSPILE_MODULES = true;

module.exports = {
  ...baseConfig,
  setupFiles: ['./register-context.js'],
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: '../../html_reports',
      filename: 'login-test-report.html',
    }],
  ],
};
