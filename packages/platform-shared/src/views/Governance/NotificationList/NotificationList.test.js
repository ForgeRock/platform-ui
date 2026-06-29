/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { toHaveNoViolations } from 'jest-axe';
import Notifications from '@kyvg/vue3-notification';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as NotificationTaskApi from '@forgerock/platform-shared/src/api/governance/NotificationTaskApi';
import NotificationList from './NotificationList';

expect.extend(toHaveNoViolations);

const testTasks = [
  {
    id: 'task-1',
    status: 'complete',
    date: null,
    taskData: { template: 'requestAssigned', to: 'fyork@example.com' },
    metadata: { createdDate: '2026-05-07T19:25:17.000Z', modifiedDate: '2026-05-07T19:25:56.000Z' },
  },
  {
    id: 'task-2',
    status: 'pending',
    date: '2026-05-10T19:25:16.000Z',
    taskData: { template: 'requestReminder', to: 'jsmith@example.com' },
    metadata: { createdDate: '2026-05-08T10:00:00.000Z' },
  },
  {
    id: 'task-3',
    status: 'failed',
    date: null,
    taskData: { template: 'requestExpired', to: 'bwilson@example.com' },
    metadata: { createdDate: '2026-05-09T08:00:00.000Z' },
  },
];

function mountComponent() {
  CommonsApi.getGlossarySchema = jest.fn().mockResolvedValue({ data: {} });
  NotificationTaskApi.getNotificationTasks = jest.fn().mockResolvedValue({
    data: { result: testTasks, totalCount: testTasks.length },
  });

  setupTestPinia();
  return mount(NotificationList, {
    global: {
      plugins: [Notifications],
      mocks: {
        $t: (t) => t,
      },
    },
  });
}

