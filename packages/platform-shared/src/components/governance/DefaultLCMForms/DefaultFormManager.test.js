/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import * as GlossaryApi from '@forgerock/platform-shared/src/api/governance/GlossaryApi';
import * as SchemaApi from '@forgerock/platform-shared/src/api/SchemaApi';
import * as PrivilegeApi from '@forgerock/platform-shared/src/api/PrivilegeApi';
import DefaultFormManager from './DefaultFormManager';
import i18n from '@/i18n';

ValidationRules.extendRules({
  required: ValidationRules.getRules(i18n).required,
  email: ValidationRules.getRules(i18n).email,
});

jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');
jest.mock('@forgerock/platform-shared/src/api/governance/GlossaryApi');
jest.mock('@forgerock/platform-shared/src/api/PrivilegeApi');
jest.mock('@forgerock/platform-shared/src/api/SchemaApi');

PrivilegeApi.getResourceTypePrivilege.mockImplementation(() => Promise.resolve({
  data: {
    VIEW: {
      allowed: true,
      properties: [
        'userName',
        'givenName',
        'sn',
        'mail',
      ],
    },
    UPDATE: {
      allowed: true,
      properties: [
        'userName',
        'givenName',
        'sn',
        'mail',
      ],
    },
  },
}));

SchemaApi.getSchema.mockImplementation(() => Promise.resolve({
  data: {
    order: [
      'userName',
      'givenName',
      'sn',
      'mail',
    ],
    properties: {
      userName: {
        title: 'Username',
        type: 'string',
        viewable: true,
      },
      givenName: {
        title: 'First Name',
        type: 'string',
        viewable: true,
      },
      sn: {
        title: 'Last Name',
        type: 'string',
        viewable: true,
      },
      mail: {
        title: 'Email Address',
        type: 'string',
        viewable: true,
      },
    },
  },
}));

GlossaryApi.getGlossaryAttributes.mockImplementation(() => Promise.resolve({
  data: {
    result: [
      {
        name: 'testGlossaryProperty',
        type: 'string',
        displayName: 'test glossary property',
      },
    ],
  },
}));
EntitlementApi.getEntitlementSchema.mockImplementation(() => Promise.resolve({
  data: {
    properties: {
      testObjectProperty: {
        type: 'string',
        order: 2,
        displayName: 'test object property',
      },
      testObjectProperty2: {
        type: 'string',
        order: 3,
        displayName: 'test object property2',
        flags: ['NOT_CREATABLE'],
      },
    },
  },
}));

describe('DefaultFormManager', () => {
  function setup(propsData = {}) {
    setupTestPinia(undefined, false);
    return mount(DefaultFormManager, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...propsData,
      },
    });
  }

  it('shows add user form when requestType is createUser', async () => {
    const wrapper = setup({ requestType: 'createUser' });
    await flushPromises();

    expect(wrapper.find('[label="Username"]').exists()).toBe(true);
    expect(wrapper.find('[label="First Name"]').exists()).toBe(true);
    expect(wrapper.find('[label="Last Name"]').exists()).toBe(true);
    expect(wrapper.find('[label="Email Address"]').exists()).toBe(true);
  });

  it('shows modify user form when requestType is modifyUser', async () => {
    const wrapper = setup({
      requestType: 'modifyUser',
      options: {
        userId: '123',
        userValues: {},
      },
    });
    await flushPromises();

    expect(wrapper.find('[label="Username"]').exists()).toBe(true);
  });

  it('shows entitlement form when requestType is modifyEntitlement', async () => {
    const wrapper = setup({
      requestType: 'modifyEntitlement',
      options: {
        applicationId: 'testAppId',
        objectType: 'testObjectType',
        entitlement: {},
      },
    });
    await flushPromises();

    expect(wrapper.find('[label="test glossary property"]').exists()).toBe(true);
    expect(wrapper.find('[label="test object property"]').exists()).toBe(true);
  });

  it('shows entitlement form when requestType is createEntitlement', async () => {
    const wrapper = setup({
      requestType: 'modifyEntitlement',
      options: {
        applicationId: 'testAppId',
        objectType: 'testObjectType',
        entitlement: {},
      },
    });
    await flushPromises();

    expect(wrapper.find('[label="test glossary property"]').exists()).toBe(true);
    expect(wrapper.find('[label="test object property"]').exists()).toBe(true);
  });
});
