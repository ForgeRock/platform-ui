/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, shallowMount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import KbaCreateCallback from '@/components/callbacks/KbaCreateCallback';
import i18n from '@/i18n';

describe('KbaCreateCallback.vue (shallowMount)', () => {
  let wrapper;
  const callbackProp = {
    getPredefinedQuestions: () => (['Favorite color?', 'Favorite planet?']),
    getPrompt: () => 'Prompt',
    getType: () => 'KbaCreateCallback',
    setQuestion: jest.fn(),
    getOutputByName: () => true,
  };

  beforeEach(() => {
    wrapper = shallowMount(KbaCreateCallback, {
      i18n,
      propsData: {
        callback: callbackProp,
        index: 5,
        showHeader: true,
      },
    });
  });

  it('Emits disable-next-button and sets options', () => {
    expect(wrapper.emitted()['disable-next-button'].pop()).toEqual([true]);
    const customQuestionOption = { value: 'custom', text: 'Provide your own:' };
    expect(wrapper.vm.$data.options).toEqual([
      { value: 'Favorite color?', text: 'Favorite color?' },
      { value: 'Favorite planet?', text: 'Favorite planet?' },
      customQuestionOption,
    ]);
  });

  describe('Custom Question Enabled scenarios', () => {
    it('Shows customQuestionOption when callback is not present', () => {
      wrapper.setProps({ callback: { ...callbackProp, getOutputByName: () => undefined } }); // i.e. version of AM that doesn't send value in callback
      wrapper.vm.loadOptions();
      const customQuestionOption = { value: 'custom', text: 'Provide your own:' };
      expect(wrapper.vm.$data.options).toContainEqual(customQuestionOption);
    });
    it('Shows customQuestionOption when callback is true', () => {
      wrapper.setProps({ callback: { ...callbackProp, getOutputByName: () => true } });
      wrapper.vm.loadOptions();
      const customQuestionOption = { value: 'custom', text: 'Provide your own:' };
      expect(wrapper.vm.$data.options).toContainEqual(customQuestionOption);
    });
    it('Hides customQuestionOption when callback is false', async () => {
      await wrapper.setProps({ callback: { ...callbackProp, getOutputByName: () => false } });
      wrapper.vm.loadOptions();
      await flushPromises();
      const customQuestionOption = { value: 'custom', text: 'Provide your own:' };
      expect(wrapper.vm.$data.options).not.toContainEqual(customQuestionOption);
    });
  });

  it('Shows header', () => {
    const kbaContainer = wrapper.find('.kbaQuestionAnswerContainer');
    const header = kbaContainer.findAll('.kbaHeaderText');

    expect(header.length).toBe(2);
  });

  it('Hides header', async () => {
    await wrapper.setProps({ showHeader: false });
    const kbaContainer = wrapper.find('.kbaQuestionAnswerContainer');
    const header = kbaContainer.findAll('.kbaHeaderText');

    expect(header.length).toBe(0);
  });

  it('setSubmitButton emits disable-next-button false if validation passes', async () => {
    wrapper.vm.$refs.observer.validate = () => Promise.resolve(true);
    wrapper.vm.setSubmitButton();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted()['disable-next-button'].pop()).toEqual([false]);
  });

  it('setSubmitButton emits disable-next-button true if validation fails', async () => {
    wrapper.vm.$refs.observer.validate = () => Promise.resolve(false);
    wrapper.vm.setSubmitButton();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted()['disable-next-button'].pop()).toEqual([true]);
  });

  it('sets custom question value properly', () => {
    wrapper.vm.$refs.observer.validate = () => Promise.resolve(false);
    wrapper.vm.$data.selected = 'custom';
    wrapper.vm.$data.questionModel.value = 'test question';
    wrapper.vm.validateQuestion();
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
    wrapper = mount(KbaCreateCallback, {
      i18n,
      propsData: {
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
});
