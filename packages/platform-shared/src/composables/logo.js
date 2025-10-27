/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  computed,
} from 'vue';
import { getLocalizedString } from '@forgerock/platform-shared/src/utils/translations';
import useTheme from '@forgerock/platform-shared/src/composables/theme';
import i18n from '@/i18n';

export default function logo() {
  const { theme } = useTheme();
  const i18nArguments = [i18n.global.locale, i18n.global.fallbackLocale];

  function getHorizontalLogoSrc() {
    return getLocalizedString(theme.value.logoProfile, ...i18nArguments)
    // eslint-disable-next-line global-require
    || require('@forgerock/platform-shared/src/assets/images/horizontal-placeholder.svg');
  }

  function getSquareLogoSrc() {
    return getLocalizedString(theme.value.logoProfileCollapsed, ...i18nArguments)
    // eslint-disable-next-line global-require
    || require('@forgerock/platform-shared/src/assets/images/placeholder.svg');
  }

  const horizontalLogoAttrs = computed(() => ({
    src: getHorizontalLogoSrc(),
    alt: getLocalizedString(theme.value.logoProfileAltText, ...i18nArguments) || '',
    maxWidth: 300,
    loading: 'lazy',
  }));

  const squareLogoAttrs = computed(() => ({
    src: getSquareLogoSrc(),
    alt: getLocalizedString(theme.value.logoProfileCollapsedAltText, ...i18nArguments) || '',
    maxWidth: 200,
    loading: 'lazy',
  }));

  return {
    horizontalLogoAttrs,
    squareLogoAttrs,
  };
}
