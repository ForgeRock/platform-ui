/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable indent */
import { buildJwkSet } from './JWKUtils';

describe('JWKUtils', () => {
  describe('buildJwkSet', () => {
    describe('should throw error when jwkList is falsy', () => {
      it.each`
      name                    | invalidScope
      ${'given false'}        | ${false}
      ${'given zero'}         | ${0}
      ${'given empty string'} | ${''}
      ${'given null'}         | ${null}
      ${'given undefined'}    | ${undefined}
      ${'given NaN'}          | ${NaN}
      `('$name', ({ invalidScope }) => {
        expect(() => buildJwkSet(invalidScope)).toThrowError('Something went wrong. Please provide a valid list of json web keys.');
      });
    });

    it('should return jwk set', () => {
      const jwk = {
        e: 'stub-e',
        kty: 'stub-keytype',
        n: 'stub-n',
      };

      const builtSet = buildJwkSet([jwk]);

      expect(builtSet).toMatchObject({ keys: [{ e: 'stub-e', kty: 'stub-keytype', n: 'stub-n' }] });
    });
  });
});
