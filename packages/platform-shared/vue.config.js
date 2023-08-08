/**
 * Copyright (c) 2019-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

module.exports = {
  runtimeCompiler: true,
  css: {
    loaderOptions: {
      css: {
        modules: {
          auto: () => true,
          mode: 'global',
        },
      },
      sass: {
        prependData: `
          @import "~bootstrap/scss/_functions.scss";
          @import "~bootstrap/scss/_mixins.scss";
          @import "./src/scss/theme-variables.scss";
          @import "~bootstrap/scss/_variables.scss";
        `,
      },
    },
  },
  pluginOptions: {
    lintStyleOnBuild: true,
  },
};
