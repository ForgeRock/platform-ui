/**
 * Copyright (c) 2019-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createI18n } from 'vue-i18n';
import dateTimeFormats from './dateTimeFormats.json';

function loadLocaleMessages() {
  const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);
  const messages = {};

  locales.keys().forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales(key);
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
