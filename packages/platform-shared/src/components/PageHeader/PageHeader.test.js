/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import PageHeader from './index';

describe('Navbar Component', () => {
  it('Includes a subtitle if given', () => {
    const wrapper = shallowMount(PageHeader, {
      props: {
        subtitle: 'testSubtitle',
      },
    });
    expect(wrapper.find('p.text-muted').text()).toContain('testSubtitle');
  });

  it('Does not includes a subtitle by default', () => {
    const wrapper = shallowMount(PageHeader);
    expect(wrapper.find('p.text-muted').exists()).toBe(false);
  });

  it('Includes a top text if given', () => {
    const wrapper = shallowMount(PageHeader, {
      props: {
        topText: 'topTextTest',
      },
    });
    expect(wrapper.find('h5.text-muted').text()).toContain('topTextTest');
  });

  it('Does not includes a top text by default', () => {
    const wrapper = shallowMount(PageHeader);
    expect(wrapper.find('h5.text-muted').exists()).toBe(false);
  });
});
