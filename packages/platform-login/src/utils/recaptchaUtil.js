/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Assesses whether the passed node list contains elements created to display a google recaptcha v2 challenge
 * @param {NodeList} addedNodeList the new nodes viewed by a MutationObserver
 * @returns {Boolean} whether the new nodes are part of a google recaptcha v2 node
 */
function doNewNodesContainRecaptchaV2(addedNodeList) {
  try {
    if (addedNodeList.length !== 1) return false;
    const iframes = addedNodeList[0].querySelectorAll('iframe');
    if (iframes.length !== 1) return false;
    return iframes[0].src.includes('www.google.com/recaptcha');
  } catch {
    return false;
  }
}

export default doNewNodesContainRecaptchaV2;
