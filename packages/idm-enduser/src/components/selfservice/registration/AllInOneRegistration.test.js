/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import RegistrationMock from './mocks/RegistrationMock';
import AllInOneRegistration from './AllInOneRegistration';
import i18n from '@/i18n';

mockValidation();

describe('AllInOneRegistration', () => {
  let wrapper;
  function mountComponent() {
    return mount(AllInOneRegistration, {
      props: {
        selfServiceDetails: RegistrationMock,
        isTesting: true,
      },
      global: {
        plugins: [i18n],
        stubs: ['PolicyPasswordInput'],
        mocks: {
          $store: { state: {} },
        },
      },
    });
  }

  it('shows component for each of the self service stages', async () => {
    wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.findComponent({ name: 'UserDetails' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'KBASecurityAnswerDefinitionStage' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'Captcha' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'TermsAndConditions' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'Consent' }).exists()).toBe(true);
  });

  it('emits an event when the registration is complete', async () => {
    wrapper = mountComponent();
    await flushPromises();

    // Complete Captcha
    wrapper.findComponent({ name: 'Captcha' }).vm.$emit('advance-stage', { response: 'test' });

    // Complete KBA
    const questionSelects = wrapper.findAllComponents('[label="Select a security question..."]');
    const answerInputs = wrapper.findAllComponents('[label="Answer"]');

    questionSelects[0].vm.$emit('input', '1');
    answerInputs[0].vm.$emit('input', 'Blue');
    questionSelects[1].vm.$emit('input', '2');
    answerInputs[1].vm.$emit('input', 'My first employer');

    // Complete User Details
    const userDetails = wrapper.findComponent({ name: 'UserDetails' });
    userDetails.vm.$emit('password-valid', true);
    const userNameField = wrapper.findComponent('[label="Username"]');
    await userNameField.vm.$emit('input', 'testUser');
    const firstNameField = wrapper.findComponent('[label="First Name"]');
    await firstNameField.vm.$emit('input', 'Test');
    const emailField = wrapper.findComponent('[label="Email Address"]');
    await emailField.vm.$emit('input', 'test@example.com');
    await flushPromises();

    const saveButton = wrapper.find('button[aria-label="Sign Up"]');
    expect(saveButton.text()).toBe('Sign Up');
    saveButton.trigger('click');
    await flushPromises();

    expect(wrapper.emitted('advanceStage')).toBeTruthy();
    expect(wrapper.emitted('advanceStage')[0][0]).toEqual({
      accept: 'true',
      kba: [
        {
          answer: 'Blue',
          questionId: '1',
        },
        {
          answer: 'My first employer',
          questionId: '2',
        },
      ],
      response: 'test',
      user: {
        givenName: 'Test',
        mail: 'test@example.com',
        password: '',
        preferences: {
          marketing: false,
          updates: false,
        },
        sn: '',
        userName: 'testUser',
      },
    });
  });
});
