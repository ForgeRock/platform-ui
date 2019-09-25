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

module.exports = {
  runtimeCompiler: true,
  devServer: {
    allowedHosts: [
      'login.example.com',
      '0.0.0.0',
    ],
    port: process.env.DEV_PORT || 8080,
  },
  css: {
    loaderOptions: {
      sass: {
        data: generateTheme(),
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
  },
};
