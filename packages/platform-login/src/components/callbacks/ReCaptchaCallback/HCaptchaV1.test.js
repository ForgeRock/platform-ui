/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import HCaptchaCallback from '@/components/callbacks/ReCaptchaCallback/HCaptchaV1';
import i18n from '@/i18n';

describe('HCaptchaV1.vue', () => {
  let wrapper;

  beforeEach(() => {
    window.document.head.appendChild = jest.fn();
    wrapper = shallowMount(HCaptchaCallback, {
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

  it('Load HCaptchaV1 component', () => {
    expect(wrapper.name()).toEqual('HCaptchaV1');
  });

  it('hCaptcha site key was retrieved from callback', () => {
    expect(wrapper.vm.$props.callback.getSiteKey).toHaveBeenCalled();
  });

  it('Verify sets correct token value', () => {
    wrapper.vm.handleCaptchaVerify('abcd');
    expect(wrapper.vm.$props.callback.setInputValue).toHaveBeenCalledWith('abcd');
  });

  it('Error displays notification', () => {
    const spyDisplayNotification = jest.spyOn(wrapper.vm, 'displayNotification').mockImplementation();
    wrapper.vm.handleCaptchaError();
    expect(spyDisplayNotification).toHaveBeenCalled();
  });
});
