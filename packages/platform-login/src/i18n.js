/**
 * Copyright (c) 2020-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createI18n } from 'vue-i18n';
import { merge } from 'lodash';
import dateTimeFormats from '@forgerock/platform-shared/src/dateTimeFormats.json';

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

export default createI18n({
  messages: loadLocaleMessages(),
  silentFallbackWarn: true,
  silentTranslationWarn: true,
  dateTimeFormats,
});
