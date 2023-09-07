/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ReCaptchaCallback from '@/components/callbacks/ReCaptchaCallback';
import i18n from '@/i18n';

describe('ReCaptchaCallback.vue', () => {
  const createWrapper = (apiUrl, isV3) => shallowMount(ReCaptchaCallback, {
    global: {
      plugin: [i18n],
      stubs: {
        'router-link': true,
        ReCaptchaV2: true,
        ReCaptchaV3: true,
      },
    },
    props: {
      callback: {
        getOutputByName: jest.fn((name) => {
          switch (name) {
            case 'captchaApiUri':
              return apiUrl;
            case 'reCaptchaV3':
              return isV3;
            default:
              return undefined;
          }
        }),
      },
    },
  });

  it('Sets data for ReCaptchaV3', () => {
    const wrapper = createWrapper('https://www.google.com/recaptcha/api.js', true);
    expect(wrapper.vm.$props.callback.getOutputByName).toHaveBeenCalled();
    expect(wrapper.vm.$data.reCaptchaComponentVersion).toBe('ReCaptchaV3');
  });

  it('Sets data for ReCaptchaV2', () => {
    const wrapper = createWrapper('https://www.google.com/recaptcha/api.js', false);
    expect(wrapper.vm.$props.callback.getOutputByName).toHaveBeenCalled();
    expect(wrapper.vm.$data.reCaptchaComponentVersion).toBe('ReCaptchaV2');
  });
});
