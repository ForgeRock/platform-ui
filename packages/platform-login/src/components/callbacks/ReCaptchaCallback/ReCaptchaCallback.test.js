/**
 * Copyright (c) 2021-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ReCaptchaCallback from '@/components/callbacks/ReCaptchaCallback';
import i18n from '@/i18n';

describe('ReCaptchaCallback.vue', () => {
  const createWrapper = (isV3) => shallowMount(ReCaptchaCallback, {
    i18n,
    stubs: {
      'router-link': true,
      ReCaptchaV2: true,
      ReCaptchaV3: true,
    },
    propsData: {
      callback: {
        getOutputByName: jest.fn(() => isV3),
      },
    },
  });

  it('Load ReCaptchaCallback component', () => {
    const wrapper = createWrapper(false);
    expect(wrapper.name()).toEqual('ReCaptchaCallback');
  });

  it('Sets data for ReCaptchaV3', () => {
    const wrapper = createWrapper(true);
    expect(wrapper.vm.$props.callback.getOutputByName).toHaveBeenCalled();
    expect(wrapper.vm.$data.reCaptchaComponentVersion).toBe('ReCaptchaV3');
  });

  it('Sets data for ReCaptchaV2', () => {
    const wrapper = createWrapper(false);
    expect(wrapper.vm.$props.callback.getOutputByName).toHaveBeenCalled();
    expect(wrapper.vm.$data.reCaptchaComponentVersion).toBe('ReCaptchaV2');
  });
});
