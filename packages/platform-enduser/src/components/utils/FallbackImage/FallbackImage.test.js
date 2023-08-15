/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import FallbackImage from '@/components/utils/FallbackImage';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

jest.spyOn(FallbackImage, 'mounted');

describe('utils/FallbackImage.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(FallbackImage, {
      stubs: { BImg: true },
    });
    wrapper.setData({ imageFound: true });
  });

  afterEach(() => {
    wrapper.destroy();
  });

  it('should display an image when "imageFound"', () => {
    wrapper.setData({ imageFound: true });

    localVue.nextTick(() => {
      expect(wrapper.findAll('bimg-stub').isVisible()).toBe(true);
      expect(wrapper.findAll('i').exists()).toBe(false);
    });
  });

  it('should display an icon when not "imageFound"', () => {
    wrapper.setData({ imageFound: false });

    localVue.nextTick(() => {
      expect(wrapper.findAll('.text-dark').isVisible()).toBe(true);
      expect(wrapper.find('img').exists()).toBe(false);
    });
  });
});
