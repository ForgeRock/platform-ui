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
import * as AuditApi from '@forgerock/platform-shared/src/api/governance/AuditApi';
import * as downloadFileUtils from '@forgerock/platform-shared/src/utils/downloadFile';
import AuditLogTable from './AuditLogTable';

expect.extend(toHaveNoViolations);

const testRecords = [
  {
    id: 'record-1',
    actor: 'system',
    eventType: 'grant-entitlement',
    objectId: 'entitlementGrant',
    displayName: 'Request Type',
    objectType: 'Grant Entitlement',
    action: null,
    timestamp: '2026-06-03T13:20:22.893Z',
    objectDisplayName: '/requestType/iga',
    systemExecuted: 'false',
    changes: [{ field_name: '"displayName"', after_value: '"Grant Entitlement"' }],
    metadata: { createdDate: '2026-06-03T13:22:10.000Z', modifiedDate: '2026-06-03T13:22:10.000Z' },
  },
  {
    id: 'record-2',
    actor: 'admin@example.com',
    eventType: 'modify-user',
    objectId: 'modifyUser',
    displayName: 'Request Type',
    objectType: 'Modify User',
    action: null,
    timestamp: '2026-06-03T14:00:00.000Z',
    objectDisplayName: '/requestType/iga',
    systemExecuted: 'false',
    changes: [],
    metadata: { createdDate: '2026-06-03T14:00:01.000Z', modifiedDate: '2026-06-03T14:00:01.000Z' },
  },
];

function mountComponent(props = {}) {
  CommonsApi.getGlossarySchema = jest.fn().mockResolvedValue({ data: {} });
  AuditApi.getAuditLogs = jest.fn().mockResolvedValue({
    data: {
      result: testRecords,
      totalCount: testRecords.length,
      pagination: { searchAfter: [null] },
    },
  });

  setupTestPinia();
  return mount(AuditLogTable, {
    global: {
      plugins: [Notifications],
      mocks: { $t: (t) => t },
    },
    props,
  });
}

