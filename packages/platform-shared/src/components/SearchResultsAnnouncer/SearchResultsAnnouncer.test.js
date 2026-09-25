/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import i18n from '@/i18n';
import SearchResultsAnnouncer from './index';

describe('SearchResultsAnnouncer', () => {
  function setup(propsData) {
    setupTestPinia();
    return mount(SearchResultsAnnouncer, {
      propsData,
      global: {
        plugins: [i18n],
      },
    });
  }

  function liveRegion(wrapper) {
    return wrapper.find('[role="status"]');
  }

  it('always renders a visually hidden status region', () => {
    const wrapper = setup({ count: 5 });

    expect(liveRegion(wrapper).exists()).toBeTruthy();
    expect(liveRegion(wrapper).classes()).toContain('sr-only');
    expect(liveRegion(wrapper).attributes('data-testid')).toBe('search-results-announcer');
  });

  it('renders an empty region when no search is active', () => {
    const wrapper = setup({ count: null });
    expect(liveRegion(wrapper).text()).toBe('');
  });

  it('announces the default count wording with no resource prop', async () => {
    const wrapper = setup({ count: null });
    await wrapper.setProps({ count: 3 });

    expect(liveRegion(wrapper).text()).toBe('3 results found.');
  });

  it('announces the singular default wording for one result', async () => {
    const wrapper = setup({ count: null });
    await wrapper.setProps({ count: 1 });

    expect(liveRegion(wrapper).text()).toBe('1 result found.');
  });

  it('derives the plural from the resource prop', async () => {
    const wrapper = setup({ count: null });
    await wrapper.setProps({ count: 2, resource: 'Approval' });

    expect(liveRegion(wrapper).text()).toBe('2 Approvals found.');
  });

  it('announces the no results message when the count is zero', async () => {
    const wrapper = setup({ count: null });
    await wrapper.setProps({ count: 0 });

    expect(liveRegion(wrapper).text()).toBe('No results found.');
  });

  it('derives the no results message from the resource prop when passed', async () => {
    const wrapper = setup({ count: null });
    await wrapper.setProps({ count: 0, resource: 'role' });

    expect(liveRegion(wrapper).text()).toBe('No roles found');
  });

  it('clears the region when the search is reset', async () => {
    const wrapper = setup({ count: 3 });
    await wrapper.setProps({ count: null });

    expect(liveRegion(wrapper).text()).toBe('');
  });

  it('prefixes a repeated identical announcement so screen readers re-speak it', async () => {
    const wrapper = setup({ count: null });
    await wrapper.setProps({ count: 2 });
    expect(liveRegion(wrapper).text()).toBe('2 results found.');

    // Same search re-submitted: count resets to null, then returns to the same value.
    // The identical text would be suppressed by the screen reader, so it is prefixed
    await wrapper.setProps({ count: null });
    await wrapper.setProps({ count: 2 });

    expect(liveRegion(wrapper).text()).toBe('Search updated. 2 results found.');
  });

  it('announces normally again when the message differs from the prefixed one', async () => {
    const wrapper = setup({ count: null });
    await wrapper.setProps({ count: 2 });
    await wrapper.setProps({ count: null });
    await wrapper.setProps({ count: 2 });
    expect(liveRegion(wrapper).text()).toBe('Search updated. 2 results found.');

    // A different result count produces new text and must not carry the prefix
    await wrapper.setProps({ count: null });
    await wrapper.setProps({ count: 3 });

    expect(liveRegion(wrapper).text()).toBe('3 results found.');
  });

  it('keeps every identical announcement prefixed across repeated re-submissions', async () => {
    const wrapper = setup({ count: null });

    // Press 1: plain. Press 2: prefixed. Press 3: plain again (differs from press 2's prefixed
    // text, so it is announced). Press 4: prefixed again. Consecutive announcements always differ.
    await wrapper.setProps({ count: 5 });
    expect(liveRegion(wrapper).text()).toBe('5 results found.');

    await wrapper.setProps({ count: null });
    await wrapper.setProps({ count: 5 });
    expect(liveRegion(wrapper).text()).toBe('Search updated. 5 results found.');

    await wrapper.setProps({ count: null });
    await wrapper.setProps({ count: 5 });
    expect(liveRegion(wrapper).text()).toBe('5 results found.');

    await wrapper.setProps({ count: null });
    await wrapper.setProps({ count: 5 });
    expect(liveRegion(wrapper).text()).toBe('Search updated. 5 results found.');
  });
});
