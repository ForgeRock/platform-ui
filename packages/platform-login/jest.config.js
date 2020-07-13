/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
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
