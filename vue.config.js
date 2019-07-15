module.exports = {
  runtimeCompiler: true,
  css: {
    loaderOptions: {
      sass: {
        data: `
          @import "~bootstrap/scss/_functions.scss";
          @import "~bootstrap/scss/_mixins.scss";
          @import "~@forgerock/platform-components/src/scss/theme-variables.scss";
          @import "~bootstrap/scss/_variables.scss";
        `
      },
    },
  },
};
