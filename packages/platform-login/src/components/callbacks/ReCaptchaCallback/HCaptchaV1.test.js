/**
 * Copyright (c) 2022-2026 ForgeRock. All rights reserved.
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
      global: {
        plugins: [i18n],
        stubs: {
          'router-link': true,
          VueHcaptcha: true,
        },
        mocks: {
          // Mock initial locale
          $i18n: {
            locale: 'en',
          },
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

  it('passes the current locale as language and key prop to VueHcaptcha', async () => {
    const initialId = wrapper.findComponent({ name: 'VueHcaptcha' }).vm._.uid;

    // Update the locale which updates key and trigger re-render
    i18n.global.locale = 'fr';
    await wrapper.vm.$nextTick();

    const vueHcaptchaStub = wrapper.findComponent({ name: 'VueHcaptcha' });
    expect(vueHcaptchaStub.props('language')).toBe('fr');

    const newId = vueHcaptchaStub.vm._.uid;
    expect(newId).not.toBe(initialId);
  });
});
