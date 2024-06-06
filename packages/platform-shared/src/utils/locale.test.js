/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import getDefaultLocale, { getAllLocales } from './locale';
import i18n from '@/i18n';

function setLanguageHeader(languages) {
  const navigator = { languages };

  Object.defineProperty(window, 'navigator', {
    value: navigator,
    writable: true,
  });
}

function setLocationQueryParameter(locale) {
  Object.defineProperty(window, 'location', {
    value: { search: locale ? `locale=${locale}` : '' },
    writable: true,
  });
}

describe('Getting prioritzed locales', () => {
  it('prioritizes locale with territory (es-CO) from header as primary with just the region (es) as the fallback', async () => {
    // Set the headers
    setLocationQueryParameter();
    setLanguageHeader(['es-CO']);

    // Get locales
    const { locales } = getAllLocales();
    expect(locales).toStrictEqual(['es-CO', 'es', 'en']);
  });

  it('prioritizes query string locale (de) var over header locale (en)', async () => {
    // Set the headers
    setLocationQueryParameter('de');
    setLanguageHeader(['en']);

    // Get locales
    const { locales } = getAllLocales(null, true);
    expect(locales).toStrictEqual(['de', 'en']);
  });

  it('prioritizes locales from header, and adds the region fallback for all locales that contain a territory (es-CO => es). The priority of English is also maintained', async () => {
    // Set the headers
    setLocationQueryParameter();
    setLanguageHeader(['fr', 'de', 'ru', 'en', 'es-CO']);

    // Get locales
    const { locales } = getAllLocales();
    expect(locales).toStrictEqual(['fr', 'de', 'ru', 'en', 'es-CO', 'es']);
  });

  it('uses the IDM-provided lang locale (en-GB) and adds a region-only fallback (en)', async () => {
    // Set the headers
    setLocationQueryParameter();
    setLanguageHeader();

    // Get locales
    const { locales } = getAllLocales({ lang: 'en-GB' });
    expect(locales).toStrictEqual(['en-GB', 'en']);
  });

  it('correctly prioritizes the primary locale\'s (en-GB) region-only fallback (en) to be the first priority', async () => {
    // Set the headers
    setLocationQueryParameter();
    setLanguageHeader(['en-GB', 'en-US', 'es-CO', 'es-AR']);

    // Get locales
    const { locales } = getAllLocales({ lang: 'en-GB' });
    expect(locales).toStrictEqual(['en-GB', 'en', 'en-US', 'es-CO', 'es', 'es-AR']);
  });

  it('correctly prioritizes the primary locale\'s (zu-ZA) region-only (za) fallback to be the first priority, and ensures that priority remains even when that locale is provided later as part of the header locale array (za)', async () => {
    // Set the headers
    setLocationQueryParameter('zu-ZA');
    setLanguageHeader(['ga-IE', 'ur', 'ml-IN', 'zu']);

    // Get locales
    const { locales } = getAllLocales({ lang: 'ast-ES' }, true);
    expect(locales).toStrictEqual(['zu-ZA', 'zu', 'ga-IE', 'ga', 'ur', 'ml-IN', 'ml', 'en']);
  });
});

describe('Getting default locale', () => {
  it('returns the primary locale when it matches an existing locale', async () => {
    // Primary
    i18n.global.locale = 'de';

    // Fallback
    i18n.global.fallbackLocale = 'ru';

    const defaultLocale = getDefaultLocale(['fr', 'de', 'en']);
    expect(defaultLocale).toBe(i18n.global.locale);
  });

  it('returns the fallback locale, as a string, when it matches an existing locale', async () => {
    // Primary
    i18n.global.locale = 'de';

    // Fallback
    i18n.global.fallbackLocale = 'ru';

    const defaultLocale = getDefaultLocale(['fr', 'ru', 'en']);
    expect(defaultLocale).toBe(i18n.global.fallbackLocale);
  });

  it('returns the first index when provided locales do not exist in i18n', async () => {
    // Primary
    i18n.global.locale = 'de';

    // Fallback
    i18n.global.fallbackLocale = ['es', 'zu', 'se'];

    const defaultLocale = getDefaultLocale(['pt', 'el', 'ig']);

    // zu has a higher fallback priority over se
    expect(defaultLocale).toBe('pt');
  });

  it('returns an empty string if empty array is provided', async () => {
    // Primary
    i18n.global.locale = 'de';

    // Fallback
    i18n.global.fallbackLocale = ['es', 'zu', 'se'];

    const defaultLocale = getDefaultLocale([]);

    // zu has a higher fallback priority over se
    expect(defaultLocale).toBe('');
  });
});
