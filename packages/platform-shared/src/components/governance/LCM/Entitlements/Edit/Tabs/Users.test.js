/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import * as SchemaApi from '@forgerock/platform-shared/src/api/SchemaApi';
import RelationshipEdit from '@forgerock/platform-shared/src/components/resource/RelationshipEdit';
import Users from './Users';
import i18n from '@/i18n';

setupTestPinia();
const { modalShow } = mockModal();
jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');
jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');
jest.mock('@forgerock/platform-shared/src/api/ManagedResourceApi');
jest.mock('@forgerock/platform-shared/src/api/SchemaApi');

RelationshipEdit.mounted = jest.fn();

describe('Users', () => {
  let wrapper;

  AccessRequestApi.requestAction.mockImplementation(() => Promise.resolve({
    data: {},
  }));

  EntitlementApi.getEntitlementUsers.mockImplementation(() => Promise.resolve({
    data: {
      result: [
        {
          descriptor: {
            idx: {
              '/account': {
                displayName: 'accountName',
              },
            },
          },
          user: {
            id: 'testUserId',
            givenName: 'givenName',
            sn: 'sn',
            userName: 'userName',
          },
        },
        {
          descriptor: {
            idx: {
              '/account': {
                displayName: 'accountName2',
              },
            },
          },
          user: {
            id: 'testUserId2',
            givenName: 'givenName2',
            sn: 'sn2',
            userName: 'userName2',
          },
        },
      ],
      totalCount: 11,
    },
  }));

  SchemaApi.getSchema.mockImplementation(() => Promise.resolve({
    data: {
      properties: {
        members: {
          description: 'Role Members',
          items: {
            id: 'urn:jsonschema:org:forgerock:openidm:managed:api:Role:members:items',
            properties: {
              _ref: {
                description: 'References a relationship from a managed object',
                type: 'string',
              },
              _refProperties: {
                description: 'Supports metadata within the relationship',
                properties: {
                  _grantType: {
                    description: 'Grant Type',
                    label: 'Grant Type',
                    type: 'string',
                  },
                  _id: {
                    description: '_refProperties object ID',
                    type: 'string',
                  },
                },
                title: 'Role Members Items _refProperties',
                type: 'object',
              },
            },
            resourceCollection: [
              {
                conditionalAssociation: true,
                label: 'User',
                notify: true,
                path: 'managed/alpha_user',
                query: {
                  fields: [
                    'userName',
                    'givenName',
                    'sn',
                  ],
                  queryFilter: 'true',
                },
              },
            ],
            reversePropertyName: 'roles',
            reverseRelationship: true,
            title: 'Role Members Items',
            type: 'relationship',
            validate: true,
          },
          relationshipGrantTemporalConstraintsEnforced: true,
          returnByDefault: false,
          title: 'Role Members',
          type: 'array',
          viewable: true,
          propName: 'members',
        },
      },
    },
  }));

  ManagedResourceApi.getManagedResource.mockImplementation(() => Promise.resolve({
    data: {
      id: 'alpha_user',
      displayName: 'User',
    },
  }));

  function mountComponent() {
    return mount(Users, {
      global: {
        plugins: [i18n],
        mocks: {
          $store: {
            userId: 'testUserId',
            state: {
              SharedStore: {
                uiConfig: {},
              },
            },
          },
        },
      },
      props: {
        entitlementId: 'testEntitlement',
        isTesting: true,
      },
    });
  }

  it('calls to get entitlement users on mount', async () => {
    wrapper = mountComponent();
    await flushPromises();
    expect(EntitlementApi.getEntitlementUsers).toHaveBeenCalledWith(
      'testEntitlement',
      { pageSize: 10, pagedResultsOffset: 0, queryFilter: true },
    );
  });

  it('has name, account, and action columns', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const columns = wrapper.findAll('[role="columnheader"]');
    expect(columns.length).toBe(4);
    expect(columns[0].text()).toBe('Select');
    expect(columns[1].text()).toBe('Name');
    expect(columns[2].text()).toBe('Account');
    expect(columns[3].text()).toBe('');
  });

  it('shows users in the table', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const rows = wrapper.findAll('[role="row"]');
    expect(rows.length).toBe(3);
    expect(rows[1].text()).toMatch('givenName');
    expect(rows[1].text()).toMatch('sn');
    expect(rows[1].text()).toMatch('accountName');
    expect(rows[1].text()).toMatch('userName');

    expect(rows[2].text()).toMatch('givenName2');
    expect(rows[2].text()).toMatch('sn2');
    expect(rows[2].text()).toMatch('accountName2');
    expect(rows[2].text()).toMatch('userName2');
  });

  it('searches users', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const searchInput = wrapper.findComponent('.fr-search-input-holder');
    searchInput.vm.$emit('input', 'searchQuery');
    searchInput.vm.$emit('search');
    await flushPromises();

    expect(EntitlementApi.getEntitlementUsers).toHaveBeenCalledWith(
      'testEntitlement',
      {
        pageSize: 10,
        pagedResultsOffset: 0,
        queryFilter: 'user.givenName co "searchQuery" or user.sn co "searchQuery" or user.userName co "searchQuery" or descriptor.idx./account.displayName co "searchQuery"',
      },
    );
  });

  it('displays a button to add members', async () => {
    wrapper = mountComponent();
    await flushPromises();
    const addUsersBtn = wrapper.find('button.btn-primary');
    expect(addUsersBtn.exists()).toBe(true);
  });

  it('shows the modal to add members when the button is clicked', async () => {
    wrapper = mountComponent();
    await flushPromises();
    wrapper.find('button.btn-primary').trigger('click');
    await flushPromises();
    await wrapper.vm.$nextTick();
    const modal = wrapper.find('#addMembersToEntitlementModal');
    expect(modalShow).toHaveBeenCalledWith('addMembersToEntitlementModal');
    expect(modal.exists()).toBe(true);
  });

  it('shows the modal to remove members when the button is clicked', async () => {
    wrapper = mountComponent();
    await flushPromises();
    const modal = wrapper.find('#removeMembersModal');
    expect(modal.attributes('style')).toBe('display: none;');
    wrapper.vm.showRemoveModal({ user: { id: 'testUserId' } });
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(modal.attributes('style')).toContain('display: none');
  });
});
