/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as Glossary from '@forgerock/platform-shared/src/utils/governance/glossary';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { createAppContainer } from '@forgerock/platform-shared/src/utils/testHelpers';
import RoleDetailsTab from './DetailsTab';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/ManagedResourceApi');
jest.mock('@forgerock/platform-shared/src/api/governance/GlossaryApi');
ManagedResourceApi.getManagedResourceList.mockResolvedValue({
  data: {
    result: [],
  },
});
Glossary.getGlossarySchema = jest.fn().mockImplementation(() => Promise.resolve([
  {
    allowedValues: [],
    isIndexed: true,
    isMultiValue: false,
    managedObjectType: null,
    searchable: true,
    isInternal: true,
    displayName: 'Requestable',
    name: 'requestable',
    description: 'Can the role be requested',
    objectType: '/openidm/managed/role',
    type: 'boolean',
    id: 'testId001',
  },
  {
    id: 'testId002',
    displayName: 'Role Owner',
    name: 'roleOwner',
    description: 'Role Owner of Object',
    objectType: '/openidm/managed/role',
    type: 'managedObject',
    managedObjectType: '/openidm/managed/user',
    allowedValues: [],
    isIndexed: true,
    isMultiValue: false,
    searchable: true,
    isInternal: true,
    metadata: {
      modifiedDate: '2025-11-06T16:47:06.809946805Z',
      createdDate: '2025-11-06T16:47:06.809940423Z',
    },
  },
]));

describe('Role Details DetailsTab', () => {
  let wrapper;

  function mountComponent() {
    setupTestPinia();
    wrapper = mount(RoleDetailsTab, {
      global: {
        plugins: [createAppContainer(), setupTestPinia(), i18n],
      },
      props: {
        role: {
          role: {
            description: 'Test description',
            id: 'testRole001',
            name: 'Test Role',
            roleId: 'testRole001',
            justifications: [],
            entitlements: [],
          },
          glossary: {
            idx: {
              '/role': {
                requestable: true,
                roleOwner: 'managed/user/001',
              },
            },
          },
          permissions: {
            modifyRole: true,
            publishRole: true,
            deleteRole: true,
          },
        },
        items: {
          role: {
            description: 'Test description',
            id: 'testRole001',
            name: 'Test Role',
            roleId: 'testRole001',
            justifications: [],
            entitlements: [],
          },
          glossary: {
            requestable: true,
            roleOwner: 'managed/user/001',
          },
        },
        isLoading: false,
        readOnly: false,
        roleId: 'testRole001',
      },
    });
    return wrapper;
  }

  it('queries the role schema on mount', async () => {
    wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(Glossary.getGlossarySchema).toHaveBeenCalledWith('role');
  });

  it('displays the name and description text fields for the role', async () => {
    wrapper = mountComponent();
    await flushPromises();
    // await wrapper.vm.$nextTick();
    const roleName = wrapper.find('div#Name');
    const roleDescription = wrapper.find('div#Description');
    expect(roleName.exists()).toBe(true);
    expect(roleDescription.exists()).toBe(true);
    expect(roleName.attributes().value).toBe('Test Role');
    expect(roleDescription.attributes().value).toBe('Test description');
  });

  it('displays the glossary attributes section', async () => {
    wrapper = mountComponent();
    await flushPromises();
    // await wrapper.vm.$nextTick();
    const glossaryAttributesHeader = wrapper.find('h3');
    const requestableCheckbox = wrapper.find('input#checkbox-requestable');
    const roleOwnerField = wrapper.find('span.multiselect__single');
    expect(glossaryAttributesHeader.exists()).toBe(true);
    expect(glossaryAttributesHeader.text()).toBe('Glossary Attributes');
    expect(requestableCheckbox.exists()).toBe(true);
    expect(requestableCheckbox.element.checked).toBe(true);
    expect(roleOwnerField.exists()).toBe(true);
    expect(roleOwnerField.text()).toContain('001');
  });
});
