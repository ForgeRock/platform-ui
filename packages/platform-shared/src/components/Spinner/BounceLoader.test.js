/**
 * Copyright (c) 2026 Ping Identity. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import BounceLoader from './BounceLoader';

// The component defaults to the themed `$primary` exported by scss/main.scss.
// jest stubs .scss imports, so mock a value here to prove the default flows through.
jest.mock('@/scss/main.scss', () => ({
  basecolor: '#109cf1',
}));

describe('BounceLoader Component', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(BounceLoader, {
      global: {
        mocks: {
          $t: (key) => (key),
        },
      },
    });
  });

  it('Renders the expected markup with an sr-only loading label', () => {
    expect(wrapper.find('.fr-bounce-loader').exists()).toBe(true);
    expect(wrapper.find('.sr-only').text()).toBe('common.loadingEtc');
    expect(wrapper.find('.fr-bounce-loader__dot-wrapper').exists()).toBe(true);
    expect(wrapper.find('.fr-bounce-loader__dot-wrapper').attributes('style')).toContain('height: 60px; width: 60px; position: relative;');
    expect(wrapper.findAll('.fr-bounce-loader__dot').length).toBe(2);
  });

  it('Defaults the colour prop to the shared Spinner $primary (#109cf1)', () => {
    expect(wrapper.props('color')).toBe('#109cf1');
  });

  it('Renders both bouncing dots with the default colour', () => {
    const dots = wrapper.findAll('.fr-bounce-loader__dot');
    expect(dots.at(0).attributes('style')).toContain('background-color: rgb(16, 156, 241)');
    expect(dots.at(1).attributes('style')).toContain('background-color: rgb(16, 156, 241)');
  });

  it('Applies the colour prop to both dots', async () => {
    await wrapper.setProps({
      color: '#ff0000',
    });
    const dots = wrapper.findAll('.fr-bounce-loader__dot');
    expect(dots.at(0).attributes('style')).toContain('background-color: rgb(255, 0, 0)');
    expect(dots.at(1).attributes('style')).toContain('background-color: rgb(255, 0, 0)');
  });

  it('Defaults the size prop to 60px, leaving the wrapper size/position unaffected by the colour prop', async () => {
    await wrapper.setProps({
      color: '#ff0000',
    });
    expect(wrapper.props('size')).toBe(60);
    expect(wrapper.find('.fr-bounce-loader__dot-wrapper').attributes('style')).toContain('height: 60px; width: 60px; position: relative;');
  });

  it('Applies the size prop to the wrapper and both dots', async () => {
    await wrapper.setProps({
      size: 24,
    });
    expect(wrapper.find('.fr-bounce-loader__dot-wrapper').attributes('style')).toContain('height: 24px; width: 24px; position: relative;');
    const dots = wrapper.findAll('.fr-bounce-loader__dot');
    expect(dots.at(0).attributes('style')).toContain('height: 24px; width: 24px');
    expect(dots.at(1).attributes('style')).toContain('height: 24px; width: 24px');
  });
});
