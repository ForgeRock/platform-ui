/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { convertBase64ToString, convertStringToBase64 } from './encodeUtils';

it('decodes base64 to string', () => {
  const decodedString = convertBase64ToString('PHN0eWxlPmgxIHsKICBjb2xvcjogYmx1ZTsKfTwvc3R5bGU+PGRpdiBjbGFzcz0iY29udGVudCI+PHA+TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdCwgc2VkIGRvIGVpdXNtb2QgdGVtcG9yIGluY2lkaWR1bnQgdXQgbGFib3JlIGV0IGRvbG9yZSBtYWduYSBhbGlxdWEuIFV0IGVuaW0gYWQgbWluaW0gdmVuaWFtLCBxdWlzIG5vc3RydWQgZXhlcmNpdGF0aW9uIHVsbGFtY28gbGFib3JpcyBuaXNpIHV0IGFsaXF1aXAgZXggZWEgY29tbW9kbyBjb25zZXF1YXQuIER1aXMgYXV0ZSBpcnVyZSBkb2xvciBpbiByZXByZWhlbmRlcml0IGluIHZvbHVwdGF0ZSB2ZWxpdCBlc3NlIGNpbGx1bSBkb2xvcmUgZXUgZnVnaWF0IG51bGxhIHBhcmlhdHVyLiBFeGNlcHRldXIgc2ludCBvY2NhZWNhdCBjdXBpZGF0YXQgbm9uIHByb2lkZW50LCBzdW50IGluIGN1bHBhIHF1aSBvZmZpY2lhIGRlc2VydW50IG1vbGxpdCBhbmltIGlkIGVzdCBsYWJvcnVtLjwvcD48aDEgaWQ9InRlc3QiPnRlc3Q8L2gxPjwvZGl2Pg==');

  expect(decodedString).toBe(`<style>h1 {
  color: blue;
}</style><div class="content"><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p><h1 id="test">test</h1></div>`);
});

it('leaves strings as string', () => {
  const decodedString = convertBase64ToString('string value');

  expect(decodedString).toBe('string value');
});

it('handles encoding special character', () => {
  const encodedString = convertStringToBase64('Hello 文');

  expect(encodedString).toBe('SGVsbG8g5paH');
});

it('handles decoding special character', () => {
  const decodedString = convertBase64ToString('SGVsbG8g5paH');

  expect(decodedString).toBe('Hello 文');
});

it('Handles long strings', () => {
  const longString = 'a'.repeat(200001);
  const encodedString = convertStringToBase64(longString);

  expect(convertBase64ToString(encodedString)).toBe(longString);
});

it('Returns the original string if there is an error decoding', () => {
  // Use a mock to simulate an error being thrown when decoding
  const atobSpy = jest.spyOn(global, 'atob').mockImplementation(() => {
    throw Error('Test error');
  });

  const decodedString = convertBase64ToString('test');

  expect(decodedString).toBe('test');

  // restore the original implementation
  atobSpy.mockRestore();
});
