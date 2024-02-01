/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import doNewNodesContainRecaptchaV2 from './recaptchaUtil';

function createNodeListFromString(str) {
  const div = document.createElement('div');
  div.innerHTML = str;
  const childNodeList = div.childNodes;
  div.remove();
  return childNodeList;
}

describe('Checking if new nodes contain recaptcha v2', () => {
  const testCases = [
    { name: 'given a NodeList containing recaptcha v2 nodes', input: createNodeListFromString('<div><iframe src="www.google.com/recaptcha"></iframe></div>'), expected: true },
    { name: 'given a NodeList that does not contain recaptcha v2 nodes', input: createNodeListFromString('<div><span>Hello!</span></div>'), expected: false },
    { name: 'given an empty NodeList', input: createNodeListFromString(''), expected: false },
    { name: 'given a null NodeList', input: null, expected: false },
    { name: 'given an undefined NodeList', input: undefined, expected: false },
    { name: 'given an empty array NodeList', input: [], expected: false },
    { name: 'given an empty object NodeList', input: {}, expected: false },
    { name: 'given an empty string NodeList', input: '', expected: false },
    { name: 'given a number NodeList', input: 1, expected: false },
    { name: 'given a boolean NodeList', input: true, expected: false },
    { name: 'given a function NodeList', input: () => {}, expected: false },
    { name: 'given an object NodeList', input: { test: 'test' }, expected: false },
    { name: 'given an array NodeList', input: ['test'], expected: false },
    { name: 'given a string NodeList', input: 'test', expected: false },
  ];
  it.each(testCases)('$name should return $expected', ({ input, expected }) => {
    expect(doNewNodesContainRecaptchaV2(input)).toBe(expected);
  });
});
