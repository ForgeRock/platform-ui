/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import AddUserModal from './AddUserModal';
import i18n from '@/i18n';

const rules = ValidationRules.getRules(i18n);
ValidationRules.extendRules(rules);

jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');

describe('AddUserModal', () => {
  let wrapper;

  AccessRequestApi.submitCustomRequest.mockImplementation(() => Promise.resolve({ data: { id: '123' } }));

  function mountComponent() {
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
});
