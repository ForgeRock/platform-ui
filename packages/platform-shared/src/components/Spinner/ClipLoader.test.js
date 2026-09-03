/**
 * Copyright (c) 2026 Ping Identity. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ClipLoader from './ClipLoader';

// The component defaults to the themed `$primary` exported by scss/main.scss.
// jest stubs .scss imports, so mock a value here to prove the default flows through.
jest.mock('@/scss/main.scss', () => ({
  basecolor: '#109cf1',
}));

describe('ClipLoader Component', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(ClipLoader, {
      global: {
        mocks: {
          $t: (key) => (key),
        },
      },
    });
  });

  it('Renders the expected markup with an sr-only loading label', () => {
    expect(wrapper.find('.fr-clip-loader').exists()).toBe(true);
    expect(wrapper.find('.sr-only').text()).toBe('common.loadingEtc');
    expect(wrapper.find('.fr-clip-loader__clip').exists()).toBe(true);
  });

  it('Defaults the colour prop to the shared Spinner $primary (#109cf1)', () => {
    expect(wrapper.props('color')).toBe('#109cf1');
  });

  it('Renders the clip with the default colour and expected styling', () => {
    const style = wrapper.find('.fr-clip-loader__clip').attributes('style');
    expect(style).toContain('border-color: #109cf1 #109cf1 transparent');
    expect(style).toContain('height: 35px; width: 35px');
    expect(style).toContain('border-width: 2px; border-style: solid');
  });

  it('Applies the colour prop to the clip border, leaving size/shape unaffected', async () => {
    await wrapper.setProps({
      color: '#ff0000',
    });
    const style = wrapper.find('.fr-clip-loader__clip').attributes('style');
    expect(style).toContain('border-color: #ff0000 #ff0000 transparent');
    expect(style).toContain('height: 35px; width: 35px');
    expect(style).toContain('border-width: 2px; border-style: solid');
  });

  it('Defaults the size prop to 35px', () => {
    expect(wrapper.props('size')).toBe(35);
  });

  it('Applies the size prop to the clip', async () => {
    await wrapper.setProps({
      size: 20,
    });
    const style = wrapper.find('.fr-clip-loader__clip').attributes('style');
    expect(style).toContain('height: 20px; width: 20px');
  });
});