describe('AuditLogTable', () => {
  describe('table rendering', () => {
    it('renders GovResourceTable', () => {
      const wrapper = mountComponent();
      expect(wrapper.findComponent({ name: 'GovResourceTable' }).exists()).toBe(true);
    });

    it('calls getAuditLogs on load-data', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
      await flushPromises();

      expect(AuditApi.getAuditLogs).toHaveBeenCalled();
    });

    it('transforms records — formats timestamp and startCases eventType', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
      await flushPromises();

      const items = wrapper.findComponent({ name: 'GovResourceTable' }).props('items');
      expect(items[0].timestamp).toBe('Jun 03, 2026 1:20:22 PM');
      expect(items[0].eventType).toBe('Grant Entitlement');
    });

    it('passes totalCount to GovResourceTable', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
      await flushPromises();

      expect(wrapper.findComponent({ name: 'GovResourceTable' }).props('totalCount')).toBe(testRecords.length);
    });

    it('sets loading to false after successful fetch', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
      await flushPromises();

      expect(wrapper.findComponent({ name: 'GovResourceTable' }).props('loading')).toBe(false);
    });

    it('sets loading to false even when getAuditLogs throws', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      AuditApi.getAuditLogs = jest.fn().mockRejectedValue(new Error('network error'));
      wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
      await flushPromises();

      expect(wrapper.findComponent({ name: 'GovResourceTable' }).props('loading')).toBe(false);
    });
  });

  describe('filter interactions', () => {
    it('builds a date range filter from the filterFromDate field', async () => {
      jest.useFakeTimers();
      const wrapper = mountComponent();
      jest.runAllTimers();
      await flushPromises();

      AuditApi.getAuditLogs.mockClear();
      const fromField = wrapper.findAllComponents({ name: 'FrField' })
        .find((c) => c.props('name') === 'filterFromDate');
      fromField.vm.handleInput('2026-05-01T09:00:00');
      await flushPromises();
      jest.advanceTimersByTime(500);
      await flushPromises();

      const { calls } = AuditApi.getAuditLogs.mock;
      const calledParams = calls[calls.length - 1][0];
      expect(calledParams.startDate).toBe('2026-05-01T09:00:00.000Z');
      jest.useRealTimers();
    });

    it('builds an eventType filter', async () => {
      jest.useFakeTimers();
      const wrapper = mountComponent();
      jest.runAllTimers();
      await flushPromises();

      AuditApi.getAuditLogs.mockClear();
      const field = wrapper.findAllComponents({ name: 'FrField' })
        .find((c) => c.props('name') === 'filterEventType');
      field.vm.handleInput('grant-entitlement');
      await flushPromises();
      jest.advanceTimersByTime(500);
      await flushPromises();

      const { calls } = AuditApi.getAuditLogs.mock;
      const calledParams = calls[calls.length - 1][0];
      expect(calledParams.eventType).toBe('grant-entitlement');
      jest.useRealTimers();
    });

    it('sends actorType=system when system is selected in the actor type dropdown', async () => {
      jest.useFakeTimers();
      const wrapper = mountComponent();
      jest.runAllTimers();
      await flushPromises();

      AuditApi.getAuditLogs.mockClear();
      const field = wrapper.findAllComponents({ name: 'FrField' })
        .find((c) => c.props('name') === 'filterActorType');
      field.vm.handleInput('system');
      await flushPromises();
      jest.advanceTimersByTime(500);
      await flushPromises();

      const { calls } = AuditApi.getAuditLogs.mock;
      const calledParams = calls[calls.length - 1][0];
      expect(calledParams.actor).toBe('system');
      jest.useRealTimers();
    });

    it('applies actorId prop as a fixed filter', async () => {
      jest.useFakeTimers();
      const wrapper = mountComponent({ actorId: 'user-123' });
      jest.runAllTimers();
      await flushPromises();

      AuditApi.getAuditLogs.mockClear();
      wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
      await flushPromises();

      const calledParams = AuditApi.getAuditLogs.mock.calls[0][0];
      expect(calledParams.actor).toBe('user-123');
      jest.useRealTimers();
    });

    it('applies objectId prop as a fixed filter', async () => {
      jest.useFakeTimers();
      const wrapper = mountComponent({ objectId: 'obj-456' });
      jest.runAllTimers();
      await flushPromises();

      AuditApi.getAuditLogs.mockClear();
      wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
      await flushPromises();

      const calledParams = AuditApi.getAuditLogs.mock.calls[0][0];
      expect(calledParams.objectId).toBe('obj-456');
      jest.useRealTimers();
    });

    it('sends no actor filter when no actor type is selected', async () => {
      jest.useFakeTimers();
      const wrapper = mountComponent();
      jest.runAllTimers();
      await flushPromises();

      AuditApi.getAuditLogs.mockClear();
      wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', {});
      await flushPromises();

      const { calls } = AuditApi.getAuditLogs.mock;
      const calledParams = calls[calls.length - 1][0];
      expect(calledParams).not.toHaveProperty('actor');
      expect(calledParams).not.toHaveProperty('actorType');
      jest.useRealTimers();
    });
  });

  describe('pagination', () => {
    it('converts 0-based pageNumber to 1-based page param', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      AuditApi.getAuditLogs.mockClear();
      wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', { pageSize: 10, pageNumber: 0 });
      await flushPromises();

      const calledParams = AuditApi.getAuditLogs.mock.calls[0][0];
      expect(calledParams.page).toBe(1);
      expect(calledParams).not.toHaveProperty('pageNumber');
    });

    it('sends page=2 when pageNumber=1', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      AuditApi.getAuditLogs.mockClear();
      wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', { pageSize: 10, pageNumber: 1 });
      await flushPromises();

      const calledParams = AuditApi.getAuditLogs.mock.calls[0][0];
      expect(calledParams.page).toBe(2);
    });

    it('resets to page 1 when filters change', async () => {
      jest.useFakeTimers();
      const wrapper = mountComponent();
      jest.runAllTimers();
      await flushPromises();

      wrapper.findComponent({ name: 'GovResourceTable' }).vm.$emit('load-data', { pageSize: 10, pageNumber: 2 });
      await flushPromises();

      AuditApi.getAuditLogs.mockClear();
      const field = wrapper.findAllComponents({ name: 'FrField' })
        .find((c) => c.props('name') === 'filterActorType');
      field.vm.handleInput('system');
      await flushPromises();
      jest.advanceTimersByTime(500);
      await flushPromises();

      const calledParams = AuditApi.getAuditLogs.mock.calls[AuditApi.getAuditLogs.mock.calls.length - 1][0];
      expect(calledParams.page).toBe(1);
      jest.useRealTimers();
    });
  });

  describe('export', () => {
    it('calls getAllAuditLogs and downloadAsType on xlsx export', async () => {
      AuditApi.getAllAuditLogs = jest.fn().mockResolvedValue(testRecords);
      const downloadSpy = jest.spyOn(downloadFileUtils, 'downloadAsType').mockImplementation(() => {});

      const wrapper = mountComponent();
      await flushPromises();

      const xlsxButton = wrapper.findAll('button').find((b) => b.text().includes('governance.audit.exportXlsx'));
      await xlsxButton.trigger('click');
      await flushPromises();

      expect(AuditApi.getAllAuditLogs).toHaveBeenCalled();
      expect(downloadSpy).toHaveBeenCalledWith(expect.any(Array), 'xlsx', expect.stringContaining('xlsx'), expect.any(String));
      downloadSpy.mockRestore();
    });

    it('calls getAllAuditLogs and downloadAsType on pdf export', async () => {
      AuditApi.getAllAuditLogs = jest.fn().mockResolvedValue(testRecords);
      const downloadSpy = jest.spyOn(downloadFileUtils, 'downloadAsType').mockImplementation(() => {});

      const wrapper = mountComponent();
      await flushPromises();

      const pdfButton = wrapper.findAll('button').find((b) => b.text().includes('governance.audit.exportPdf'));
      await pdfButton.trigger('click');
      await flushPromises();

      expect(downloadSpy).toHaveBeenCalledWith(expect.any(Array), 'pdf', expect.stringContaining('pdf'), expect.any(String));
      downloadSpy.mockRestore();
    });
  });

  describe('row-details expansion', () => {
    it('passes showViewDetails prop to GovResourceTable', () => {
      const wrapper = mountComponent();
      expect(wrapper.findComponent({ name: 'GovResourceTable' }).props('showViewDetails')).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      await runA11yTest(wrapper, {
        overrideRules: {
          rules: {
            'aria-prohibited-attr': { enabled: false },
            'aria-roles': { enabled: false },
            'empty-table-header': { enabled: false },
          },
        },
      });
    });
  });
});
