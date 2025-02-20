/**
 * Copyright 2019-2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
const baseConfig = require('../../jest.config.base');

process.env.VUE_CLI_BABEL_TARGET_NODE = true;
process.env.VUE_CLI_BABEL_TRANSPILE_MODULES = true;
process.env.TZ = 'UTC';

module.exports = {
  ...baseConfig,
  displayName: 'platform-shared',
};
