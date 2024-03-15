/**
 * Copyright (c) 2020-2024 ForgeRock. All rights reserved.
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
      global: {
        plugins: [i18n],
      },
      props: {
        callback: {
          getInputValue: () => 'a',
          setInputValue: jest.fn(),
        },
        index: 5,
      },
    });
    wrapper.vm.$props.callback.setInputValue.mockReset();
  });

  it('Sets name, and value data and emits ref', () => {
    expect(wrapper.vm.$data.name).toEqual('callback_5');
    expect(wrapper.vm.$data.value).toEqual('a');

    const emitted = wrapper.emitted()['hidden-value-callback-ref'].pop();
    expect(emitted.length).toBe(1);
    expect(emitted).toEqual([expect.any(Element)]);
  });

  it('Sets value value for callback', async () => {
    await wrapper.setData({ value: 'element value change' });
    wrapper.find('input').trigger('input');

    expect(wrapper.vm.$props.callback.setInputValue).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.$props.callback.setInputValue).toHaveBeenCalledWith('element value change');
  });
});
