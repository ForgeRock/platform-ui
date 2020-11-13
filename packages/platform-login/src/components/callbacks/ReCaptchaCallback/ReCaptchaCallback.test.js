/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ReCaptchaCallback from '@/components/callbacks/ReCaptchaCallback';
import i18n from '@/i18n';

describe('ReCaptchaCallback.vue', () => {
  let wrapper;

  beforeEach(() => {
    window.document.head.appendChild = jest.fn();
    wrapper = shallowMount(ReCaptchaCallback, {
      i18n,
      stubs: {
        'router-link': true,
      },
      propsData: {
        callback: {
          getSiteKey: jest.fn(() => 'siteKey'),
          setInputValue: jest.fn(),
        },
        index: 5,
      },
    });
  });

  it('Load ReCaptchaCallback component', () => {
    expect(wrapper.name()).toEqual('ReCaptchaCallback');
  });

  it('Sets data', () => {
    expect(wrapper.vm.$data.name).toBe('callback_5');
    expect(wrapper.vm.$props.callback.getSiteKey).toHaveBeenCalled();
    expect(wrapper.vm.$data.recaptchaSiteKey).toBe('siteKey');
  });

  it('Appends Script to the dom', () => {
    expect(window.document.head.appendChild).toHaveBeenCalledWith(expect.any(Element));
  });

  it('Handles recaptcha callback', () => {
    wrapper.vm.handleCaptchaCallback('abcd');
    expect(wrapper.vm.$data.value).toEqual('abcd');
    expect(wrapper.vm.$props.callback.setInputValue).toHaveBeenCalledWith('abcd');
  });
});
