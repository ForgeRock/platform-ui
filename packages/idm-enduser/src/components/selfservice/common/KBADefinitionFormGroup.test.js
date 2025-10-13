/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import KBADefinitionFormGroup from './KBADefinitionFormGroup';
import i18n from '@/i18n';

mockValidation();

const selfServiceDetails = {
  requirements: {
    properties: {
      kba: {
        minItems: 2,
        questions: [
          {
            question: {
              en: "What's your favorite color?",
              en_GB: 'What is your favourite colour?',
              fr: 'Quelle est votre couleur préférée?',
            },
            id: '1',
          },
          {
            question: {
              en: 'Who was your first employer?',
              fr: 'FR Who was your first employer',
            },
            id: '2',
          },
        ],
      },
    },
  },
};

describe('KBADefinitionFormGroup', () => {
  let wrapper;
  function mountComponent() {
    return mount(KBADefinitionFormGroup, {
      props: {
        selfServiceDetails,
      },
      global: {
        plugins: [i18n],
      },
    });
  }

  it('has select options for each', () => {
    wrapper = mountComponent();

    expect(wrapper.findAll('[label="Select a security question..."]').length).toBe(2); // 2 questions
    expect(wrapper.findAll('[label="Answer"]').length).toBe(2); // 2 answers
  });

  it('selecting custom question shows text input', async () => {
    wrapper = mountComponent();

    expect(wrapper.find('[label="Question"]').exists()).toBe(false);
    await wrapper.findComponent('[label="Select a security question..."]').vm.$emit('input', 'custom');
    expect(wrapper.find('[label="Question"]').exists()).toBe(true);
  });

  it('emits an event when the kba are updated', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const questionField = wrapper.findAllComponents('[label="Select a security question..."]')[0];
    await questionField.vm.$emit('input', '1');

    const answerField = wrapper.findAllComponents('[label="Answer"]')[0];
    await answerField.vm.$emit('input', 'testAnswer');

    expect(wrapper.emitted('update:data')).toBeTruthy();
    expect(wrapper.emitted('update:data').pop().pop()).toEqual({
      kba: [
        { questionId: '1', answer: 'testAnswer' },
        { questionId: null, answer: null },
      ],
    });
  });

  it('emits an event for a custom question', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const questionField = wrapper.findAllComponents('[label="Select a security question..."]')[0];
    await questionField.vm.$emit('input', 'custom');

    const customQuestionField = wrapper.findAllComponents('[label="Question"]')[0];
    await customQuestionField.vm.$emit('input', 'My custom question?');

    const answerField = wrapper.findAllComponents('[label="Answer"]')[0];
    await answerField.vm.$emit('input', 'testAnswer');

    expect(wrapper.emitted('update:data')).toBeTruthy();
    expect(wrapper.emitted('update:data').pop().pop()).toEqual({
      kba: [
        { customQuestion: 'My custom question?', answer: 'testAnswer' },
        { questionId: null, answer: null },
      ],
    });
  });
});
