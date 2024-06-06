/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import pluralize from 'pluralize';
import i18n from '@/i18n';

/**
 * The pluralize library only supports english, so we should
 * only use it when the user is accessing the UI with that language
 */
function canUsePluralizeLib() {
  const isVuei18nLocaleEnBased = i18n?.global?.locale?.startsWith('en') || false;
  return isVuei18nLocaleEnBased;
}

export function pluralizeValue(value) {
  if (canUsePluralizeLib()) {
    return pluralize(value);
  }
  return value;
}

export function pluralizeSingular(value) {
  if (canUsePluralizeLib()) {
    return pluralize.singular(value);
  }
  return value;
}
