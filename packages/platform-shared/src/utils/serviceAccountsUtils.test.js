/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable indent */
import buildScopes from './serviceAccountUtils';

describe('serviceAccountUtils', () => {
  describe('given valid scopes', () => {
    it.each`
    name             | validScope                 | expected
    ${'given false'} | ${['fr:autoaccess:read']}  | ${['fr:idm*', 'fr:am*', 'fr:autoaccess:read']}
    ${'given false'} | ${['fr:autoaccess:write']} | ${['fr:idm*', 'fr:am*', 'fr:autoaccess:write']}
    ${'given false'} | ${['fr:user:read']}        | ${['fr:idm*', 'fr:am*', 'fr:user:read']}
    `('$name', ({ validScope, expected }) => {
      const combinedScopes = buildScopes(validScope);
      expect(combinedScopes).toEqual(expected);
    });
  });

  describe('given invalid scopes', () => {
    describe('should throw error', () => {
      it.each`
      name                    | invalidScope
      ${'given false'}        | ${false}
      ${'given zero'}         | ${0}
      ${'given empty string'} | ${''}
      ${'given null'}         | ${null}
      ${'given undefined'}    | ${undefined}
      ${'given NaN'}          | ${NaN}
      `('$name', ({ invalidScope }) => {
        expect(() => buildScopes(invalidScope)).toThrowError('Something went wrong. No scopes found');
      });
    });
  });
});
