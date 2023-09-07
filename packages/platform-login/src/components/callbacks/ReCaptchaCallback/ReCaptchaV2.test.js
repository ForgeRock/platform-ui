/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ReCaptchaCallback from '@/components/callbacks/ReCaptchaCallback/ReCaptchaV2';
import i18n from '@/i18n';

describe('ReCaptchaV2.vue', () => {
  let wrapper;

  beforeEach(() => {
    window.document.head.appendChild = jest.fn();
    wrapper = shallowMount(ReCaptchaCallback, {
      global: {
        plugins: [i18n],
        stubs: {
          'router-link': true,
        },
      },
      props: {
        callback: {
          getSiteKey: jest.fn(() => 'siteKey'),
          setInputValue: jest.fn(),
        },
        index: 5,
      },
    });
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
