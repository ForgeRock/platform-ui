/**
 * Copyright (c) 2019-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const path = require('path');

module.exports = {
  runtimeCompiler: true,
  css: {
    loaderOptions: {
      sass: {
        prependData: `
          @import "~bootstrap/scss/_functions.scss";
          @import "~bootstrap/scss/_mixins.scss";
          @import "~@forgerock/platform-shared/src/scss/theme-variables.scss";
          @import "~bootstrap/scss/_variables.scss";
        `,
      },
    },
  },
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === 'development') {
      // https://webpack.js.org/configuration/devtool/#devtool
      config.devtool = 'eval-source-map';

      config.output.devtoolModuleFilenameTemplate = (info) => {
        const resPath = path.normalize(info.resourcePath);
        const isVue = resPath.match(/\.vue$/);
        const isGenerated = info.allLoaders;

        const generated = `webpack-generated:///${resPath}?${info.hash}`;
        const vuesource = `vue-source:///${resPath}`;

        return isVue && isGenerated ? generated : vuesource;
      };

      config.output.devtoolFallbackModuleFilenameTemplate = 'webpack:///[resource-path]?[hash]';
    }
  },
};
