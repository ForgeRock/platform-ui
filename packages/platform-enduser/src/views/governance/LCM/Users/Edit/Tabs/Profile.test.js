/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as SchemaApi from '@forgerock/platform-shared/src/api/SchemaApi';
import * as PrivilegeApi from '@forgerock/platform-shared/src/api/PrivilegeApi';
import * as PermissionsApi from '@forgerock/platform-shared/src/api/governance/PermissionsApi';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as RequestFormAssignmentsApi from '@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi';
import * as RequestFormsApi from '@forgerock/platform-shared/src/api/governance/RequestFormsApi';
import Profile from './Profile';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/PrivilegeApi');
jest.mock('@forgerock/platform-shared/src/api/SchemaApi');
jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');
jest.mock('@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/RequestFormsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/PermissionsApi');

PermissionsApi.getPermissionsForUser.mockImplementation(() => Promise.resolve({
  data: {
    result: [
      { permissions: { modifyUser: true } },
    ],
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
        title: 'User Name',
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

RequestFormAssignmentsApi.getFormAssignmentByLcmOperation.mockImplementation(() => Promise.resolve({ data: { result: [] } }));

describe('Profile', () => {
  let wrapper;
  function mountComponent() {
    setupTestPinia(undefined, false);
    return mount(Profile, {
      props: {
        user: {
          _id: '12345',
          userName: 'mikeTest',
          givenName: 'Mike',
          sn: 'Test',
          mail: 'test@test.com',
        },
      },
      global: {
        plugins: [i18n],
      },
    });
  }

  it('submits a request with an empty user object if no values have been changed', async () => {
    wrapper = mountComponent();
    await flushPromises();

    wrapper.find('[type="button"]').trigger('click');
    await flushPromises();
    expect(AccessRequestApi.submitCustomRequest).toHaveBeenCalledWith(
      'modifyUser',
      {
        common: {},
        custom: {},
        user: {
          userId: '12345',
          object: {},
        },
      },
    );
  });

  it('submits a request with only the changed values', async () => {
    wrapper = mountComponent();
    await flushPromises();

    await wrapper.findComponent('[id="User Name"]').vm.$emit('input', 'newUserName');
    await wrapper.find('[type="button"]').trigger('click');
    await flushPromises();
    expect(AccessRequestApi.submitCustomRequest).toHaveBeenCalledWith(
      'modifyUser',
      {
        common: {},
        custom: {},
        user: {
          userId: '12345',
          object: {
            userName: 'newUserName',
          },
        },
      },
    );
  });

  describe('custom form', () => {
    beforeEach(() => {
      RequestFormAssignmentsApi.getFormAssignmentByLcmOperation.mockImplementationOnce(() => Promise.resolve({
        data: {
          result: [{
            formId: '123',
            objectId: 'lcm/user/create',
          }],
        },
      }));

      RequestFormsApi.getRequestForm.mockImplementationOnce(() => Promise.resolve({
        data: {
          form: {
            fields: [{
              fields: [
                {
                  type: 'string',
                  label: 'Test Custom Form',
                  layout: {
                    rows: 1,
                    columns: 1,
                  },
                  model: 'user.userName',
                },
              ],
            }],
          },
        },
      }));
    });

    it('shows a custom form if available', async () => {
      wrapper = mountComponent();
      await flushPromises();

      expect(RequestFormAssignmentsApi.getFormAssignmentByLcmOperation).toHaveBeenCalledWith('user', 'update');
      expect(RequestFormsApi.getRequestForm).toHaveBeenCalledWith('123');
      expect(wrapper.find('[label="Test Custom Form (optional)"]').exists()).toBe(true);
    });

    it('submits payload from a custom form', async () => {
      wrapper = mountComponent();
      await flushPromises();

      wrapper.findComponent({ name: 'FormBuilder' }).vm.$emit('update:modelValue', {
        custom: { aCustomProp: 'test' },
        common: { aCommonProp: 'test' },
        user: { userName: 'test' },
      });
      await wrapper.find('[type="button"]').trigger('click');
      await flushPromises();

      expect(AccessRequestApi.submitCustomRequest).toHaveBeenCalledWith('modifyUser', {
        custom: { aCustomProp: 'test' },
        common: { aCommonProp: 'test' },
        user: { userId: '12345', object: { userName: 'test' } },
      });
    });
  });
});
