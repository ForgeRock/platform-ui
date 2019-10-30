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
