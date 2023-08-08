/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

module.exports = {
  // Disabled temporarily due a bug in babel: https://github.com/babel/babel/issues/12314
  // babelrcRoots: [
  //   '.',
  //   'packages/*',
  // ],
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
    ['@vue/cli-plugin-babel/preset', { useBuiltIns: 'entry' }],
  ],
};
