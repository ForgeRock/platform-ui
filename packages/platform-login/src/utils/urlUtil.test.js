/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable indent */
import {
  parseParameters, createParamString,
} from './urlUtil';

describe('parseParameters', () => {
  it.each`
    name                                                   | paramString  | expectedValue
    ${'Gives an empty object if no parameters'}            | ${''}        | ${{}}
    ${'Returns an object with pairs based on the queries'} | ${'a=1&b=2'} | ${{ a: '1', b: '2' }}
    `('$name', ({ paramString, expectedValue }) => {
      expect(parseParameters(paramString)).toStrictEqual(expectedValue);
  });
});

describe('createParamString', () => {
  it.each`
    name                                                            | inputParamString                                 | expectedValue
    ${'Given empty urlParams, gives empty string'}                  | ${''}                                            | ${''}
    ${'Encodes parameters'}                                         | ${'scope=a thing'}                               | ${'&scope=a%20thing'}
    ${'Joins passed parameters into a string'}                      | ${'code=1&state=2'}                              | ${'&code=1&state=2'}
    ${'Doesn\'t encode authIndexValue if authIndexType is service'} | ${'authIndexType=service&authIndexValue=A Tree'} | ${'&authIndexType=service&authIndexValue=A Tree'}
    `('$name', ({ inputParamString, expectedValue }) => {
      expect(createParamString(new URLSearchParams(inputParamString))).toBe(expectedValue);
    });
});
