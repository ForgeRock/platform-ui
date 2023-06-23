/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import encodeQueryString from './encodeQueryString';

it('encodes flat object correctly', () => {
  const queryString = encodeQueryString({
    _sortKeys: 'userName',
    _pageSize: 10,
    _fields: 'userName,givenName,sn',
    _queryFilter: '/userName sw "d" or /givenName sw "d" or /sn sw "d"',
  });

  expect(queryString).toBe('?_sortKeys=userName&_pageSize=10&_fields=userName%2CgivenName%2Csn&_queryFilter=%2FuserName%20sw%20%22d%22%20or%20%2FgivenName%20sw%20%22d%22%20or%20%2Fsn%20sw%20%22d%22');
});

it('returns an empty string for no values passed in', () => {
  const queryString = encodeQueryString();
  expect(queryString).toBe('');
});

it('returns an empty string for empty object argument', () => {
  const queryString = encodeQueryString({});
  expect(queryString).toBe('');
});

it('adds leading underscores to query parameters', () => {
  const queryString = encodeQueryString({
    _sortKeys: 'userName',
    pageSize: 10,
  });

  expect(queryString).toBe('?_sortKeys=userName&_pageSize=10');
});

it('encodes flat object correctly when appendUnderscores=false', () => {
  const queryString = encodeQueryString({
    sortKeys: 'userName',
    pageSize: 10,
  }, false);

  expect(queryString).toBe('?sortKeys=userName&pageSize=10');
});
