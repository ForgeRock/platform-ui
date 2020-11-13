/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import TermsAndConditionsCallback from '@/components/callbacks/TermsAndConditionsCallback';
import i18n from '@/i18n';

describe('TermsAndConditionsCallback.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(TermsAndConditionsCallback, {
      i18n,
      stubs: {
        'router-link': true,
      },
      propsData: {
        callback: {
          getTerms: () => 'terms',
          setInputValue: jest.fn(),
        },
        index: 5,
      },
    });
  });

  it('Load Terms and Conditions component', () => {
    expect(wrapper.name()).toEqual('TermsAndConditions');
  });

  it('Sets data', () => {
    expect(wrapper.vm.$data.name).toBe('callback_5');
    expect(wrapper.vm.$data.terms).toBe('terms');

    expect(wrapper.vm.$props.callback.setInputValue).toHaveBeenCalledWith(true);
  });

  it('It opens the modal', () => {
    wrapper.vm.$refs['terms-modal'].show = jest.fn();
    const tacLink = wrapper.find('div a');
    tacLink.trigger('click');

    expect(wrapper.vm.$refs['terms-modal'].show).toHaveBeenCalled();
  });
});
