/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import i18n from '@/i18n';
import OAuthReturn from '@/components/OAuthReturn';

describe('OAuthReturn.vue', () => {
  beforeEach(() => {
    jest.spyOn(OAuthReturn, 'created').mockImplementation(() => {});
  });

  it('OAuth Return loaded', () => {
    const wrapper = mount(OAuthReturn, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.find('.fr-center-card').exists()).toBe(true);
  });
});
