/**
 * Copyright (c) 2020-2022 ForgeRock. All rights reserved.
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
          getType: () => 'KbaCreateCallback',
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
    expect(wrapper.emitted()['disable-next-button'].pop()).toEqual([true]);
    const customQuestionOption = { value: 'custom', text: 'Provide your own:' };
    expect(wrapper.vm.$data.options).toEqual([
      { value: 'Favorite color?', text: 'Favorite color?' },
      { value: 'Favorite planet?', text: 'Favorite planet?' },
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
