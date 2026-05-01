/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import Notifications from '@kyvg/vue3-notification';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as ActivityApi from '@forgerock/platform-shared/src/api/governance/ActivityApi';
import Activity from './Activity';

const testLogs = [
  {
    actor: { display_name: 'John Doe' },
    event_time: '2026-01-15T10:30:00Z',
    action: 'READ',
    outcome: 'SUCCESS',
  },
  {
    actor: { display_name: 'Jane Smith' },
    event_time: '2026-01-16T14:00:00Z',
    action: 'UPDATE',
    outcome: 'FAILURE',
  },
];

function mountComponent(props = {}) {
  ActivityApi.getActivityLogs = jest.fn().mockResolvedValue({
    data: { result: testLogs, totalCount: testLogs.length },
  });
  CommonsApi.getGlossarySchema = jest.fn().mockResolvedValue({});

  setupTestPinia();
  return mount(Activity, {
    global: {
      plugins: [Notifications],
      mocks: {
        $t: (t) => t,
      },
    },
    props,
  });
}

describe('Activity', () => {
  it('renders the GovResourceTable', () => {
    const wrapper = mountComponent();
    expect(wrapper.findComponent({ name: 'GovResourceTable' }).exists()).toBe(true);
  });

  it('calls getActivityLogs on load-data', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
    await flushPromises();

    expect(ActivityApi.getActivityLogs).toHaveBeenCalled();
  });

  it('builds queryFilter from objectId and single objectType', async () => {
    const wrapper = mountComponent({ objectId: 'abc123', objectTypes: ['agent'] });
    await flushPromises();

    wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
    await flushPromises();

    const { calls } = ActivityApi.getActivityLogs.mock;
    const calledParams = calls[calls.length - 1][0];
    expect(calledParams.queryFilter).toBe('(object_id eq "abc123" and object_type eq "agent")');
  });

  it('builds queryFilter with multiple objectTypes joined by OR', async () => {
    const wrapper = mountComponent({ objectId: 'abc123', objectTypes: ['agent', 'account'] });
    await flushPromises();

    wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
    await flushPromises();

    const { calls } = ActivityApi.getActivityLogs.mock;
    const calledParams = calls[calls.length - 1][0];
    expect(calledParams.queryFilter).toBe('(object_id eq "abc123" and (object_type eq "agent" or object_type eq "account"))');
  });

  it('passes through an existing queryFilter from load-data when no card filters are active', async () => {
    const wrapper = mountComponent({ objectId: 'abc123', objectTypes: ['agent'] });
    await flushPromises();

    wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', { queryFilter: 'some_field eq "value"' });
    await flushPromises();

    const { calls } = ActivityApi.getActivityLogs.mock;
    const calledParams = calls[calls.length - 1][0];
    expect(calledParams.queryFilter).toContain('some_field eq "value"');
  });

  it('builds sortKeys from sortBy and sortDir', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', { sortBy: 'actor.display_name', sortDir: 'desc' });
    await flushPromises();

    const { calls } = ActivityApi.getActivityLogs.mock;
    const calledParams = calls[calls.length - 1][0];
    expect(calledParams.sortKeys).toBe('-actor.display_name');
  });

  it('formats event_time on returned logs', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
    await flushPromises();

    const tableProps = wrapper.findComponent({ name: 'GovResourceTable' }).props('items');
    expect(tableProps[0].event_time).toBe('Jan 15, 2026 10:30:00 AM');
  });

  it('does not update items when getActivityLogs fails', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    ActivityApi.getActivityLogs = jest.fn().mockRejectedValue(new Error('network error'));
    wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
    await flushPromises();

    // items should retain the last successful load rather than being cleared on error
    expect(wrapper.findComponent({ name: 'GovResourceTable' }).props('items')).toHaveLength(testLogs.length);
  });

  it('computes pagedResultsOffset from pageNumber * pageSize and omits pageNumber', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', { pageNumber: 2, pageSize: 10 });
    await flushPromises();

    const { calls } = ActivityApi.getActivityLogs.mock;
    const calledParams = calls[calls.length - 1][0];
    expect(calledParams.pagedResultsOffset).toBe(20);
    expect(calledParams).not.toHaveProperty('pageNumber');
  });

  it('sets sortType to "date" when sorting by event_time', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', { sortBy: 'event_time', sortDir: 'asc' });
    await flushPromises();

    const { calls } = ActivityApi.getActivityLogs.mock;
    const calledParams = calls[calls.length - 1][0];
    expect(calledParams.sortType).toBe('date');
    expect(calledParams.sortKeys).toBe('event_time');
  });

  it('does not set sortType to "date" when sorting by a non-date field', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', { sortBy: 'actor', sortDir: 'asc' });
    await flushPromises();

    const { calls } = ActivityApi.getActivityLogs.mock;
    const calledParams = calls[calls.length - 1][0];
    expect(calledParams).not.toHaveProperty('sortType');
  });

  it('resets activityIsLoading to false after a successful query', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
    await flushPromises();

    expect(wrapper.findComponent({ name: 'GovResourceTable' }).props('loading')).toBe(false);
  });

  it('resets activityIsLoading to false even when getActivityLogs throws', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    ActivityApi.getActivityLogs = jest.fn().mockRejectedValue(new Error('network error'));
    wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
    await flushPromises();

    expect(wrapper.findComponent({ name: 'GovResourceTable' }).props('loading')).toBe(false);
  });

  it('builds a date range filter from the filterFromDate field', async () => {
    // With fake timers, the correct pattern is:
    //   1. emit / call action
    //   2. await flushPromises() — Vue reactivity processes the compat bridge update
    //   3. jest.advanceTimersByTime() — fires the debounced onFilterChanged
    //   4. await flushPromises() — resolves the async queryActivity call
    jest.useFakeTimers();
    const wrapper = mountComponent();
    jest.runAllTimers();
    await flushPromises();

    ActivityApi.getActivityLogs.mockClear();
    // FrField is an Options API compat component. Calling handleInput() triggers
    // this.$emit('modelCompat:input', value), which Activity.vue's v-model binding
    // (listening for onModelCompat:input) uses to update filterFromDate.
    const fromField = wrapper.findAllComponents({ name: 'FrField' })
      .find((c) => c.props('name') === 'filterFromDate');
    fromField.vm.handleInput('2026-05-01T09:00:00');
    await flushPromises();
    jest.advanceTimersByTime(500);
    await flushPromises();

    const { calls } = ActivityApi.getActivityLogs.mock;
    const calledParams = calls[calls.length - 1][0];
    expect(calledParams.queryFilter).toContain("event_time gte '2026-05-01T09:00:00.000Z'");
    jest.useRealTimers();
  });

  it('builds a date range filter from the filterToDate field', async () => {
    jest.useFakeTimers();
    const wrapper = mountComponent();
    jest.runAllTimers();
    await flushPromises();

    ActivityApi.getActivityLogs.mockClear();
    const toField = wrapper.findAllComponents({ name: 'FrField' })
      .find((c) => c.props('name') === 'filterToDate');
    toField.vm.handleInput('2026-05-02T17:00:00');
    await flushPromises();
    jest.advanceTimersByTime(500);
    await flushPromises();

    const { calls } = ActivityApi.getActivityLogs.mock;
    const calledParams = calls[calls.length - 1][0];
    expect(calledParams.queryFilter).toContain("event_time lte '2026-05-02T17:00:00.000Z'");
    jest.useRealTimers();
  });

  it('ANDs date range and search filters together', async () => {
    jest.useFakeTimers();
    const wrapper = mountComponent();
    jest.runAllTimers();
    await flushPromises();

    ActivityApi.getActivityLogs.mockClear();
    const fromField = wrapper.findAllComponents({ name: 'FrField' })
      .find((c) => c.props('name') === 'filterFromDate');
    fromField.vm.handleInput('2026-05-01T09:00:00');

    const searchInput = wrapper.findComponent({ name: 'SearchInput' });
    searchInput.vm.$emit('input', 'john');

    await flushPromises();
    jest.advanceTimersByTime(500);
    await flushPromises();

    const { calls } = ActivityApi.getActivityLogs.mock;
    const calledParams = calls[calls.length - 1][0];
    expect(calledParams.queryFilter).toContain("event_time gte '");
    expect(calledParams.queryFilter).toContain("actor.display_name co 'john'");
    expect(calledParams.queryFilter).toContain(' and ');
    jest.useRealTimers();
  });

  it('search filter targets actor.display_name, actor.email, and event_type with OR', async () => {
    jest.useFakeTimers();
    const wrapper = mountComponent();
    jest.runAllTimers();
    await flushPromises();

    ActivityApi.getActivityLogs.mockClear();
    const searchInput = wrapper.findComponent({ name: 'SearchInput' });
    // SearchInput emits 'input' from its value watcher; Activity.vue's v-model
    // (bound via onModelCompat:input on the vnode) updates filterSearchQuery when
    // the compat bridge translates the 'input' event to modelCompat:input.
    searchInput.vm.$emit('input', 'john');
    await flushPromises();
    jest.advanceTimersByTime(500);
    await flushPromises();

    const { calls } = ActivityApi.getActivityLogs.mock;
    const calledParams = calls[calls.length - 1][0];
    expect(calledParams.queryFilter).toBe("(actor.display_name co 'john' or actor.email co 'john' or event_type co 'john')");
    jest.useRealTimers();
  });

  it('escapes single quotes in the search query filter', async () => {
    jest.useFakeTimers();
    const wrapper = mountComponent();
    jest.runAllTimers();
    await flushPromises();

    ActivityApi.getActivityLogs.mockClear();
    const searchInput = wrapper.findComponent({ name: 'SearchInput' });
    searchInput.vm.$emit('input', "o'brien");
    await flushPromises();
    jest.advanceTimersByTime(500);
    await flushPromises();

    const { calls } = ActivityApi.getActivityLogs.mock;
    const calledParams = calls[calls.length - 1][0];
    expect(calledParams.queryFilter).toContain("o\\'brien");
    jest.useRealTimers();
  });
});
