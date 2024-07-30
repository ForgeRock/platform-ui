/**
 * Copyright (c) 2022-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import store from '@/store';

const IMAGES_SOURCE = 'https://cdn.forgerock.com/platform/app-templates/images/';

/**
 * Attempts to return the image at the provided path for
 * applications, returning the default image if not (if cdn enabled, just returns the cdn path)
 * @param {string} image
 */
export function resolveImage(image) {
  // if cdn flag on, use cdn directly
  if (store.state.SharedStore.loadAppTemplatesFromCDN) {
    return `${IMAGES_SOURCE}${image}`;
  }
  try {
    const images = require.context('@forgerock/platform-shared/src/assets/images/applications/', false, /\.svg$/);
    return images(`./${image}`);
  } catch (error) {
    // eslint-disable-next-line global-require
    return require('@forgerock/platform-shared/src/assets/images/applications/custom.svg');
  }
}

/**
 * When an image fails to load, this function is called to provide a fallback image
 * @param {*} event onerror event from img element
 */
export function onImageError(event) {
  event.target.onerror = null;
  // eslint-disable-next-line global-require
  event.target.src = require('@forgerock/platform-shared/src/assets/images/applications/custom.svg');
}