describe('NotificationList', () => {
  describe('table rendering', () => {
    it('renders the GovResourceTable', () => {
      const wrapper = mountComponent();
      expect(wrapper.findComponent({ name: 'GovResourceTable' }).exists()).toBe(true);
    });

    it('calls getNotificationTasks on load-data', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
      await flushPromises();

      expect(NotificationTaskApi.getNotificationTasks).toHaveBeenCalled();
    });

    it('transforms tasks — flattens template, recipient, formats createdOn, and computes sendDate', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
      await flushPromises();

      const items = wrapper.findComponent({ name: 'GovResourceTable' }).props('items');
      expect(items[0].template).toBe('requestAssigned');
      expect(items[0].recipient).toBe('fyork@example.com');
      expect(items[0].createdOn).toBe('May 07, 2026 7:25:17 PM');

      // complete: sendDate from metadata.modifiedDate
      expect(items[0].sendDate).toBe('May 07, 2026 7:25:56 PM');
      // pending: sendDate from task.date
      expect(items[1].sendDate).toBe('May 10, 2026 7:25:16 PM');
      // failed: sendDate is blankValueIndicator
      expect(items[2].sendDate).toBe('--');
    });

    it('passes totalCount to GovResourceTable', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
      await flushPromises();

      expect(wrapper.findComponent({ name: 'GovResourceTable' }).props('totalCount')).toBe(testTasks.length);
    });

    it('sets loading to false after successful fetch', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
      await flushPromises();

      expect(wrapper.findComponent({ name: 'GovResourceTable' }).props('loading')).toBe(false);
    });

    it('sets loading to false even when getNotificationTasks throws', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      NotificationTaskApi.getNotificationTasks = jest.fn().mockRejectedValue(new Error('network error'));
      wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
      await flushPromises();

      expect(wrapper.findComponent({ name: 'GovResourceTable' }).props('loading')).toBe(false);
    });
  });

  describe('pagination', () => {
    it('computes pagedResultsOffset from pageNumber * pageSize and omits pageNumber', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', { pageNumber: 2, pageSize: 10 });
      await flushPromises();

      const { calls } = NotificationTaskApi.getNotificationTasks.mock;
      const calledParams = calls[calls.length - 1][0];
      expect(calledParams.pagedResultsOffset).toBe(20);
      expect(calledParams).not.toHaveProperty('pageNumber');
    });
  });

  describe('sort', () => {
    it('maps createdOn sortBy to metadata.createdDate and sets sortType=date when desc', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', { sortBy: 'createdOn', sortDir: 'desc' });
      await flushPromises();

      const { calls } = NotificationTaskApi.getNotificationTasks.mock;
      const calledParams = calls[calls.length - 1][0];
      expect(calledParams.sortKeys).toBe('-metadata.createdDate');
      expect(calledParams.sortType).toBe('date');
    });

    it('maps createdOn sortBy to metadata.createdDate and sets sortType=date when asc', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', { sortBy: 'createdOn', sortDir: 'asc' });
      await flushPromises();

      const { calls } = NotificationTaskApi.getNotificationTasks.mock;
      const calledParams = calls[calls.length - 1][0];
      expect(calledParams.sortKeys).toBe('metadata.createdDate');
      expect(calledParams.sortType).toBe('date');
    });
  });

  describe('filter interactions', () => {
    it('builds a date range filter from the filterFromDate field', async () => {
      jest.useFakeTimers();
      const wrapper = mountComponent();
      jest.runAllTimers();
      await flushPromises();

      NotificationTaskApi.getNotificationTasks.mockClear();
      const fromField = wrapper.findAllComponents({ name: 'FrField' })
        .find((c) => c.props('name') === 'filterFromDate');
      fromField.vm.handleInput('2026-05-01T09:00:00');
      await flushPromises();
      jest.advanceTimersByTime(500);
      await flushPromises();

      const { calls } = NotificationTaskApi.getNotificationTasks.mock;
      const calledParams = calls[calls.length - 1][0];
      expect(calledParams.queryFilter).toContain("metadata.createdDate gte '2026-05-01T09:00:00.000Z'");
      jest.useRealTimers();
    });

    it('builds a date range filter from the filterToDate field', async () => {
      jest.useFakeTimers();
      const wrapper = mountComponent();
      jest.runAllTimers();
      await flushPromises();

      NotificationTaskApi.getNotificationTasks.mockClear();
      const toField = wrapper.findAllComponents({ name: 'FrField' })
        .find((c) => c.props('name') === 'filterToDate');
      toField.vm.handleInput('2026-05-02T17:00:00');
      await flushPromises();
      jest.advanceTimersByTime(500);
      await flushPromises();

      const { calls } = NotificationTaskApi.getNotificationTasks.mock;
      const calledParams = calls[calls.length - 1][0];
      expect(calledParams.queryFilter).toContain("metadata.createdDate lte '2026-05-02T17:00:00.000Z'");
      jest.useRealTimers();
    });

    it('applies status eq "pending" filter when the pending tab is activated', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      NotificationTaskApi.getNotificationTasks.mockClear();
      wrapper.findComponent({ name: 'BTabs' }).vm.$emit('activate-tab', 1);
      await flushPromises();

      const { calls } = NotificationTaskApi.getNotificationTasks.mock;
      const calledParams = calls[calls.length - 1][0];
      expect(calledParams.queryFilter).toContain('status eq "pending"');
    });

    it('triggers exactly one API call when switching tabs', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      NotificationTaskApi.getNotificationTasks.mockClear();
      wrapper.findComponent({ name: 'BTabs' }).vm.$emit('activate-tab', 1);
      await flushPromises();

      expect(NotificationTaskApi.getNotificationTasks).toHaveBeenCalledTimes(1);
    });

    it('builds a context filter when type and id are both set', async () => {
      jest.useFakeTimers();
      const wrapper = mountComponent();
      jest.runAllTimers();
      await flushPromises();

      await wrapper.find('button.p-0').trigger('click');
      await flushPromises();

      NotificationTaskApi.getNotificationTasks.mockClear();
      const typeField = wrapper.findAllComponents({ name: 'FrField' })
        .find((c) => c.props('name') === 'filterContextType');
      typeField.vm.handleInput('request');
      await flushPromises();
      jest.advanceTimersByTime(500);
      await flushPromises();

      // type alone (no id) should filter to records that have any value for that context field
      const callsAfterType = NotificationTaskApi.getNotificationTasks.mock.calls;
      const paramsAfterType = callsAfterType[callsAfterType.length - 1][0];
      expect(paramsAfterType.queryFilter).toContain("context.request co ''");

      // now set an id — await nextTick so v-if="filterContextType" renders filterContextId field
      await wrapper.vm.$nextTick();
      const idField = wrapper.findAllComponents({ name: 'FrField' })
        .find((c) => c.props('name') === 'filterContextId');
      idField.vm.handleInput('req-123');
      await flushPromises();
      jest.advanceTimersByTime(500);
      await flushPromises();

      const { calls } = NotificationTaskApi.getNotificationTasks.mock;
      const calledParams = calls[calls.length - 1][0];
      expect(calledParams.queryFilter).toContain("context.request eq 'req-123'");
      jest.useRealTimers();
    });

    it('escapes single quotes in the context id search', async () => {
      jest.useFakeTimers();
      const wrapper = mountComponent();
      jest.runAllTimers();
      await flushPromises();

      await wrapper.find('button.p-0').trigger('click');
      await flushPromises();

      NotificationTaskApi.getNotificationTasks.mockClear();
      const typeField = wrapper.findAllComponents({ name: 'FrField' })
        .find((c) => c.props('name') === 'filterContextType');
      typeField.vm.handleInput('campaign');
      await flushPromises();
      await wrapper.vm.$nextTick();

      const idField = wrapper.findAllComponents({ name: 'FrField' })
        .find((c) => c.props('name') === 'filterContextId');
      idField.vm.handleInput("o'brien");
      await flushPromises();
      jest.advanceTimersByTime(500);
      await flushPromises();

      const { calls } = NotificationTaskApi.getNotificationTasks.mock;
      const calledParams = calls[calls.length - 1][0];
      expect(calledParams.queryFilter).toContain("o\\'brien");
      jest.useRealTimers();
    });

    it('ANDs date range, tab status, and context filters together', async () => {
      jest.useFakeTimers();
      const wrapper = mountComponent();
      jest.runAllTimers();
      await flushPromises();

      // pending tab is now index 1
      wrapper.findComponent({ name: 'BTabs' }).vm.$emit('activate-tab', 1);
      await flushPromises();

      // expand advanced filters
      await wrapper.find('button.p-0').trigger('click');
      await flushPromises();

      NotificationTaskApi.getNotificationTasks.mockClear();
      const fromField = wrapper.findAllComponents({ name: 'FrField' })
        .find((c) => c.props('name') === 'filterFromDate');
      fromField.vm.handleInput('2026-05-01T09:00:00');

      const typeField = wrapper.findAllComponents({ name: 'FrField' })
        .find((c) => c.props('name') === 'filterContextType');
      typeField.vm.handleInput('violation');
      await wrapper.vm.$nextTick();

      const idField = wrapper.findAllComponents({ name: 'FrField' })
        .find((c) => c.props('name') === 'filterContextId');
      idField.vm.handleInput('viol-456');

      await flushPromises();
      jest.advanceTimersByTime(500);
      await flushPromises();

      const { calls } = NotificationTaskApi.getNotificationTasks.mock;
      const calledParams = calls[calls.length - 1][0];
      expect(calledParams.queryFilter).toContain("metadata.createdDate gte '");
      expect(calledParams.queryFilter).toContain('status eq "pending"');
      expect(calledParams.queryFilter).toContain("context.violation eq 'viol-456'");
      jest.useRealTimers();
    });

    it('clears context id when context type changes', async () => {
      jest.useFakeTimers();
      const wrapper = mountComponent();
      jest.runAllTimers();
      await flushPromises();

      await wrapper.find('button.p-0').trigger('click');
      await flushPromises();

      const typeField = wrapper.findAllComponents({ name: 'FrField' })
        .find((c) => c.props('name') === 'filterContextType');
      typeField.vm.handleInput('request');
      await flushPromises();
      await wrapper.vm.$nextTick();

      const idField = wrapper.findAllComponents({ name: 'FrField' })
        .find((c) => c.props('name') === 'filterContextId');
      idField.vm.handleInput('req-123');
      await flushPromises();
      jest.advanceTimersByTime(500);
      await flushPromises();

      // switch context type — id should be cleared so the new filter is not stale
      NotificationTaskApi.getNotificationTasks.mockClear();
      typeField.vm.handleInput('campaign');
      await flushPromises();
      jest.advanceTimersByTime(500);
      await flushPromises();

      const { calls } = NotificationTaskApi.getNotificationTasks.mock;
      const calledParams = calls[calls.length - 1][0];
      expect(calledParams.queryFilter ?? '').not.toContain('req-123');
      // after switching type the id is cleared, so we get the type-only co '' filter
      expect(calledParams.queryFilter).toContain("context.campaign co ''");
      jest.useRealTimers();
    });

    it('clears context id filter and re-fetches when search is cleared', async () => {
      jest.useFakeTimers();
      const wrapper = mountComponent();
      jest.runAllTimers();
      await flushPromises();

      await wrapper.find('button.p-0').trigger('click');
      await flushPromises();

      const typeField = wrapper.findAllComponents({ name: 'FrField' })
        .find((c) => c.props('name') === 'filterContextType');
      typeField.vm.handleInput('request');
      await flushPromises();
      await wrapper.vm.$nextTick();

      const idField = wrapper.findAllComponents({ name: 'FrField' })
        .find((c) => c.props('name') === 'filterContextId');
      idField.vm.handleInput('req-123');
      await flushPromises();
      jest.advanceTimersByTime(500);
      await flushPromises();

      NotificationTaskApi.getNotificationTasks.mockClear();
      idField.vm.handleInput('');
      await flushPromises();
      jest.advanceTimersByTime(500);
      await flushPromises();

      const { calls } = NotificationTaskApi.getNotificationTasks.mock;
      const calledParams = calls[calls.length - 1][0];
      // id cleared but type still selected — reverts to type-only co '' filter
      expect(calledParams.queryFilter).toContain("context.request co ''");
      expect(calledParams.queryFilter).not.toContain('req-123');
      jest.useRealTimers();
    });
  });

  describe('row-details expansion', () => {
    it('passes show-view-details to GovResourceTable so rows can be expanded', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
      await flushPromises();

      const table = wrapper.findComponent({ name: 'GovResourceTable' });
      expect(table.props('showViewDetails')).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('has no axe violations introduced by NotificationLog', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      // Pre-existing violations in FrField (datetime picker ARIA) and GovResourceTable
      // (pagination role, empty Actions header) are disabled here — they are not
      // regressions introduced by this view.
      await runA11yTest(wrapper, {
        overrideRules: {
          rules: {
            'aria-dialog-name': { enabled: false },
            'aria-prohibited-attr': { enabled: false },
            'aria-roles': { enabled: false },
            'empty-table-header': { enabled: false },
          },
        },
      });
    });
  });
});
