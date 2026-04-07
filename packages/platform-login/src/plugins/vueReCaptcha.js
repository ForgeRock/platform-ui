/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { VueReCaptcha } from 'vue-recaptcha-v3';

/**
 * Vue plugin to integrate with 'vue-recaptcha-v3' ([GitHub](https://github.com/AurityLab/vue-recaptcha-v3)).
 * This plugin allows for loading VueReCaptcha on demand inside nested components.
 *
 * @module VueReCaptchaPlugin
 */
export default {
  /**
   * Installs the plugin into the Vue application.
   *
   * @function
   * @name install
   * @memberof VueReCaptchaPlugin
   *
   * @param {object} app - The Vue application instance.
   * @param {object} options - The options for the VueReCaptcha plugin.
   */
  install(app, options) {
    /**
     * Loads and initializes the VueReCaptcha with a given site key and options.
     *
     * @function
     * @name $loadVueRecaptcha
     * @memberof VueReCaptchaPlugin
     *
     * @param {string} siteKey - The site key for the reCaptcha service.
     * @param {string} locale - The locale code used to set the reCaptcha language.
     */
    app.config.globalProperties.$loadVueRecaptcha = (siteKey, locale) => {
      const currentLocale = typeof locale === 'string' && locale.length > 0 ? locale : 'en';
      const loaderOptions = options?.loaderOptions;

      if (currentLocale && loaderOptions && typeof loaderOptions === 'object') {
        loaderOptions.renderParameters ??= {};
        loaderOptions.renderParameters.hl = currentLocale; // set the locale when loading the reCaptcha script
      }
      app.use(VueReCaptcha, { ...options, siteKey });
    };
  },
};
