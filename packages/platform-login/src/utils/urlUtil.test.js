/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  parseParameters, createParamString,
} from './urlUtil';

describe('parseParameters', () => {
  const testCases = [
    ['Gives an empty object if no parameters', '', {}],
    ['Returns an object with pairs based on the queries', 'a=1&b=2', { a: '1', b: '2' }],
  ];
  it.each(testCases)('%s', (name, paramString, expectedValue) => {
    expect(parseParameters(paramString)).toStrictEqual(expectedValue);
  });
});

describe('createParamString', () => {
  const testCases = [
    ['Given empty urlParams, gives empty string', '', ''],
    ['Encodes parameters', 'scope=a thing', '&scope=a%20thing'],
    ['Joins passed parameters into a string', 'code=1&state=2', '&code=1&state=2'],
    ['Doesn\'t encode authIndexValue if authIndexType is service', 'authIndexType=service&authIndexValue=A Tree', '&authIndexType=service&authIndexValue=A Tree'],
  ];
  it.each(testCases)('%s', (name, inputParamString, expectedValue) => {
    expect(createParamString(new URLSearchParams(inputParamString))).toBe(expectedValue);
  });
});
