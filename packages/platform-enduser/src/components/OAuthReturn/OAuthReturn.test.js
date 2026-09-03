/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import BounceLoader from '@forgerock/platform-shared/src/components/Spinner/BounceLoader';
import i18n from '@/i18n';
import OAuthReturn from '@/components/OAuthReturn';

jest.mock('@/scss/main.scss', () => ({
  basecolor: '#123456',
}));

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

  it('Renders the BounceLoader, passing through the loadingColor (basecolor) from main.scss', () => {
    const wrapper = mount(OAuthReturn, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.vm.loadingColor).toBe('#123456');
    const bounceLoader = wrapper.findComponent(BounceLoader);
    expect(bounceLoader.exists()).toBe(true);
    expect(bounceLoader.props('color')).toBe('#123456');
  });
});
