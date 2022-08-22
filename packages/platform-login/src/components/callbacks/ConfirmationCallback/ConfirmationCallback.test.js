/**
 * Copyright (c) 2020-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import ConfirmationCallback from '@/components/callbacks/ConfirmationCallback';
import i18n from '@/i18n';

describe('ConfirmationCallback', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(ConfirmationCallback, {
      i18n,
      propsData: {
        callback: {
          getOptions: () => ['a', 'b', 'c', 'd'],
          setInputValue: jest.fn(),
        },
      },
    });
  });

  it('Load ConfirmationCallback component', () => {
    expect(wrapper.name()).toEqual('ConfirmationCallback');
  });

  it('Sets options data', () => {
    expect(wrapper.vm.$data.options).toEqual(['a', 'b', 'c', 'd']);
  });

  it('Sets options on DOM', () => {
    const buttons = wrapper.findAll('button');

    expect(buttons.length).toBe(4);
    expect(buttons.at(2).text()).toBe('c');
  });

  it('Sets callback inputValue and calls next-step', () => {
    const buttons = wrapper.findAll('button');
    buttons.at(2).trigger('click');

    expect(wrapper.vm.$props.callback.setInputValue).toHaveBeenLastCalledWith(2);
    expect(wrapper.emitted()['next-step'].pop()).toBeTruthy();
  });

  it('Show buttons (variant: button) by default', () => {
    const button = wrapper.find('button');
    expect(button.classes()).toContain('btn-primary');
  });

  it('Show buttons as links (variant: link) when variable showButtonsAsLinks is true', async () => {
    await wrapper.setProps({
      stage: {
        showButtonsAsLinks: true,
      },
    });

    const button = wrapper.find('button');
    expect(button.classes()).toContain('btn-link');
  });
});
