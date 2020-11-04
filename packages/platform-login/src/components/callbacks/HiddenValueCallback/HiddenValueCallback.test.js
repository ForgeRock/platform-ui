/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import HiddenValueCallback from '@/components/callbacks/HiddenValueCallback';
import i18n from '@/i18n';

describe('HiddenValueCallback', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(HiddenValueCallback, {
      i18n,
      propsData: {
        callback: {
          getInputValue: () => 'a',
          setInputValue: jest.fn(),
        },
        index: 5,
      },
    });
  });

  it('Load HiddenValueCallback component', () => {
    expect(wrapper.name()).toEqual('HiddenValueCallback');
  });

  it('Sets name and value data', () => {
    expect(wrapper.vm.$data.name).toEqual('callback_5');
    expect(wrapper.vm.$data.value).toEqual('a');
  });

  it('Sets value onChange', async () => {
    const input = wrapper.find('input');
    await input.setValue('b');
    expect(wrapper.vm.$props.callback.setInputValue).toHaveBeenCalledWith('b');
  });
});
