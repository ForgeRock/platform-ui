/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

function getLocToPlaceAttribute(domNodeString) {
  const endTagCount = domNodeString.split('>').length - 1;
  const isSelfClosingElement = endTagCount === 1;

  let loc;
  if (isSelfClosingElement) {
    loc = domNodeString.length - 2;
  } else {
    loc = domNodeString.indexOf('>');
    if (loc === -1) throw new Error('Non valid html string detected. Please provide a string representing valid html.');
  }

  return loc;
}

/**
 * Appends attributes to a given dom node string
 * Does not handle duplicate attributes
 * @param {String} domNodeString the dom node that you want to add attributes to
 * @param {Map} attributesMap a map of attributes to add to the dom node
 * @returns a string with the attributes appended to the dom node
 */
function addAttributesToDomNodeString(domNodeString, attributesMap) {
  if (!domNodeString || !attributesMap) throw new Error('Please provide both parameters.');
  if (typeof domNodeString !== 'string') throw new Error('Incorrect parameter type. Please provide a String for `domNodeString`');
  if (!(attributesMap instanceof Map)) throw new Error('Incorrect parameter type. Please provide a Map for `attributesMap`');

  const endFirstTagLoc = getLocToPlaceAttribute(domNodeString);

  let attributes = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const [attr, val] of attributesMap) {
    if (typeof attr !== 'string') break;
    attributes += `${attr}="${val}" `;
  }

  const domNodeStringLength = domNodeString.length;
  return `${domNodeString.substring(0, endFirstTagLoc)} ${attributes.trim()}${domNodeString.substring(endFirstTagLoc, domNodeStringLength)}`;
}

export default addAttributesToDomNodeString;
