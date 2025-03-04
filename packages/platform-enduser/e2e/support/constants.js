/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { enTranslations, frTranslations, jaTranslations } from '../fixtures/enduser-locales-translations';

/**
 * Locales
 */
const LOCALES = {
  fr: { name: 'french', code: 'fr', translations: frTranslations },
  en: { name: 'english', code: 'en', translations: enTranslations },
  ja: { name: 'japanese', code: 'ja', translations: jaTranslations },
};

export default LOCALES;
