/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import SuspendedTextOutputCallback from '@/components/callbacks/SuspendedTextOutputCallback';
import i18n from '@/i18n';

describe('SuspendedTextOutputCallback.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(SuspendedTextOutputCallback, {
      i18n,
      propsData: {
        callback: {
          getOutputValue: jest.fn(() => 'message'),
        },
        index: 5,
      },
    });
  });

  it('Load ReCaptchaCallback component', () => {
    expect(wrapper.name()).toEqual('SuspendedTextOutputCallback');
  });

  it('Sets data', () => {
    expect(wrapper.vm.$data.message).toBe('message');
  });
});
