/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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
          @import "~@forgerock/platform-components/src/scss/theme-variables.scss";
          @import "~bootstrap/scss/_variables.scss";
        `
      },
    },
  },
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.stories\.(js|mdx)?$/,
          loader: require.resolve('@storybook/source-loader'),
          include: [path.resolve(__dirname, 'packages/platform-components/src/components/')],
          enforce: 'pre',
        }
      ]
    }
  }
};
