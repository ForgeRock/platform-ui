/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * For accessibility reasons, this check removes focus from editor on esc
 * @param {String} code - The input code of the key pressed
 */
export default function blurOnEscape(code) {
  if (code === 'Escape') {
    document.activeElement.blur();
  }
}
