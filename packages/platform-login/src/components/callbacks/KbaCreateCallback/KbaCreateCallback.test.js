/**
 * Copyright (c) 2020-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, shallowMount, flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import KbaCreateCallback from '@/components/callbacks/KbaCreateCallback';
import i18n from '@/i18n';
import store from '../../../store';

ValidationRules.extendRules({
  required: ValidationRules.getRules(i18n).required,
  unique: ValidationRules.getRules(i18n).unique,
});

describe('KbaCreateCallback.vue (shallowMount)', () => {
  let wrapper;
  const callbackProp = {
    getPredefinedQuestions: () => (['Favorite color?', 'Favorite planet?']),
    getPrompt: () => 'Prompt',
    getType: () => 'KbaCreateCallback',
    setQuestion: jest.fn(),
    getOutputByName: () => true,
  };
  const customQuestionOption = { value: 'custom', text: 'Provide your own:' };

  function setup(overrideProps = {}, piniaState = {}) {
    store.state.SharedStore.newMultiselectEnabled = true;
    setupTestPinia(piniaState, false);
    wrapper = shallowMount(KbaCreateCallback, {
      global: {
        plugins: [i18n],
        renderStubDefaultSlot: true,
      },
      props: {
        callback: callbackProp,
        index: 5,
        showHeader: true,
        ...overrideProps,
      },
    });
  }

  it('Emits disable-next-button when mounted', () => {
    setup();
    expect(wrapper.emitted()['disable-next-button'].pop()).toEqual([true]);
  });

  describe('setting question options', () => {
    it('shows all options if no other KBACreateCallback components have chosen an option', () => {
      setup();
      expect(wrapper.vm.$data.options).toEqual([
        { value: 'Favorite color?', text: 'Favorite color?' },
        { value: 'Favorite planet?', text: 'Favorite planet?' },
        customQuestionOption,
      ]);
    });

    it('does not show options that have already been selected by another KBACreateCallback', () => {
      setup({}, {
        kbaChoices: {
          choices: {
            4: 'Favorite color?',
          },
        },
      });
      expect(wrapper.vm.$data.options).toEqual([
        { value: 'Favorite planet?', text: 'Favorite planet?' },
        customQuestionOption,
      ]);
    });
  });

  describe('Custom Question Enabled scenarios', () => {
    it('Shows customQuestionOption when callback is not present', () => {
      setup({ callback: { ...callbackProp, getOutputByName: () => undefined } }); // i.e. version of AM that doesn't send value in callback
      expect(wrapper.vm.$data.options).toContainEqual(customQuestionOption);
    });

    it('Shows customQuestionOption when callback is true', () => {
      setup(({ callback: { ...callbackProp, getOutputByName: () => true } }));
      expect(wrapper.vm.$data.options).toContainEqual(customQuestionOption);
    });

    it('Hides customQuestionOption when callback is false', async () => {
      setup({ callback: { ...callbackProp, getOutputByName: () => false } });
      expect(wrapper.vm.$data.options).not.toContainEqual(customQuestionOption);
    });
  });

  it('Shows header', () => {
    setup();
    const kbaContainer = wrapper.find('.kbaQuestionAnswerContainer');
    const header = kbaContainer.findAll('.kbaHeaderText');

    expect(header.length).toBe(2);
  });

  it('Hides header', async () => {
    setup();
    await wrapper.setProps({ showHeader: false });
    const kbaContainer = wrapper.find('.kbaQuestionAnswerContainer');
    const header = kbaContainer.findAll('.kbaHeaderText');

    expect(header.length).toBe(0);
  });

  it('setSubmitButton emits disable-next-button false if validation passes', async () => {
    setup();
    wrapper.vm.$refs.observer.validate = () => Promise.resolve({ valid: true });
    wrapper.vm.setSubmitButton();
    await flushPromises();
    expect(wrapper.emitted()['disable-next-button'].pop()).toEqual([false]);
  });

  it('setSubmitButton emits disable-next-button true if validation fails', async () => {
    setup();
    wrapper.vm.$refs.observer.validate = () => Promise.resolve({ valid: false });
    wrapper.vm.setSubmitButton();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted()['disable-next-button'].pop()).toEqual([true]);
  });

  it('sets custom question value properly', () => {
    setup();
    wrapper.vm.$refs.observer.validate = () => Promise.resolve({ valid: false });
    wrapper.vm.$data.selected = 'custom';
    wrapper.vm.$data.questionModel.value = 'test question';
    wrapper.vm.handleQuestionChoiceChange();
    expect(wrapper.vm.$props.callback.setQuestion).toHaveBeenCalledWith('test question');
  });
});

describe('KbaCreateCallback.vue (mount)', () => {
  let wrapper;
  const callbackProp = {
    getPredefinedQuestions: () => (['Favorite color?', 'Favorite planet?']),
    getPrompt: () => 'Prompt label',
    getType: () => 'KbaCreateCallback',
    setQuestion: jest.fn(),
    getOutputByName: () => true,
  };

  beforeEach(() => {
    store.state.SharedStore.newMultiselectEnabled = true;
    setupTestPinia({}, false);
    wrapper = mount(KbaCreateCallback, {
      global: {
        plugins: [i18n],
      },
      props: {
        callback: callbackProp,
        index: 5,
        showHeader: true,
      },
    });
  });

  it('doesn\'t have duplicate test in placeholder from label', () => {
    const label = wrapper.find('label');
    expect(label.text()).toBe('Prompt label');
    expect(wrapper.html()).toEqual(expect.stringContaining('placeholder="Type to search"'));
  });

  it('has aria required set', () => {
    const inputs = wrapper.findAll('input');
    expect(inputs[0].html()).toEqual(expect.stringContaining('aria-required="true"'));
    expect(inputs[1].html()).toEqual(expect.stringContaining('aria-required="true"'));
  });

  it('has aria invalid set when selection change', async () => {
    const inputs = wrapper.findAll('input');
    expect(inputs[1].attributes('disabled')).toBeDefined();
    expect(inputs[1].attributes('aria-invalid')).toBeUndefined();
    wrapper.vm.$data.selected = 'custom';
    await flushPromises();
    expect(inputs[1].attributes('disabled')).toBeUndefined();
    expect(inputs[1].attributes('aria-invalid')).toBe('true');
  });
});
