/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as notification from '@forgerock/platform-shared/src/utils/notification';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import * as CatalogApi from '@forgerock/platform-shared/src/api/governance/CatalogApi';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { flushPromises } from '@vue/test-utils';
import {
  assignResourcesToIDM,
  assignResourcesToIGA,
  getEntitlements,
  getGovernanceGrants,
  getManagedResourceWithIGADetails,
  getResourceDisplayData,
  revokeResourcesFromIDM,
  revokeResourcesFromIGA,
} from './resource';
import * as CommonsApi from '@/api/governance/CommonsApi';

describe('getGovernanceGrants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('assigns resources as relationships to IDM-resource', async () => {
    jest.spyOn(ManagedResourceApi, 'patchManagedResource').mockReturnValue({ data: { errors: [] } });

    const response = await assignResourcesToIDM('parentResourceName', 'parentResourceId', ['resourceIds'], 'managedResourceRev');

    expect(response.status).toEqual('success');
  });

  it('Displays error if patchManagedResource fails', async () => {
    jest.spyOn(ManagedResourceApi, 'patchManagedResource').mockRejectedValue('test');
    const errorSpy = jest.spyOn(notification, 'showErrorMessage');

    await assignResourcesToIDM('parentResourceName', 'parentResourceId', ['resourceIds'], 'managedResourceRev');

    expect(errorSpy).toHaveBeenCalled();
  });

  it('assigns resources as relationships to IGA-resource, and returns success if errors are less than number of responses', async () => {
    jest.spyOn(AccessRequestApi, 'saveNewRequest').mockReturnValue({ data: { errors: [] } });
    const errorSpy = jest.spyOn(notification, 'showErrorMessage');

    const response = await assignResourcesToIGA('parentResourceId', ['resourceIds'], 'grantType');

    expect(response).toEqual('success');
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('assigns resources as relationships to IGA-resource, shows errors if returned, and returns error if all responses are errors', async () => {
    jest.spyOn(AccessRequestApi, 'saveNewRequest').mockReturnValue({ data: { errors: [{ message: 'errorMessage' }] } });
    const errorSpy = jest.spyOn(notification, 'showErrorMessage');

    const response = await assignResourcesToIGA('parentResourceId', ['resourceIds'], 'grantType');

    expect(response).toEqual('error');
    expect(errorSpy).toHaveBeenCalled();
  });

  it('Displays error if saveNewRequest fails', async () => {
    jest.spyOn(AccessRequestApi, 'saveNewRequest').mockRejectedValue('test');
    const errorSpy = jest.spyOn(notification, 'showErrorMessage');

    await assignResourcesToIGA('parentResourceId', ['resourceIds'], 'grantType');

    expect(errorSpy).toHaveBeenCalled();
  });

  it('Builds and sends request to get user-related entitlements', async () => {
    jest.spyOn(CatalogApi, 'searchCatalog').mockReturnValue({ data: { result: [{ id: 'testId', descriptor: { idx: { '/entitlement': { displayName: 'descriptorDisplayName' } } }, entitlement: { displayName: 'displayName' } }] } });

    const response = await getEntitlements(true);

    expect(response).toStrictEqual([{ value: 'testId', text: 'descriptorDisplayName' }]);
  });

  it('Displays error if API fails', async () => {
    jest.spyOn(CatalogApi, 'searchCatalog').mockRejectedValue('test');
    const errorSpy = jest.spyOn(notification, 'showErrorMessage');

    await getEntitlements(true);

    expect(errorSpy).toHaveBeenCalled();
  });

  it('Builds and sends request to get non-user-related entitlements', async () => {
    jest.spyOn(CommonsApi, 'searchGovernanceResource').mockReturnValue({ data: { result: [{ id: 'testId', descriptor: { idx: { '/entitlement': { displayName: 'descriptorDisplayName' } } }, entitlement: { displayName: 'displayName' } }] } });

    const response = await getEntitlements(false, 'searchValue', 'selectedApplication', 'managedResource/path');
    await flushPromises();

    expect(response).toStrictEqual([{ value: 'managedResource/path/testId', text: 'descriptorDisplayName' }]);
  });

  it('displays an error notifcation if API fails', async () => {
    jest.spyOn(CommonsApi, 'getUserGrants').mockRejectedValue('test');
    const errorSpy = jest.spyOn(notification, 'showErrorMessage');

    getGovernanceGrants('account', 'testId', {});
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
    const getManagedRelationshipList = jest.spyOn(ManagedResourceApi, 'getManagedRelationshipList').mockReturnValue({ data: { result: [{ _refResourceId: '_refResourceId' }] } });
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

  it('queries resource when no params are passed', async () => {
    const getManagedRelationshipList = jest.spyOn(ManagedResourceApi, 'getManagedRelationshipList').mockReturnValue({ data: { result: [{ _refResourceId: '_refResourceId' }] } });
    getManagedResourceWithIGADetails('alpha_role', '123', 'assignments', {
      queryString: '',
    });
    expect(getManagedRelationshipList).toBeCalledWith('alpha_role', '123', 'assignments', {
      fields: 'name',
      pageSize: 10,
      queryFilter: '(/type eq "__ENTITLEMENT__")',
      totalPagedResultsPolicy: 'ESTIMATE',
    });
  });

  it('revokes relationships to IDM-resource', async () => {
    jest.spyOn(ManagedResourceApi, 'patchManagedResource').mockReturnValue({ data: { errors: [] } });

    const response = await revokeResourcesFromIDM('parentResourceName', 'parentResourceId', ['resourceToRevoke'], 'managedResourceRev');

    expect(response.status).toEqual('resourcesRevoked');
  });

  it('Displays error in revokeResourcesFromIDM if patchManagedResource fails', async () => {
    jest.spyOn(ManagedResourceApi, 'patchManagedResource').mockRejectedValue('test');
    const errorSpy = jest.spyOn(notification, 'showErrorMessage');

    await revokeResourcesFromIDM('parentResourceName', 'parentResourceId', ['resourceToRevoke'], 'managedResourceRev');

    expect(errorSpy).toHaveBeenCalled();
  });

  describe('revoke actions', () => {
    const revokePayload = {
      expiryDate: '',
      justification: '',
      priority: 'low',
      itemsToRevoke: [{
        item: {
          type: 'blue',
        },
        catalog: {
          id: '234234234',
        },
      }],
    };
    it('revokes relationships to IGA-resource', async () => {
      jest.spyOn(AccessRequestApi, 'saveNewRequest').mockReturnValue({ data: { errors: [] } });

      const response = await revokeResourcesFromIGA(revokePayload, 'parentResourceId', 'adminAccess');

      expect(response.status).toEqual('requestsRevoked');
    });

    it('revokes relationships to IGA-resource, and returns error if any requests have error', async () => {
      jest.spyOn(AccessRequestApi, 'saveNewRequest').mockReturnValue({ data: { errors: [{ message: 'errorMessage' }] } });

      const response = await revokeResourcesFromIGA(revokePayload, 'parentResourceId', 'adminAccess');

      expect(response.status).toEqual('error');
    });

    it('Displays error in revokeResourcesFromIDM if patchManagedResource fails', async () => {
      jest.spyOn(ManagedResourceApi, 'patchManagedResource').mockRejectedValue('test');
      const errorSpy = jest.spyOn(notification, 'showErrorMessage');

      await revokeResourcesFromIGA(revokePayload, 'parentResourceId', 'adminAccess');

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('getResourceDisplayData', () => {
    it('should return the display name of a resource', async () => {
      ManagedResourceApi.getManagedResourceList = jest.fn().mockResolvedValue({
        data: {
          result: [
            {
              givenName: 'John',
              sn: 'Doe',
            },
          ],
        },
      });
      const resourceDisplayData = await getResourceDisplayData('user', 'user/123');
      expect(resourceDisplayData).toBe('John Doe');
    });

    it('should return the ID if the resource is not found', async () => {
      ManagedResourceApi.getManagedResourceList = jest.fn().mockResolvedValue({
        data: {
          result: [],
        },
      });
      const resourceDisplayData = await getResourceDisplayData('user', 'user/123');
      expect(resourceDisplayData).toBe('user/123');
    });

    it('should return the ID if the resource fetch fails', async () => {
      ManagedResourceApi.getManagedResourceList = jest.fn().mockRejectedValue();
      const resourceDisplayData = await getResourceDisplayData('user', 'user/123');
      expect(resourceDisplayData).toBe('user/123');
    });
  });
});
