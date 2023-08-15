/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import ChoiceCallback from '@/components/callbacks/ChoiceCallback';
import i18n from '@/i18n';

describe('ChoiceCallback', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(ChoiceCallback, {
      i18n,
      propsData: {
        callback: {
          getChoices: () => ['a', 'b', 'c', 'd'],
          getDefaultChoice: () => 0,
          getPrompt: () => 'select',
          setInputValue: jest.fn(),
        },
        index: 5,
      },
    });
  });

  it('Sets selected and choices/options data', () => {
    expect(wrapper.vm.$data.selected).toMatchObject(
      {
        name: 'callback_5',
        label: 'select',
        value: 0,
        options: [
          { text: 'a', value: 0 },
          { text: 'b', value: 1 },
          { text: 'c', value: 2 },
          { text: 'd', value: 3 }],
      },
    );
  });

  it('Sets prompt on DOM', () => {
    const select = wrapper.find('.multiselect');
    const elements = () => select.findAll('.multiselect__option');

    select.trigger('click');
    elements().at(2).trigger('click');

    expect(wrapper.vm.$data.selected).toMatchObject({ value: 2 });
    expect(wrapper.vm.$props.callback.setInputValue).toHaveBeenLastCalledWith(2);
  });
});
