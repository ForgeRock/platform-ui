/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import FallbackImage from '@forgerock/platform-shared/src/components/FallbackImage';

jest.spyOn(FallbackImage, 'mounted');

describe('/FallbackImage.vue', () => {
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
