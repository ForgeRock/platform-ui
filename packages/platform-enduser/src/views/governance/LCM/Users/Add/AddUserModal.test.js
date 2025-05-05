/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as RequestFormAssignmentsApi from '@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi';
import * as RequestFormsApi from '@forgerock/platform-shared/src/api/governance/RequestFormsApi';
import * as SchemaApi from '@forgerock/platform-shared/src/api/SchemaApi';
import AddUserModal from './AddUserModal';
import i18n from '@/i18n';

const rules = ValidationRules.getRules(i18n);
ValidationRules.extendRules(rules);

jest.mock('@forgerock/platform-shared/src/api/SchemaApi');
jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');
jest.mock('@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/RequestFormsApi');

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

describe('AddUserModal', () => {
  let wrapper;

  AccessRequestApi.submitCustomRequest.mockImplementation(() => Promise.resolve({ data: { id: '123' } }));
  RequestFormAssignmentsApi.getFormAssignmentByLcmOperation.mockImplementation(() => Promise.resolve({ data: { result: [] } }));

  function mountComponent() {
    setupTestPinia(undefined, false);
    return mount(AddUserModal, {
      global: {
        plugins: [i18n],
        mocks: {
          $router: { push: jest.fn() },
        },
      },
      props: {
        isTesting: true,
      },
    });
  }

  it('can add user details and move to next step', async () => {
    wrapper = mountComponent();
    wrapper.vm.initializeModal();
    await flushPromises();

    const nextButton = wrapper.findComponent('[aria-label="Submit"]');
    expect(nextButton.exists()).toBe(true);
    expect(nextButton.attributes('class')).toMatch('disabled');
    expect(wrapper.vm.step).toBe(0);

    wrapper.findComponent('[label="Username"]').vm.$emit('input', 'John');
    wrapper.findComponent('[label="First Name"]').vm.$emit('input', 'John');
    wrapper.findComponent('[label="Last Name"]').vm.$emit('input', 'John');
    wrapper.findComponent('[label="Email Address"]').vm.$emit('input', 'test@test.com');
    await flushPromises();

    expect(nextButton.attributes('class')).not.toMatch('disabled');
    nextButton.trigger('click');
    await flushPromises();
    expect(wrapper.vm.step).toBe(1);
  });

  it('second step has link to access request', async () => {
    wrapper = mountComponent();
    wrapper.vm.initializeModal();
    const routerPushSpy = jest.spyOn(wrapper.vm.$router, 'push');
    wrapper.vm.step = 1;
    wrapper.vm.requestId = '123';
    await flushPromises();

    const viewLink = wrapper.find('button.btn-outline-primary');
    expect(viewLink.text()).toBe('View Request');
    viewLink.trigger('click');

    expect(routerPushSpy).toHaveBeenCalledWith({
      name: 'MyRequestDetails',
      params: { requestId: '123' },
    });
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
      wrapper.vm.initializeModal();
      await flushPromises();

      expect(RequestFormAssignmentsApi.getFormAssignmentByLcmOperation).toHaveBeenCalledWith('user', 'create');
      expect(RequestFormsApi.getRequestForm).toHaveBeenCalledWith('123');
      expect(wrapper.find('[label="Test Custom Form (optional)"]').exists()).toBe(true);
    });

    it('submits payload from a custom form', async () => {
      wrapper = mountComponent();
      wrapper.vm.initializeModal();
      await flushPromises();

      wrapper.findComponent({ name: 'FormBuilder' }).vm.$emit('update:modelValue', {
        custom: { aCustomProp: 'test' },
        common: { aCommonProp: 'test' },
        user: { userName: 'test' },
      });
      const nextButton = wrapper.findComponent('[aria-label="Submit"]');
      nextButton.trigger('click');
      await flushPromises();

      expect(AccessRequestApi.submitCustomRequest).toHaveBeenCalledWith('createUser', {
        custom: { aCustomProp: 'test' },
        common: { aCommonProp: 'test' },
        user: { object: { userName: 'test' } },
      });
    });
  });
});
