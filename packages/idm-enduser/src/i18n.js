/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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
