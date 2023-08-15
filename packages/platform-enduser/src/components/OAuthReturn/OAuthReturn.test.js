/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import OAuthReturn from '@/components/OAuthReturn';

const localVue = createLocalVue();

describe('OAuthReturn.vue', () => {
  beforeEach(() => {
    jest.spyOn(OAuthReturn, 'created').mockImplementation(() => {});
  });

  it('OAuth Return loaded', () => {
    const wrapper = shallowMount(OAuthReturn, {
      localVue,
      i18n,
      stubs: {
        BContainer: true,
      },
    });

    expect(wrapper.find('.fr-center-card').exists()).toBe(true);
  });
});
