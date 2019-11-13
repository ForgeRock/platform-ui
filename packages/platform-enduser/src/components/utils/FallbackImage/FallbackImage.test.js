/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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
    wrapper = undefined;
  });

  it('FallbackImage component loaded', () => {
    wrapper.setData({ imageFound: true });
    expect(wrapper.name()).toBe('ImageFallback');
    expect(wrapper).toMatchSnapshot();
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
      expect(wrapper.findAll('i.text-dark').isVisible()).toBe(true);
      expect(wrapper.find('img').exists()).toBe(false);
    });
  });
});
