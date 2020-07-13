/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
module.exports = {
  env: {
    development: {
      sourceMaps: true,
      retainLines: true,
    },
    test: {
      plugins: ['require-context-hook'],
    },
  },
  presets: [
    ['@vue/app', { useBuiltIns: 'entry' }],
  ],
};
