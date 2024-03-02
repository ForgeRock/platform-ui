/**
 * Copyright (c) 2020-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import FallbackImage from '@/components/utils/FallbackImage';

jest.spyOn(FallbackImage, 'mounted');

describe('utils/FallbackImage.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(FallbackImage, {
      global: {
        stubs: { BImg: true },
      },
    });
    wrapper.setData({ imageFound: true });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should display an image when "imageFound"', async () => {
    wrapper.setData({ imageFound: true });

    await nextTick();

    expect(wrapper.find('b-img-stub').isVisible()).toBe(true);
    expect(wrapper.find('i').exists()).toBe(false);
  });

  it('should display an icon when not "imageFound"', async () => {
    wrapper.setData({ imageFound: false });

    await nextTick();

    expect(wrapper.find('.text-dark').isVisible()).toBe(true);
    expect(wrapper.find('img').exists()).toBe(false);
  });
});
