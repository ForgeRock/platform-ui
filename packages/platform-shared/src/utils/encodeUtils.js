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

/**
 * Function to convert a Base64 value to a string. Any special characters are expected to have been previously encoded to UTF-8
 * and are decoded as such.
 * See {@link convertStringToBase64} for more information
 * @example
 * // returns 'Hello 文'
 * convertBase64ToString('SGVsbG8g5paH')
 * @returns {string} the string representation of the Base64 value, expecting any special characters to have previously been UTF-8 encoded.
 */
export function convertBase64ToString(valueToConvert) {
  try {
    if (base64regex.test(valueToConvert)) {
      const binaryString = atob(valueToConvert);
      const encodedValue = Uint8Array.from(binaryString, (m) => m.codePointAt(0));
      return new TextDecoder().decode(encodedValue);
    }
    return valueToConvert;
  } catch {
    return valueToConvert;
  }
}

/**
 * A length safe wrapper for the String.fromCodePoint function. This function will handle strings that are too long for the
 * fromCodePoint function to handle. The function will split the string into smaller chunks and then concatenate them back
 * together.
 * @param {Array} codePointArray the array of code points to convert to a string
 * @returns {string} the string representation of the code points
 */
export function lengthSafeStringFromCodePoint(codePointArray) {
  const safeSize = 50000;
  if (codePointArray.length < safeSize) {
    return String.fromCodePoint(...codePointArray);
  }
  const chunkedArray = [];
  for (let i = 0; i < codePointArray.length; i += safeSize) {
    chunkedArray.push(codePointArray.slice(i, i + safeSize));
  }
  return chunkedArray
    .map((chunk) => String.fromCodePoint(...chunk))
    .join('');
}

/**
 * Function to convert a string value to a Base64 value. Base64 is a binary encoding and so the atob and btoa functions will
 * not natively handle special characters whose binary representations are > 1 byte. In order to handle this use-case
 * we convert the special characters to their UTF-8 representations and then encode that to Base64.
 * Use {@link convertBase64ToString} for decoding.
 * @example
 * // returns 'SGVsbG8g5paH'
 * convertBase64ToString('Hello 文')
 * @returns {string} Returns a Base64 encoded value of a string with any special characters represented by UTF-8.
 */
export function convertStringToBase64(valueToConvert) {
  const textEncodedValue = new TextEncoder().encode(valueToConvert);
  const stringContent = lengthSafeStringFromCodePoint(textEncodedValue);
  return btoa(stringContent);
}
