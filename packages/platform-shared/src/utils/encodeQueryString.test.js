/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import encodeQueryString from './encodeQueryString';

it('encodes flat object correctly', () => {
  const queryString = encodeQueryString({
    _sortKeys: 'userName',
    _pageSize: 10,
    _fields: 'userName,givenName,sn',
    _queryFilter: '/userName sw "d" or /givenName sw "d" or /sn sw "d"',
  });

  expect(queryString).toBe('_sortKeys=userName&_pageSize=10&_fields=userName%2CgivenName%2Csn&_queryFilter=%2FuserName%20sw%20%22d%22%20or%20%2FgivenName%20sw%20%22d%22%20or%20%2Fsn%20sw%20%22d%22');
});
