/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises } from '@vue/test-utils';
import useManagedUsers from './ManagedUsers';
import { mockAxios, testData, testUserResponseTransformed } from '../__mocks__/mocks';
import encodeQueryString from '../../../utils/encodeQueryString';

const realm = 'testRealm';

afterEach(() => {
  jest.clearAllMocks();
});

describe('@composable', () => {
  it('fetches the managed data and formats it for the multiselect component', async () => {
    mockAxios(jest.fn().mockResolvedValue(testData));

    // Setup the composable
    const { userOptionData, fetchManagedUsers } = useManagedUsers(realm);

    // Make the request
    fetchManagedUsers();
    await flushPromises();

    // Validate the response
    expect(userOptionData.value).toStrictEqual(testUserResponseTransformed);
  });

  it('fetches the managed data with new search params', async () => {
    const axiosCreate = mockAxios(jest.fn().mockResolvedValue(testData));

    let searchValue = 'reportadmin';

    // Setup the composable
    const { fetchManagedUsers } = useManagedUsers(realm);

    // Make the first request
    fetchManagedUsers(searchValue, realm);
    await flushPromises();

    // Check if correct query string value is called
    let queryString = encodeQueryString({ queryFilter: `givenName co '${searchValue}' or sn co '${searchValue}' or userName co '${searchValue}'`, _pageSize: 10 });
    expect(axiosCreate().get).toHaveBeenCalledWith(`managed/${realm}_user${queryString}`);

    // Make the second request
    searchValue = 'Dieter';
    fetchManagedUsers(searchValue, realm);
    await flushPromises();

    // Check if correct query string value is called
    queryString = encodeQueryString({ queryFilter: `givenName co '${searchValue}' or sn co '${searchValue}' or userName co '${searchValue}'`, _pageSize: 10 });
    expect(axiosCreate().get).toHaveBeenCalledWith(`managed/${realm}_user${queryString}`);
  });
});
