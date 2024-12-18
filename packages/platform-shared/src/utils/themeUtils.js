/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep } from 'lodash';
import { convertBase64ToString, convertStringToBase64 } from '@forgerock/platform-shared/src/utils/encodeUtils';

/**
 * Base64 decode any script content in the passed theme
 * @param {Object} themeToDecode - details of theme
 * @returns {Object} the theme config with all scripts decoded from base64
 */
export function decodeThemeScripts(themeToDecode) {
  const decodedTheme = cloneDeep(themeToDecode);
  if (typeof decodedTheme.journeyFooterScriptTag === 'string' && decodedTheme.journeyFooterScriptTag !== '') {
    decodedTheme.journeyFooterScriptTag = convertBase64ToString(decodedTheme.journeyFooterScriptTag);
  }

  if (typeof decodedTheme.accountFooterScriptTag === 'string' && decodedTheme.accountFooterScriptTag !== '') {
    decodedTheme.accountFooterScriptTag = convertBase64ToString(decodedTheme.accountFooterScriptTag);
  }
  return decodedTheme;
}

/**
  * Base64 encode any script content in the passed themes to transmit over the API
  * @param {Object} themeToEncode - config metadata of themes
  * @returns {Object} the theme config with all scripts base64 encoded
  */
export function encodeThemeScripts(themeToEncode) {
  const encodedTheme = cloneDeep(themeToEncode);
  if (typeof encodedTheme.journeyFooterScriptTag === 'string' && encodedTheme.journeyFooterScriptTag !== '') {
    encodedTheme.journeyFooterScriptTag = convertStringToBase64(encodedTheme.journeyFooterScriptTag);
  }

  if (typeof encodedTheme.accountFooterScriptTag === 'string' && encodedTheme.accountFooterScriptTag !== '') {
    encodedTheme.accountFooterScriptTag = convertStringToBase64(encodedTheme.accountFooterScriptTag);
  }
  return encodedTheme;
}
