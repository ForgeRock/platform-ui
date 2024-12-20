/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import ItemDetailsStep from './ItemDetailsStep';
import i18n from '@/i18n';

describe('ItemDetailsStep', () => {
  let wrapper;

  const propsData = {
    glossarySchema: [
      {
        displayName: 'Role Owner',
        id: 'test-id-1',
        name: 'roleOwner',
      },
      {
        displayName: 'Risk Level',
        id: 'test-id-2',
        name: 'riskLevel',
      },
    ],
    item: {
      description: 'This is a static role.',
      id: 'role-id',
      name: 'Role-Static',
      requested: false,
      glossary: {
        requestable: true,
        riskLevel: 'medium',
        roleOwner: 'managed/user/user-id',
      },
    },
  };

  function setup(props) {
    return mount(ItemDetailsStep, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...propsData,
        ...props,
      },
    });
  }

  it('renders item details correctly', async () => {
    wrapper = setup();
    await flushPromises();

    // Assert glossary fields
    const { glossarySchema, item } = propsData;

    expect(findByTestId(wrapper, `glossary-title-${glossarySchema[0].name}`).text()).toBe(glossarySchema[0].displayName);
    expect(findByTestId(wrapper, `glossary-title-${glossarySchema[1].name}`).text()).toBe(glossarySchema[1].displayName);
    expect(findByTestId(wrapper, `glossary-item-${glossarySchema[0].name}`).text()).toBe(item.glossary[glossarySchema[0].name]);
    expect(findByTestId(wrapper, `glossary-item-${glossarySchema[1].name}`).text()).toBe(item.glossary[glossarySchema[1].name]);
  });

  describe('glossary managed objects', () => {
    ManagedResourceApi.getManagedResourceList = jest.fn().mockImplementation((resource, queryParams) => {
      const result = resource === 'alpha_user'
        ? { givenName: `resolved-${resource.split('_').pop()}-${queryParams.queryFilter.match(/"(.*?)"/)[1]}` }
        : { name: `resolved-${resource.split('_').pop()}-${queryParams.queryFilter.match(/"(.*?)"/)[1]}` };
      return Promise.resolve({ data: { result: [result] } });
    });

    it('displays blank values for glossary items with no value', async () => {
      const props = {
        item: {
          ...propsData.item,
          glossary: { roleOwner: '' },
        },
      };
      wrapper = setup(props);
      await flushPromises();

      const { glossarySchema } = propsData;
      expect(findByTestId(wrapper, `glossary-item-${glossarySchema[0].name}`).text()).toBe('--');
    });

    it('displays user name for managed users', async () => {
      const props = {
        item: {
          ...propsData.item,
          glossary: {
            singleUser: 'managed/user/id1',
          },
        },
        glossarySchema: [
          {
            displayName: 'Single User',
            name: 'singleUser',
            type: 'managedObject',
            managedObjectType: 'openidm/managed/user',
          },
        ],
      };
      wrapper = setup(props);
      await flushPromises();

      expect(findByTestId(wrapper, 'glossary-item-singleUser').text()).toBe('resolved-user-id1');
    });

    it('displays user names for multiple managed users', async () => {
      const props = {
        item: {
          ...propsData.item,
          glossary: {
            multipleUsers: [
              'managed/user/id1',
              'managed/user/id2',
              'managed/user/id3',
            ],
          },
        },
        glossarySchema: [
          {
            displayName: 'Multiple Users',
            name: 'multipleUsers',
            type: 'managedObject',
            managedObjectType: 'openidm/managed/user',
            isMultiValue: true,
          },
        ],
      };
      wrapper = setup(props);
      await flushPromises();

      expect(findByTestId(wrapper, 'glossary-item-multipleUsers').text()).toBe('resolved-user-id1 , resolved-user-id2 , resolved-user-id3');
    });

    it('displays role name for managed roles', async () => {
      const props = {
        item: {
          ...propsData.item,
          glossary: {
            singleRole: 'managed/user/role1',
          },
        },
        glossarySchema: [
          {
            displayName: 'Single Role',
            name: 'singleRole',
            type: 'managedObject',
            managedObjectType: 'openidm/managed/role',
          },
        ],
      };
      wrapper = setup(props);
      await flushPromises();

      expect(findByTestId(wrapper, 'glossary-item-singleRole').text()).toBe('resolved-role-role1');
    });

    it('displays role names for multiple managed roles', async () => {
      const props = {
        item: {
          ...propsData.item,
          glossary: {
            multipleRoles: [
              'managed/user/role1',
              'managed/user/role2',
              'managed/user/role3',
            ],
          },
        },
        glossarySchema: [
          {
            displayName: 'Multiple Roles',
            name: 'multipleRoles',
            type: 'managedObject',
            managedObjectType: 'openidm/managed/role',
            isMultiValue: true,
          },
        ],
      };
      wrapper = setup(props);
      await flushPromises();

      expect(findByTestId(wrapper, 'glossary-item-multipleRoles').text()).toBe('resolved-role-role1, resolved-role-role2, resolved-role-role3');
    });

    it('displays org name for managed orgs', async () => {
      const props = {
        item: {
          ...propsData.item,
          glossary: {
            singleOrg: 'managed/user/org1',
          },
        },
        glossarySchema: [
          {
            displayName: 'Single Org',
            name: 'singleOrg',
            type: 'managedObject',
            managedObjectType: 'openidm/managed/organization',
          },
        ],
      };
      wrapper = setup(props);
      await flushPromises();

      expect(findByTestId(wrapper, 'glossary-item-singleOrg').text()).toBe('resolved-organization-org1');
    });

    it('displays org names for multiple managed orgs', async () => {
      const props = {
        item: {
          ...propsData.item,
          glossary: {
            multipleOrgs: [
              'managed/user/org1',
              'managed/user/org2',
              'managed/user/org3',
            ],
          },
        },
        glossarySchema: [
          {
            displayName: 'Multiple Users',
            name: 'multipleOrgs',
            type: 'managedObject',
            managedObjectType: 'openidm/managed/organization',
            isMultiValue: true,
          },
        ],
      };
      wrapper = setup(props);
      await flushPromises();

      expect(findByTestId(wrapper, 'glossary-item-multipleOrgs').text()).toBe('resolved-organization-org1, resolved-organization-org2, resolved-organization-org3');
    });
  });
});
