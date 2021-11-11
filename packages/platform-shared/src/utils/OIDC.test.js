/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import parseSub from './OIDC';

it('pulls sub value out of claims.sub', () => {
  const oldClaimsFormatUser = { sub: '1234userIdNumber' };
  const oldClaimsFormatAdmin = { sub: 'amadmin' };
  const newClaimsFormatUser = { sub: '(usr!1234userIdNumber)' };
  const newClaimsFormatAdmin = { sub: '(usr!amadmin)' };

  expect(parseSub(oldClaimsFormatUser)).toEqual('1234userIdNumber');
  expect(parseSub(oldClaimsFormatAdmin)).toEqual('amadmin');
  expect(parseSub(newClaimsFormatUser)).toEqual('1234userIdNumber');
  expect(parseSub(newClaimsFormatAdmin)).toEqual('amadmin');
});
