/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
/* eslint import/no-extraneous-dependencies: 0 */
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function generateTheme() {
  let variableLoad = `
    @import "~bootstrap/scss/_functions.scss";
    @import "~bootstrap/scss/_mixins.scss";
    @import "~@forgerock/platform-components/src/scss/theme-variables.scss";
  `;

  if (process.env.THEME && process.env.THEME !== 'default') {
    variableLoad += `@import "@/scss/${process.env.THEME}-theme.scss"; `;
  }

  variableLoad += '@import "~bootstrap/scss/_variables.scss";';

  return variableLoad;
}

function getPlugins() {
  const plugins = [
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
    }),
    new webpack.BannerPlugin('Copyright 2019 ForgeRock AS. All Rights Reserved \n Use of this code requires a commercial software license with ForgeRock AS. or with one of its affiliates. All use shall be exclusively subject to such license between the licensee and ForgeRock AS.'),
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
    allowedHosts: [
      'openidm.example.com',
      '0.0.0.0',
    ],
    port: process.env.DEV_PORT || 8080,
  },
  configureWebpack: {
    plugins: getPlugins(),
    devtool: 'source-map',
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
};
