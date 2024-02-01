/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import MediaMixin from './index';
import cssCustomProperties from '../../utils/cssCustomProperties';

let wrapper;
const getMediaMin = jest.fn((val) => `screen and (min-width: ${val})`);
const getMediaMax = jest.fn((val) => `screen and (max-width: ${val})`);

const smValue = '576px';
const mdValue = '768px';
const lgValue = '992px';
const xlValue = '1200px';

describe('MediaMixin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount({}, {
      render() {},
      global: {
        mixins: [MediaMixin],
        mocks: { $t: (id) => id },
      },
    });
    window.matchMedia = jest.fn((param) => param);
    cssCustomProperties.getWithFallback = jest.fn((bp, width) => width);
  });

  it('Returns correct size media alias, or the default', () => {
    const smMin = wrapper.vm.media('sm');
    expect(smMin).toBe(getMediaMin(smValue));

    const smMax = wrapper.vm.media('lt-sm');
    expect(smMax).toBe(getMediaMax(smValue));

    const mdMin = wrapper.vm.media('md');
    expect(mdMin).toBe(getMediaMin(mdValue));

    const mdMax = wrapper.vm.media('lt-md');
    expect(mdMax).toBe(getMediaMax(mdValue));

    const lgMin = wrapper.vm.media('lg');
    expect(lgMin).toBe(getMediaMin(lgValue));

    const lgMax = wrapper.vm.media('lt-lg');
    expect(lgMax).toBe(getMediaMax(lgValue));

    const xlMin = wrapper.vm.media('xl');
    expect(xlMin).toBe(getMediaMin(xlValue));

    const xlMax = wrapper.vm.media('lt-xl');
    expect(xlMax).toBe(getMediaMax(xlValue));
  });

  it('Returns other types of alias, or default', () => {
    const noAlias = wrapper.vm.media('foo');
    expect(noAlias).toBe('foo');

    const dark = wrapper.vm.media('dark');
    expect(dark).toBe('(prefers-color-scheme: dark)');

    const noAnimation = wrapper.vm.media('no-animation');
    expect(noAnimation).toBe('(prefers-reduced-motion)');

    const anyHover = wrapper.vm.media('any-hover');
    expect(anyHover).toBe('(any-hover: hover), all and (-ms-high-contrast: none), (-ms-high-contrast: active)');
  });
});
