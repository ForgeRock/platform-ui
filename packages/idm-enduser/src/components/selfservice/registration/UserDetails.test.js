/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import RegistrationMock from './mocks/RegistrationMock';
import UserDetails from './UserDetails';
import i18n from '@/i18n';

mockValidation();

describe('UserList', () => {
  let wrapper;
  function mountComponent(propsData = {}) {
    return mount(UserDetails, {
      props: {
        selfServiceDetails: RegistrationMock,
        inline: true,
        ...propsData,
      },
      global: {
        plugins: [i18n],
        stubs: ['PolicyPasswordInput'],
        mocks: {
          $store: {
            state: {},
          },
        },
      },
    });
  }

  it('shows fields based on schema from self service details', async () => {
    wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find('[label="Username"]').exists()).toBe(true);
    expect(wrapper.find('[label="First Name"]').exists()).toBe(true);
    expect(wrapper.find('[label="Last Name"]').exists()).toBe(true);
    expect(wrapper.find('[label="Email Address"]').exists()).toBe(true);
  });

  it('adds validation to fields based on the self service definition', async () => {
    wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find('[label="Username"]').attributes('validation')).toBe('required');
    expect(wrapper.find('[label="First Name"]').attributes('validation')).toBe('required');
    expect(wrapper.find('[label="Last Name"]').attributes('validation')).toBe('');
    expect(wrapper.find('[label="Email Address"]').attributes('validation')).toBe('required|email');
  });

  it('shows checkboxes for user preferences', async () => {
    wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find('[label="Send me news and updates"]').exists()).toBe(true);
    expect(wrapper.find('[label="Send me special offers and services"]').exists()).toBe(true);
  });

  it('emits an event when the userDetails are updated', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const userNameField = wrapper.findComponent('[label="Username"]');
    await userNameField.vm.$emit('input', 'testUser');
    expect(wrapper.emitted('update:data').pop().pop()).toEqual({
      user: {
        givenName: '',
        mail: '',
        sn: '',
        userName: 'testUser',
        password: '',
        preferences: {
          marketing: false,
          updates: false,
        },
      },
    });

    const firstNameField = wrapper.findComponent('[label="First Name"]');
    await firstNameField.vm.$emit('input', 'Test');
    expect(wrapper.emitted('update:data').pop().pop()).toEqual({
      user: {
        givenName: 'Test',
        mail: '',
        sn: '',
        userName: 'testUser',
        password: '',
        preferences: {
          marketing: false,
          updates: false,
        },
      },
    });
  });

  describe('not inline', () => {
    it('disables save button when form is invalid', async () => {
      wrapper = mountComponent({ inline: false });
      await flushPromises();

      expect(wrapper.find('.btn-primary.disabled').exists()).toBe(true);
    });

    it('enables save button when form is valid', async () => {
      wrapper = mountComponent({ inline: false });
      await flushPromises();

      const userNameField = wrapper.findComponent('[label="Username"]');
      await userNameField.vm.$emit('input', 'testUser');
      const firstNameField = wrapper.findComponent('[label="First Name"]');
      await firstNameField.vm.$emit('input', 'Test');
      const emailField = wrapper.findComponent('[label="Email Address"]');
      await emailField.vm.$emit('input', 'test@example.com');
      wrapper.vm.setValidPassword(true);
      await flushPromises();
      expect(wrapper.find('.btn-primary.disabled').exists()).toBe(false);
    });
  });
});
