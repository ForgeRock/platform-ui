/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
module.exports = {
  runtimeCompiler: true,
  css: {
    loaderOptions: {
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
  transpileDependencies: [
    'appauthhelper',
  ],
};
