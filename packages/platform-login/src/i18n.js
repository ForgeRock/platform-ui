/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { merge } from 'lodash';
import dateTimeFormats from '@forgerock/platform-shared/src/dateTimeFormats.json';

Vue.use(VueI18n);

function loadLocaleMessages() {
  const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);
  // Can't use workspace symlink due to jest issues
  const sharedLocales = require.context('../../platform-shared/src/locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);
  const messages = {};

  locales.keys().forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      let generatedTranslation = locales(key);

      // Check for shared local and merge in if it exists
      const sharedLocaleExists = sharedLocales.keys().includes(key);
      if (sharedLocaleExists) {
        generatedTranslation = merge(sharedLocales(key), generatedTranslation);
      }

      messages[locale] = generatedTranslation;
    }
  });

  return messages;
}

Vue.mixin({
  methods: {
    translationExists(path) {
      return this.$t(path) !== path;
    },
  },
});

export default new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || 'en',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages(),
  silentTranslationWarn: true,
  dateTimeFormats,
});
