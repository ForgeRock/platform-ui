/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import CircleProgressBar from './index';

describe('CircleProgressBar Component', () => {
  it('Component loaded with properly params', () => {
    const wrapper = shallowMount(CircleProgressBar, {
      props: {
        progress: 50,
        size: 250,
      },
    });
    expect(wrapper.attributes('progress')).toBe('50');
    expect(wrapper.attributes('size')).toBe('250');
    expect(wrapper.attributes('thickness')).toBe('14');
    expect(wrapper.attributes('color')).toBe('#3f79ff');
    expect(wrapper.attributes('emptycolor')).toBe('#e6e9f0');
  });
});
