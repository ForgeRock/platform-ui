/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Takes a url and decides if it is a FQDN or not.
 * If the url is not a FQDN then an FQDN is constructed
 * using url as a relative path of window.location.href.
 *
 * @param {string} url
 */
export default function getFQDN(url) {
  return new URL(url, window.location.href).href;
}
