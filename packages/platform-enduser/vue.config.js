/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint import/no-extraneous-dependencies: 0 */
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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

  plugins.push(new CopyWebpackPlugin([
    {
      from: '../../node_modules/appauthhelper/appAuthHelperRedirect.html',
      to: 'appAuthHelperRedirect.html',
      toType: 'file',
    },
    {
      from: '../../node_modules/appauthhelper/appAuthServiceWorker.js',
      to: 'appAuthServiceWorker.js',
      toType: 'file',
    },
    {
      from: '../../node_modules/appauthhelper/appAuthHelperFetchTokensBundle.js',
      to: 'appAuthHelperFetchTokensBundle.js',
      toType: 'file',
    },
    {
      from: '../../node_modules/oidcsessioncheck/sessionCheck.html',
      to: 'sessionCheck.html',
      toType: 'file',
    },
    {
      from: '../../node_modules/oidcsessioncheck/sessionCheckFrame.js',
      to: 'sessionCheckFrame.js',
      toType: 'file',
    },
  ]));

  return plugins;
}

module.exports = {
  publicPath: './',
  runtimeCompiler: true,
  pages: {
    index: {
      // entry for the page
      entry: './src/main.js',
    },
  },
  devServer: {
    disableHostCheck: true,
    host: process.env.HOST || '0.0.0.0',
    port: process.env.DEV_PORT || 8888,
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
    plugins: getPlugins(),
    devtool: 'source-map',
  },
  transpileDependencies: [
    'appauthhelper',
  ],
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
};
