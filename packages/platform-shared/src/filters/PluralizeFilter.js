/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import pluralize from 'pluralize';

export default function pluralizeValue(value) {
  if (process.env.VUE_APP_I18N_LOCALE === 'en') {
    return pluralize(value);
  }
  return value;
}

export function PluralizeSingular(value) {
  if (process.env.VUE_APP_I18N_LOCALE === 'en') {
    return pluralize.singular(value);
  }
  return value;
}
