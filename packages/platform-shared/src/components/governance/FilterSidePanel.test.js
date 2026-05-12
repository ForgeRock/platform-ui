/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import FilterSidePanel from './FilterSidePanel';
import i18n from '@/i18n';

describe('FilterSidePanel', () => {
  function setup(props = {}, slots = {}) {
    return mount(FilterSidePanel, {
      global: { plugins: [i18n] },
      props,
      slots,
    });
  }

  it('renders the title', () => {
    const wrapper = setup({ title: 'Request Filter' });
    expect(wrapper.find('h2').text()).toBe('Request Filter');
  });

  it('renders an empty title when none is provided', () => {
    const wrapper = setup();
    expect(wrapper.find('h2').text()).toBe('');
  });

  it('renders default slot content', () => {
    const wrapper = setup({}, { default: '<div data-testid="slot-content">Filter content</div>' });
    expect(wrapper.find('[data-testid="slot-content"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="slot-content"]').text()).toBe('Filter content');
  });

  it('renders the fr-side-panel-content container', () => {
    const wrapper = setup({ title: 'Filters' });
    expect(wrapper.find('.fr-side-panel-content').exists()).toBe(true);
  });

  it('renders the BCard with correct classes', () => {
    const wrapper = setup({ title: 'Filters' });
    const card = wrapper.find('.fr-side-panel');
    expect(card.exists()).toBe(true);
  });
});
