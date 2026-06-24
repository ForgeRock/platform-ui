/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getTranslationOverrideByLocale } from '../api/UilocaleApi';

/**
 * Filters out inactive locales by checking _meta.status via the uilocale API.
 * English is always kept regardless of its status. Locale is treated as active,
 * if _meta doesn't exist or status is undefined.
 *
 * @param {String[]} locales array of locale codes to filter
 * @returns {Promise<String[]>} locales that are active
 */
export async function filterActiveLocales(locales) {
  return (await Promise.all(
    locales.map(async (locale) => {
      if (locale === 'en') return locale;
      try {
        const { data } = await getTranslationOverrideByLocale(locale, '_meta');

        // null means inactive — filter(Boolean) removes them
        return data?._meta?.status !== false ? locale : null;
      } catch {
        return locale;
      }
    }),
  )).filter(Boolean);
}
