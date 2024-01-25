/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { convertBase64ToString } from '@forgerock/platform-shared/src/utils/encodeUtils';

/**
* Creates a list of script nodes from the given base64 encoded html string.
*/
export default function createScriptTags(encodedScriptStr) {
  const scriptTags = [];
  if (!encodedScriptStr || typeof encodedScriptStr !== 'string') return scriptTags;

  const scriptStr = convertBase64ToString(encodedScriptStr);

  const parser = new DOMParser();
  const dom = parser.parseFromString(scriptStr, 'text/html');

  let nodes = Array.from(dom.head.children);
  if (!nodes.length) {
    // Note: if there are no script tags in the head we check if the script tags have been added to the body
    nodes = Array.from(dom.body.children);
  }

  if (!nodes || !nodes.length) return scriptTags;

  nodes.forEach((userScript) => {
    const isScriptNode = userScript.nodeName === 'SCRIPT';
    if (!isScriptNode) return; // Note: other types of nodes/nesting not currently supported

    const script = document.createElement('script');
    // Note: add all the attributes
    Array.from(userScript.attributes).forEach(({ name, value }) => {
      script.setAttribute(name, value);
    });

    // Note: if there is code within the script tag we add that
    if (userScript.textContent) {
      script.innerHTML = userScript.textContent;
    }
    scriptTags.push(script);
  });

  return scriptTags;
}
