/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import BooleanAttributeInputCallback from '@/components/callbacks/BooleanAttributeInputCallback';
import i18n from '@/i18n';

describe('BooleanAttributeInputCallback', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(BooleanAttributeInputCallback, {
      global: {
        plugins: [i18n],
      },
      props: {
        callback: {
          getInputValue: () => true,
          getPrompt: () => 'option',
          setInputValue: jest.fn(),
        },
        index: 5,
      },
    });
  });

  it('Sets name and value data', () => {
    expect(wrapper.vm.$data.name).toEqual('callback_5');
    expect(wrapper.vm.$data.value).toEqual(true);
  });

  it('Sets prompt on DOM', () => {
    expect(wrapper.find('label').text()).toEqual('option');
  });

  it('On toggle updates value', () => {
    wrapper.vm.onToggle();
    expect(wrapper.vm.$props.callback.setInputValue).toHaveBeenCalled();
  });
});
