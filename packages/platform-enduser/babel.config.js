/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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