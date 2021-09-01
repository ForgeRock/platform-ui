/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import KbaCreateCallback from '@/components/callbacks/KbaCreateCallback';
import i18n from '@/i18n';

describe('KbaCreateCallback.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(KbaCreateCallback, {
      i18n,
      propsData: {
        callback: {
          getPredefinedQuestions: () => (['Favorite color?', 'Favorite planet?']),
          getPrompt: () => 'Prompt',
          setQuestion: jest.fn(),
        },
        index: 5,
        showHeader: true,
      },
    });
  });

  it('Load KbaCreateCallback component', () => {
    expect(wrapper.name()).toEqual('KbaCreateCallback');
  });

  it('Emits disable-next-button and sets options', () => {
    expect(wrapper.emitted()['disable-next-button'].pop()).toEqual([true, 5]);
    const placeholder = { value: null, text: 'Prompt', disabled: true };
    const customQuestionOption = { value: 'custom', text: 'Provide your own:', disabled: false };
    expect(wrapper.vm.$data.options).toEqual([
      placeholder,
      'Favorite color?',
      'Favorite planet?',
      customQuestionOption,
    ]);
  });

  it('Shows header', () => {
    const kbaContainer = wrapper.find('.kbaQuestionAnswerContainer');
    const header = kbaContainer.findAll('.kbaHeaderText');

    expect(header.length).toBe(2);
  });

  it('Hides header', () => {
    wrapper.setProps({ showHeader: false });
    const kbaContainer = wrapper.find('.kbaQuestionAnswerContainer');
    const header = kbaContainer.findAll('.kbaHeaderText');

    expect(header.length).toBe(0);
  });

  it('setSubmitButton emits disable-next-button false if validation passes', async () => {
    wrapper.vm.$refs.observer.validate = () => Promise.resolve(true);
    wrapper.vm.setSubmitButton();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted()['disable-next-button'].pop()).toEqual([false, 5]);
  });

  it('setSubmitButton emits disable-next-button true if validation fails', async () => {
    wrapper.vm.$refs.observer.validate = () => Promise.resolve(false);
    wrapper.vm.setSubmitButton();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted()['disable-next-button'].pop()).toEqual([true, 5]);
  });

  it('sets custom question value properly', () => {
    wrapper.vm.$refs.observer.validate = () => Promise.resolve(false);
    wrapper.vm.$data.selected = 'custom';
    wrapper.vm.$data.questionModel.value = 'test question';
    wrapper.vm.validateQuestion();
    expect(wrapper.vm.$props.callback.setQuestion).toHaveBeenCalledWith('test question');
  });
});
