/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import createRealmPath from './createRealmPath';

it('constructs a realm url path', () => {
  const rootPath = createRealmPath('/');
  const subRealmPath = createRealmPath('/one');
  const nestedSubRealmPath = createRealmPath('/one/two');
  const removesTrailingSlash = createRealmPath('/trailing/');
  const singleWordNoSlashRealm = createRealmPath('noSlash');

  expect(rootPath).toEqual('');
  expect(subRealmPath).toEqual('realms/one');
  expect(nestedSubRealmPath).toEqual('realms/one/realms/two');
  expect(removesTrailingSlash).toEqual('realms/trailing');
  expect(singleWordNoSlashRealm).toEqual('realms/noSlash');
});

it('filters out any realm paths that include the word "realms"', () => {
  const realmsNestedPath = createRealmPath('/DEV/realms/MYREALM');
  expect(realmsNestedPath).toEqual('realms/DEV/realms/MYREALM');
});
