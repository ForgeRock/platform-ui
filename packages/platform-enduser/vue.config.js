/**
 * Copyright (c) 2020-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint import/no-extraneous-dependencies: 0 */
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
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

  plugins.push(new CopyWebpackPlugin([
    {
      from: '../../node_modules/appauthhelper-enduser/appAuthHelperRedirect.html',
      to: 'appAuthHelperRedirect.html',
      toType: 'file',
    },
    {
      from: '../../node_modules/appauthhelper-enduser/appAuthServiceWorker.js',
      to: 'appAuthServiceWorker.js',
      toType: 'file',
    },
    {
      from: '../../node_modules/appauthhelper-enduser/appAuthHelperFetchTokensBundle.js',
      to: 'appAuthHelperFetchTokensBundle.js',
      toType: 'file',
    },
    {
      from: '../../node_modules/oidcsessioncheck-enduser/sessionCheck.html',
      to: 'sessionCheck.html',
      toType: 'file',
    },
    {
      from: '../../node_modules/oidcsessioncheck-enduser/sessionCheckFrame.js',
      to: 'sessionCheckFrame.js',
      toType: 'file',
    },
  ]));

  return plugins;
}

const SUBFOLDER = './';
module.exports = {
  publicPath: SUBFOLDER,
  runtimeCompiler: true,
  pages: {
    index: {
      // entry for the page
      entry: './src/main.js',
    },
  },
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
  transpileDependencies: [
    'appauthhelper',
    'nanoid',
    'postcss',
    'sanitize-html',
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
