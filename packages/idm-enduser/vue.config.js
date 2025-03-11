/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/* eslint import/no-extraneous-dependencies: 0 */
const webpack = require('webpack');
const path = require('path');

function generateTheme() {
  let variableLoad = `
    @import "~bootstrap/scss/_functions.scss";
    @import "~bootstrap/scss/_mixins.scss";
    @import "~@forgerock/platform-shared/src/scss/theme-variables.scss";
  `;

  if (process.env.THEME && process.env.THEME !== 'default') {
    variableLoad += `@import "~@forgerock/platform-shared/src/scss/${process.env.THEME}-theme.scss";`;
  }

  variableLoad += '@import "~bootstrap/scss/_variables.scss";';

  return variableLoad;
}

function getPlugins() {
  const plugins = [
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
    }),
    new webpack.BannerPlugin('Copyright (c) 2020 ForgeRock. All rights reserved. This software may be modified and distributed under the terms of the MIT license. See the LICENSE file for details.'),
  ];

  return plugins;
}

module.exports = {
  devServer: {
    allowedHosts: 'all',
    host: process.env.HOST || '0.0.0.0',
    port: process.env.DEV_PORT || 8889,
    client: {
      webSocketURL: {
        hostname: 'localhost',
        pathname: 'ws',
        port: process.env.DEV_PORT || 8889,
      },
    },
    proxy: {
      '/openidm': {
        target: 'https://localhost:8443/openidm',
        pathRewrite: { '^/openidm': '' },
        changeOrigin: true,
      },
    },
    webSocketServer: process.env.NODE_ENV !== 'development' ? false : 'ws',
    compress: false,
    historyApiFallback: true,
  },
  chainWebpack: (config) => {
    config.resolve.alias.set('vue$', '@vue/compat');

    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => ({
        ...options,
        compilerOptions: {
          compatConfig: {
            MODE: 2,
          },
        },
      }));

    config.module
      .rule('js')
      .use('babel-loader')
      .tap((options) => ({
        ...options,
        rootMode: 'upward',
      }));
  },
  configureWebpack: {
    plugins: getPlugins(),
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
      css: {
        modules: {
          auto: () => true,
          mode: 'global',
        },
      },
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
};
