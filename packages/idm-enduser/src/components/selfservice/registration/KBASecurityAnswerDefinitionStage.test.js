/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import RegistrationMock from './mocks/RegistrationMock';
import KBASecurityAnswerDefinitionStage from './KBASecurityAnswerDefinitionStage';
import i18n from '@/i18n';

mockValidation();

describe('KBASecurityAnswerDefinitionStage', () => {
  let wrapper;
  function mountComponent() {
    return mount(KBASecurityAnswerDefinitionStage, {
      props: {
        selfServiceDetails: RegistrationMock,
      },
      global: {
        plugins: [i18n],
      },
    });
  }

  describe('not inline', () => {
    it('disables submit when KBA is not complete', async () => {
      wrapper = mountComponent();
      await flushPromises();

      const submitButton = wrapper.find('button.disabled');
      expect(submitButton.text()).toBe('Complete Registration');
      expect(submitButton.exists()).toBe(true);
    });

    it('enables submit when KBA is complete', async () => {
      wrapper = mountComponent();
      await flushPromises();

      const questionSelects = wrapper.findAllComponents('[label="Select a security question..."]');
      const answerInputs = wrapper.findAllComponents('[label="Answer"]');

      questionSelects[0].vm.$emit('input', '1');
      answerInputs[0].vm.$emit('input', 'Blue');
      questionSelects[1].vm.$emit('input', '2');
      answerInputs[1].vm.$emit('input', 'My first employer');
      await flushPromises();

      const submitButton = wrapper.find('button:not(.disabled)');
      expect(submitButton.text()).toBe('Complete Registration');
      expect(submitButton.exists()).toBe(true);
    });

    it('clicking submit emits advanceStage event', async () => {
      wrapper = mountComponent();
      await flushPromises();

      const questionSelects = wrapper.findAllComponents('[label="Select a security question..."]');
      const answerInputs = wrapper.findAllComponents('[label="Answer"]');

      questionSelects[0].vm.$emit('input', '1');
      answerInputs[0].vm.$emit('input', 'Blue');
      questionSelects[1].vm.$emit('input', '2');
      answerInputs[1].vm.$emit('input', 'My first employer');
      await flushPromises();

      await wrapper.find('button:not(.disabled)').trigger('click');
      expect(wrapper.emitted('advanceStage')).toBeTruthy();
      expect(wrapper.emitted('advanceStage')[0][0]).toEqual({
        kba: [
          { questionId: '1', answer: 'Blue' },
          { questionId: '2', answer: 'My first employer' },
        ],
      });
    });
  });

  describe('inline', () => {
    it('emits update:data with KBA form group data when KBA is complete', async () => {
      wrapper = mountComponent({ inline: true });
      await flushPromises();

      const questionSelects = wrapper.findAllComponents('[label="Select a security question..."]');
      const answerInputs = wrapper.findAllComponents('[label="Answer"]');

      questionSelects[0].vm.$emit('input', '1');
      answerInputs[0].vm.$emit('input', 'Blue');
      questionSelects[1].vm.$emit('input', '2');
      answerInputs[1].vm.$emit('input', 'My first employer');
      await flushPromises();

      expect(wrapper.emitted('update:data').pop().pop()).toEqual({
        kba: [
          { questionId: '1', answer: 'Blue' },
          { questionId: '2', answer: 'My first employer' },
        ],
      });
    });
  });
});
