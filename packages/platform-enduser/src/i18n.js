/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { merge } from 'lodash';

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
      const generatedTranslation = locales(key);

      // Check for shared local and merge in if it exists
      const sharedLocaleExists = sharedLocales.keys().includes(key);
      if (sharedLocaleExists) {
        merge(generatedTranslation, sharedLocales(key));
      }

      messages[locale] = generatedTranslation;
    }
  });

  return messages;
}

export default new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || 'en',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages(),
  silentTranslationWarn: true,
});
