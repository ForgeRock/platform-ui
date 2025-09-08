/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import AddUserForm from './AddUserForm';
import i18n from '@/i18n';

mockValidation();

describe('AddUserForm', () => {
  let wrapper;

  function mountComponent() {
    return mount(AddUserForm, {
      global: {
        plugins: [i18n],
      },
    });
  }

  it('has fields for username, first name, last name, email', async () => {
    wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.findComponent('[label="Username"]').exists()).toBe(true);
    expect(wrapper.findComponent('[label="First Name"]').exists()).toBe(true);
    expect(wrapper.findComponent('[label="Last Name"]').exists()).toBe(true);
    expect(wrapper.findComponent('[label="Email Address"]').exists()).toBe(true);
  });

  it('changing the username emits event with the update value', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const usernameField = wrapper.findComponent('[label="Username"]');
    usernameField.vm.$emit('input', 'JohnDoe');
    await flushPromises();

    expect(wrapper.emitted('update:modelValue')[0]).toEqual([{
      userName: 'JohnDoe',
      givenName: '',
      sn: '',
      mail: '',
    }]);
  });

  it('changing the first name emits event with the update value', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const firstNameField = wrapper.findComponent('[label="First Name"]');
    firstNameField.vm.$emit('input', 'John');
    await flushPromises();

    expect(wrapper.emitted('update:modelValue')[0]).toEqual([{
      userName: '',
      givenName: 'John',
      sn: '',
      mail: '',
    }]);
  });
  it('changing the last name emits event with the update value', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const lastNameField = wrapper.findComponent('[label="Last Name"]');
    lastNameField.vm.$emit('input', 'Doe');
    await flushPromises();

    expect(wrapper.emitted('update:modelValue')[0]).toEqual([{
      userName: '',
      givenName: '',
      sn: 'Doe',
      mail: '',
    }]);
  });

  it('changing the email emits event with the update value', async () => {
    wrapper = mountComponent();
    await flushPromises();
    const emailField = wrapper.findComponent('[label="Email Address"]');
    emailField.vm.$emit('input', 'test@test.com');
    await flushPromises();

    expect(wrapper.emitted('update:modelValue')[0]).toEqual([{
      userName: '',
      givenName: '',
      sn: '',
      mail: 'test@test.com',
    }]);
  });
});
