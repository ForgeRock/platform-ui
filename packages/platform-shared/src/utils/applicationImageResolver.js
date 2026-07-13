/**
 * Copyright (c) 2022-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import store from '@/store';

/**
 * Returns the URL for an application template image.
 * When air-gapped, resolves against the local app-templates directory.
 * Otherwise returns the CDN URL.
 * @param {string} image filename of the image (e.g. 'salesforce.svg')
 */
export function resolveImage(image) {
  if (!store.state.SharedStore.isAirGapped) {
    return `https://cdn.forgerock.com/platform/app-templates/images/${image}`;
  }
  return `${process.env.BASE_URL}app-templates/images/${image}`;
}

/**
 * When an image fails to load, this function is called to provide a fallback image
 * @param {*} event onerror event from img element
 */
export function onImageError(event) {
  if (event.target) {
    event.target.onerror = null;
    // eslint-disable-next-line global-require
    event.target.src = require('@forgerock/platform-shared/src/assets/images/custom.svg');
  }
}
