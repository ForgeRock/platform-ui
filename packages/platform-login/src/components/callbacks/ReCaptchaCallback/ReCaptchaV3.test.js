/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ReCaptchaCallback from '@/components/callbacks/ReCaptchaCallback/ReCaptchaV3';
import i18n from '@/i18n';
import vueReCaptcha from '../../../plugins/vueReCaptcha';

describe('ReCaptchaV3.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(ReCaptchaCallback, {
      global: {
        mocks: {
          $recaptchaLoaded: () => Promise.resolve(),
          $recaptcha: () => Promise.resolve('token'),
          $t: () => {},
        },
        stubs: {
          'router-link': true,
        },
        plugins: [i18n, vueReCaptcha],
      },
      props: {
        callback: {
          getSiteKey: jest.fn(() => 'siteKey'),
          setInputValue: jest.fn(),
        },
      },
    });
  });

  it('Sets data and emits callback', () => {
    expect(wrapper.vm.$props.callback.getSiteKey).toHaveBeenCalled();
    expect(wrapper.emitted()['next-step-callback'][0][0]).toEqual(wrapper.vm.runRecaptcha);
  });

  it('Resolves promise for recaptcha and sets callback value on resolve', async () => {
    const recaptchaPromise = wrapper.vm.runRecaptcha();
    await recaptchaPromise;
    expect(wrapper.vm.$props.callback.setInputValue).toHaveBeenCalledWith('token');
  });

  it('Rejects promise for $recaptchaLoaded', async () => {
    const spy$recaptchaLoaded = jest.spyOn(wrapper.vm, '$recaptchaLoaded').mockImplementation(() => Promise.reject());
    const spyDisplayNotification = jest.spyOn(wrapper.vm, 'displayNotification').mockImplementation();
    try {
      const recaptchaPromise = wrapper.vm.runRecaptcha();
      await recaptchaPromise;
    } catch {
      expect(spy$recaptchaLoaded).toHaveBeenCalled();
      expect(wrapper.vm.$props.callback.setInputValue).not.toHaveBeenCalled();
      expect(spyDisplayNotification).toHaveBeenCalled();
    }
  });

  it('Rejects promise for $recaptcha', async () => {
    const spy$recaptcha = jest.spyOn(wrapper.vm, '$recaptcha').mockImplementation(() => Promise.reject());
    const spyDisplayNotification = jest.spyOn(wrapper.vm, 'displayNotification').mockImplementation();
    try {
      const recaptchaPromise = wrapper.vm.runRecaptcha();
      await recaptchaPromise;
    } catch {
      expect(spy$recaptcha).toHaveBeenCalled();
      expect(wrapper.vm.$props.callback.setInputValue).not.toHaveBeenCalled();
      expect(spyDisplayNotification).toHaveBeenCalled();
    }
  });
});
