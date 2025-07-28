/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import i18n from '@/i18n';
import ObjectSelect from './GovObjectSelect';

describe('ObjectSelect', () => {
  function mountComponent(props) {
    return mount(ObjectSelect, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...props,
      },
    });
  }

  describe('user', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.mock('@forgerock/platform-shared/src/api/ManagedResourceApi');
      ManagedResourceApi.getManagedResourceList.mockResolvedValue({
        data: {
          result: [
            {
              givenName: 'test1',
              sn: 'user1',
              _id: 'userId1',
            },
            {
              givenName: 'test2',
              sn: 'user2',
              _id: 'userId2',
            },
          ],
        },
      });
    });

    afterEach(() => {
    });

    const property = {
      options: {
        object: 'user',
      },
      value: '',
    };

    const userApiSpy = jest.spyOn(ManagedResourceApi, 'getManagedResourceList');

    it('calls to get list of users', async () => {
      mountComponent({ property });
      await flushPromises();

      expect(userApiSpy).toHaveBeenCalledWith('alpha_user', { fields: 'givenName,sn,userName', pageSize: 10, queryFilter: true });
    });

    it('has the returned users as options', async () => {
      const wrapper = mountComponent({ property });
      await flushPromises();

      expect(wrapper.findAll('[role="option"]')[0].text()).toBe('test1 user1 ()');
      expect(wrapper.findAll('[role="option"]')[1].text()).toBe('test2 user2 ()');
    });

    it('calls to get a user when an initial value is provided', async () => {
      mountComponent({ property: { ...property, value: 'userId1' } });
      await flushPromises();

      expect(userApiSpy).toHaveBeenCalledWith('alpha_user', { fields: 'givenName,sn,userName', pageSize: 10, queryFilter: '_id eq "userId1"' });
    });

    it('uses a custom queryFilter when provided', async () => {
      const propertyWithQueryFilter = {
        options: {
          object: 'user',
          queryFilter: '/mail co "test"',
        },
        value: '',
      };
      mountComponent({ property: propertyWithQueryFilter });
      await flushPromises();

      expect(userApiSpy).toHaveBeenCalledWith('alpha_user', { fields: 'givenName,sn,userName', pageSize: 10, queryFilter: '/mail co "test"' });
    });
  });

  describe('role', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.mock('@forgerock/platform-shared/src/api/ManagedResourceApi');
      ManagedResourceApi.getManagedResourceList.mockResolvedValue({
        data: {
          result: [
            {
              name: 'test1',
              _id: 'roleId1',
            },
            {
              name: 'test2',
              _id: 'roleId2',
            },
          ],
        },
      });
    });

    const property = {
      options: {
        object: 'role',
      },
      value: '',
    };

    const roleApiSpy = jest.spyOn(ManagedResourceApi, 'getManagedResourceList');

    it('calls to get list of roles', async () => {
      mountComponent({ property });
      await flushPromises();

      expect(roleApiSpy).toHaveBeenCalledWith('alpha_role', { fields: 'name', pageSize: 10, queryFilter: true });
    });

    it('has the returned roles as options', async () => {
      const wrapper = mountComponent({ property });
      await flushPromises();

      expect(wrapper.findAll('[role="option"]')[0].text()).toBe('test1');
      expect(wrapper.findAll('[role="option"]')[1].text()).toBe('test2');
    });

    it('calls to get a role when an initial value is provided', async () => {
      mountComponent({ property: { ...property, value: 'roleId1' } });
      await flushPromises();

      expect(roleApiSpy).toHaveBeenCalledWith('alpha_role', { fields: 'name', pageSize: 10, queryFilter: '_id eq "roleId1"' });
    });
  });

  describe('application', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');
      ApplicationsApi.getApplications.mockResolvedValue({
        data: {
          result: [
            {
              application: {
                name: 'test1',
                id: 'applicationId1',
              },
            },
            {
              application: {
                name: 'test2',
                id: 'applicationId2',
              },
            },
          ],
        },
      });
    });

    const property = {
      options: {
        object: 'application',
      },
      value: '',
    };

    const ApplicationsApiSpy = jest.spyOn(ApplicationsApi, 'getApplications');

    it('calls to get list of applications', async () => {
      mountComponent({ property });
      await flushPromises();

      expect(ApplicationsApiSpy).toHaveBeenCalledWith('application', {
        fields: 'application.id,application.name',
        pageSize: 10,
        queryFilter: true,
      });
    });

    it('has the returned applications as options', async () => {
      const wrapper = mountComponent({ property });
      await flushPromises();
      expect(wrapper.findAll('[role="option"]')[0].text()).toBe('test1');
      expect(wrapper.findAll('[role="option"]')[1].text()).toBe('test2');
    });

    it('calls to get an application when an initial value is provided', async () => {
      mountComponent({ property: { ...property, value: 'applicationId1' } });
      await flushPromises();

      expect(ApplicationsApiSpy).toHaveBeenCalledWith('application', {
        fields: 'application.id,application.name',
        pageSize: 10,
        queryFilter: 'application.id sw "applicationId1" or application.name sw "applicationId1"',
      });
    });
  });

  describe('entitlement', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');
      EntitlementApi.getEntitlementList.mockResolvedValue({
        data: {
          result: [
            {
              id: 'entitlementId1',
              entitlement: {
                __NAME__: 'test1',
                id: 'applicationId1',
              },
            },
            {
              id: 'entitlementId2',
              descriptor: {
                idx: {
                  '/entitlement': {
                    displayName: 'test2',
                    id: 'entitlement2',
                  },
                },
              },
            },
          ],
        },
      });
    });

    const property = {
      options: {
        object: 'entitlement',
      },
      value: '',
    };

    const entitlementsSpy = jest.spyOn(EntitlementApi, 'getEntitlementList');

    it('calls to get list of entitlements', async () => {
      mountComponent({ property });
      await flushPromises();

      expect(entitlementsSpy).toHaveBeenCalledWith('entitlement', {
        fields: 'id,descriptor.idx./entitlement.displayName,entitlement.__NAME__,application.name',
        pageSize: 10,
        queryFilter: true,
      });
    });

    it('has the returned entitlements as options', async () => {
      const wrapper = mountComponent({ property });
      await flushPromises();

      expect(wrapper.findAll('[role="option"]')[0].text()).toBe('test1');
      expect(wrapper.findAll('[role="option"]')[1].text()).toBe('test2');
    });

    it('calls to get an entitlement when an initial value is provided', async () => {
      mountComponent({ property: { ...property, value: 'entitlementId1' } });
      await flushPromises();

      expect(entitlementsSpy).toHaveBeenCalledWith('entitlement', {
        fields: 'id,descriptor.idx./entitlement.displayName,entitlement.__NAME__,application.name',
        pageSize: 10,
        queryFilter: 'id sw "entitlementId1" or descriptor.idx./entitlement.displayName sw "entitlementId1" or entitlement.__NAME__ sw "entitlementId1" or application.name sw "entitlementId1"',
      });
    });
  });

  describe('organization', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.mock('@forgerock/platform-shared/src/api/ManagedResourceApi');
      ManagedResourceApi.getManagedResourceList.mockResolvedValue({
        data: {
          result: [
            {
              name: 'test1',
              _id: 'organizationId1',
            },
            {
              name: 'test2',
              _id: 'organizationId2',
            },
          ],
        },
      });
    });

    const property = {
      options: {
        object: 'organization',
      },
      value: '',
    };

    const organizationApiSpy = jest.spyOn(ManagedResourceApi, 'getManagedResourceList');

    it('calls to get list of organizations', async () => {
      mountComponent({ property });
      await flushPromises();

      expect(organizationApiSpy).toHaveBeenCalledWith('alpha_organization', { fields: 'name', pageSize: 10, queryFilter: true });
    });

    it('has the returned organizations as options', async () => {
      const wrapper = mountComponent({ property });
      await flushPromises();

      expect(wrapper.findAll('[role="option"]')[0].text()).toBe('test1');
      expect(wrapper.findAll('[role="option"]')[1].text()).toBe('test2');
    });

    it('calls to get an organization when an initial value is provided', async () => {
      mountComponent({ property: { ...property, value: 'organizationId1' } });
      await flushPromises();

      expect(organizationApiSpy).toHaveBeenCalledWith('alpha_organization', { fields: 'name', pageSize: 10, queryFilter: '_id eq "organizationId1"' });
    });
  });
});
