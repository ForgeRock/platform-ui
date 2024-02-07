/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as notification from '@forgerock/platform-shared/src/utils/notification';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { flushPromises } from '@vue/test-utils';
import { getGovernanceGrants, getManagedResourceWithIGADetails } from './resource';
import * as CommonsApi from '@/api/governance/CommonsApi';

describe('getGovernanceGrants', () => {
  it('displays an error notifcation if API fails', async () => {
    jest.spyOn(CommonsApi, 'getUserGrants').mockRejectedValue('test');
    const errorSpy = jest.spyOn(notification, 'showErrorMessage');

    getGovernanceGrants();
    await flushPromises();

    expect(errorSpy).toHaveBeenCalled();
  });

  it('gets my access that match a query string', async () => {
    const getMyAccess = jest.spyOn(CommonsApi, 'getUserGrants').mockReturnValue([]);
    const params = {
      pageNumber: 0, pageSize: 10, sortBy: 'application.name', sortDir: 'asc', queryString: 'test',
    };
    getGovernanceGrants('account', 'testId', params);
    expect(getMyAccess).toBeCalledWith('testId', params);
  });

  it('gets my access based on page number', () => {
    const getMyAccess = jest.spyOn(CommonsApi, 'getUserGrants').mockReturnValue([]);
    const params = {
      pageNumber: 1, pageSize: 10, sortBy: 'application.name', sortDir: 'asc',
    };
    getGovernanceGrants('account', 'testId', params);
    expect(getMyAccess).toBeCalledWith('testId', params);
  });

  it('gets my access based on page size', async () => {
    const getMyAccess = jest.spyOn(CommonsApi, 'getUserGrants').mockReturnValue([]);
    const params = {
      pageNumber: 0, pageSize: 20, sortBy: 'application.name', sortDir: 'asc',
    };
    getGovernanceGrants('account', 'testId', params);
    expect(getMyAccess).toBeCalledWith('testId', params);
  });

  it('queries resource', async () => {
    const getManagedRelationshipList = jest.spyOn(ManagedResourceApi, 'getManagedRelationshipList').mockReturnValue({ data: { result: [] } });
    getManagedResourceWithIGADetails('alpha_role', '123', 'assignments', {
      queryString: 'test',
      sortBy: 'name',
      pagedResultsCookie: 'abc',
    });
    expect(getManagedRelationshipList).toBeCalledWith('alpha_role', '123', 'assignments', {
      fields: 'name',
      pagedResultsCookie: 'abc',
      pageSize: 10,
      queryFilter: 'name sw "test" and (/type eq "__ENTITLEMENT__")',
      sortKeys: 'name',
      totalPagedResultsPolicy: 'ESTIMATE',
    });
  });
});
