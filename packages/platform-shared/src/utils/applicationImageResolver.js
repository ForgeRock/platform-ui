/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Attempts to return the image at the provided path for
 * applications, returning the default image if not
 *
 * @param {string} url
 */
export default function resolveImage(image) {
  try {
    const images = require.context('@forgerock/platform-shared/src/assets/images/applications/', false, /\.svg$/);
    return images(`./${image}`);
  } catch (error) {
    // eslint-disable-next-line global-require
    return require('@forgerock/platform-shared/src/assets/images/applications/custom.svg');
  }
}
