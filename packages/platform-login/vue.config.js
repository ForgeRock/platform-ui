/**
 * Copyright (c) 2020-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const path = require('path');

function generateTheme() {
  let variableLoad = `
      @import "~bootstrap/scss/_functions.scss";
      @import "~bootstrap/scss/_mixins.scss";
      @import "~@forgerock/platform-shared/src/scss/theme-variables.scss";
    `;

  if (process.env.THEME && process.env.THEME !== 'default') {
    variableLoad += `@import "~@forgerock/platform-shared/src/scss/${process.env.THEME}-theme.scss"; `;
  }

  variableLoad += '@import "~bootstrap/scss/_variables.scss";';

  return variableLoad;
}

const SUBFOLDER = './';
module.exports = {
  publicPath: SUBFOLDER,
  runtimeCompiler: true,
  devServer: {
    before: (app) => {
      if (SUBFOLDER !== './') {
        app.get(SUBFOLDER.replace(/\/$/, '$'), (req, res) => {
          res.redirect(SUBFOLDER);
        });
      } else {
        app.all((req, res, next) => {
          next();
        });
      }
    },
    disableHostCheck: true,
    host: process.env.HOST || '0.0.0.0',
    port: process.env.DEV_PORT || 8083,
  },
  chainWebpack: (config) => {
    config.module
      .rule('js')
      .use('babel-loader')
      .tap((options) => ({
        ...options,
        rootMode: 'upward',
      }));
  },
  configureWebpack: {
    devtool: process.env.NODE_ENV === 'development' ? 'eval-source-map' : 'source-map',
    output: {
      devtoolModuleFilenameTemplate: (info) => {
        const resPath = path.normalize(info.resourcePath);
        const isVue = resPath.match(/\.vue$/);
        const isGenerated = info.allLoaders;

        const generated = `webpack-generated:///${resPath}?${info.hash}`;
        const vuesource = `vue-source:///${resPath}`;

        return isVue && isGenerated ? generated : vuesource;
      },
      devtoolFallbackModuleFilenameTemplate: 'webpack:///[resource-path]?[hash]',
    },
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: generateTheme(),
      },
    },
  },
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false,
    },
    lintStyleOnBuild: true,
  },
  transpileDependencies: [
    'postcss',
    'nanoid',
    'sanitize-html',
  ],
};
