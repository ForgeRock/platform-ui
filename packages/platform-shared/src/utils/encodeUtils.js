/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Regex value to determine if a value is base64 encoded
 */
export const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

export function convertBase64ToString(valueToConvert) {
  if (base64regex.test(valueToConvert)) {
    return atob(valueToConvert);
  }
  return valueToConvert;
}
