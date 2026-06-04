/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import { downloadAsType } from '@forgerock/platform-shared/src/utils/downloadFile';
import { displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import ImportHistory from './ImportHistory';

jest.mock('@/i18n', () => ({
  global: { t: (k, params) => (params ? `${k}:${JSON.stringify(params)}` : k) },
}));
jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');
jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  showErrorMessage: jest.fn(),
  displayNotification: jest.fn(),
}));
jest.mock('@forgerock/platform-shared/src/utils/downloadFile', () => ({
  downloadAsType: jest.fn(),
}));

function makeItem(overrides = {}) {
  return {
    id: 'upload-1',
    name: 'users.csv',
    uploadDate: '2026-01-15T10:00:00Z',
    context: {
      type: 'upload',
      applicationObjectType: 'User',
      extractions: [{
        extractionId: 'ext-1',
        metadata: {
          status: 'completed', inserted: 10, processed: 2, failed: 0,
        },
      }],
    },
    ...overrides,
  };
}

function setup(props = {}) {
  return mount(ImportHistory, {
    global: {
      mocks: { $t: (k) => k },
      directives: { 'b-tooltip': {} },
      stubs: {
        FrActionsCell: {
          template: '<div><slot name="custom-top-actions" /></div>',
        },
        ActionsCell: {
          template: '<div><slot name="custom-top-actions" /></div>',
        },
        FrIcon: { template: '<span><slot /></span>' },
        FrPagination: true,
        FrSpinner: true,
        BCard: { template: '<div><slot /><slot name="default" /></div>' },
        BCardHeader: { template: '<div><slot /></div>' },
        BTable: {
          name: 'BTable',
          template: `<div>
            <slot name="empty" v-if="!items || !items.length" />
            <slot name="table-busy" v-if="busy" />
            <template v-for="item in items" :key="item.id">
              <slot name="cell(status)" :item="item" />
              <slot name="cell(actions)" :item="item" />
              <slot name="cell(filename)" :item="item" />
            </template>
          </div>`,
          props: ['fields', 'items', 'busy', 'tbodyTrClass'],
          emits: ['row-clicked'],
        },
        BDropdownItem: { name: 'BDropdownItem', template: '<div @click="$emit(\'click\')"><slot /></div>' },
        BBadge: { template: '<span><slot /></span>' },
        BButton: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
      },
    },
    props: {
      applicationId: 'app-1',
      items: [],
      isLoading: false,
      currentPage: 1,
      perPage: 10,
      totalRows: 0,
      ...props,
    },
  });
}

describe('ImportHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ApplicationsApi.getApplicationUploadFailures.mockResolvedValue({
      data: { result: [], totalCount: 0 },
    });
  });

  afterAll(() => jest.restoreAllMocks());

  describe('@a11y', () => {
    it('has no accessibility violations', async () => {
      const wrapper = setup({ items: [makeItem()] });
      await flushPromises();
      await runA11yTest(wrapper);
    });
  });

  describe('@renders', () => {
    it('emits refresh when refresh button clicked', async () => {
      const wrapper = setup();
      await flushPromises();
      const btn = wrapper.find('button');
      await btn.trigger('click');
      expect(wrapper.emitted('refresh')).toBeTruthy();
    });

    it('shows empty slot when no items', async () => {
      const wrapper = setup({ items: [] });
      await flushPromises();
      const table = wrapper.findComponent({ name: 'BTable' });
      expect(table.exists()).toBe(true);
    });
  });

  describe('@actions', () => {
    it('getStatusVariant maps status strings to bootstrap variants', () => {
      const wrapper = setup();
      expect(wrapper.vm.getStatusVariant('completed')).toBe('success');
      expect(wrapper.vm.getStatusVariant('failed')).toBe('danger');
      expect(wrapper.vm.getStatusVariant('pending')).toBe('secondary');
      expect(wrapper.vm.getStatusVariant('processing')).toBe('warning');
      expect(wrapper.vm.getStatusVariant('unknown')).toBe('secondary');
    });

    it('isDeleteUpload returns true when context.type starts with delete-', () => {
      const wrapper = setup();
      expect(wrapper.vm.isDeleteUpload({ context: { type: 'delete-all' } })).toBe(true);
      expect(wrapper.vm.isDeleteUpload({ context: { type: 'upload' } })).toBe(false);
    });

    it('isCompleted returns true for completed status', () => {
      const wrapper = setup();
      expect(wrapper.vm.isCompleted(makeItem())).toBe(true);
      expect(wrapper.vm.isCompleted(makeItem({ context: { extractions: [{ metadata: { status: 'failed' } }] } }))).toBe(false);
    });

    it('capitalizeFirst uppercases first char and lowercases rest', () => {
      const wrapper = setup();
      expect(wrapper.vm.capitalizeFirst('COMPLETED')).toBe('Completed');
      expect(wrapper.vm.capitalizeFirst('failed')).toBe('Failed');
    });

    it('parseReasons returns array from JSON string', () => {
      const wrapper = setup();
      expect(wrapper.vm.parseReasons('["reason 1","reason 2"]')).toEqual(['reason 1', 'reason 2']);
    });

    it('parseReasons returns raw message when JSON parse fails', () => {
      const wrapper = setup();
      expect(wrapper.vm.parseReasons('plain error')).toEqual(['plain error']);
    });

    it('parseReasons returns empty array for null/undefined', () => {
      const wrapper = setup();
      expect(wrapper.vm.parseReasons(null)).toEqual([]);
      expect(wrapper.vm.parseReasons(undefined)).toEqual([]);
    });

    it('loads failures when viewFailures is called on a closed item', async () => {
      const wrapper = setup({ items: [makeItem()] });
      await flushPromises();

      const item = { ...makeItem(), _showDetails: false };
      await wrapper.vm.viewFailures(item);
      await flushPromises();

      expect(ApplicationsApi.getApplicationUploadFailures).toHaveBeenCalledWith('app-1', 'ext-1', expect.any(Object));
      expect(item._showDetails).toBe(true);
    });

    it('does not reload failures when viewFailures is called on an already-open item', async () => {
      const wrapper = setup();
      await flushPromises();

      const item = { ...makeItem(), _showDetails: true };
      await wrapper.vm.viewFailures(item);
      await flushPromises();

      expect(ApplicationsApi.getApplicationUploadFailures).not.toHaveBeenCalled();
      expect(item._showDetails).toBe(false);
    });

    it('calls getApplicationUploadFailures with pageSize 10000 and downloads a CSV when downloadFailures is clicked', async () => {
      ApplicationsApi.getApplicationUploadFailures.mockResolvedValue({
        data: {
          result: [
            { data: { firstName: 'John', age: '30' }, message: '["Invalid value"]' },
            { data: { firstName: 'Jane', age: '' }, message: '["Required field missing"]' },
          ],
        },
      });

      const item = makeItem();
      const wrapper = setup({ items: [item] });
      await flushPromises();

      await wrapper.vm.downloadFailures(item);
      await flushPromises();

      expect(ApplicationsApi.getApplicationUploadFailures).toHaveBeenCalledWith(
        'app-1',
        'ext-1',
        { pageSize: 10000 },
      );
      expect(downloadAsType).toHaveBeenCalledWith(
        [
          { firstName: 'John', age: '30', 'governance.importHistory.columns.failureReason': 'Invalid value' },
          { firstName: 'Jane', age: '', 'governance.importHistory.columns.failureReason': 'Required field missing' },
        ],
        'csv',
        'users.csv-failures.csv',
      );
    });

    it('does not call getApplicationUploadFailures when uploadId cannot be resolved', async () => {
      const item = makeItem({ context: { type: 'upload', extractions: [] } });
      const wrapper = setup({ items: [item] });
      await flushPromises();

      await wrapper.vm.downloadFailures(item);
      await flushPromises();

      expect(ApplicationsApi.getApplicationUploadFailures).not.toHaveBeenCalled();
      expect(downloadAsType).not.toHaveBeenCalled();
    });

    it('does not call downloadAsType when failures result is empty', async () => {
      ApplicationsApi.getApplicationUploadFailures.mockResolvedValue({
        data: { result: [] },
      });

      const item = makeItem();
      const wrapper = setup({ items: [item] });
      await flushPromises();

      await wrapper.vm.downloadFailures(item);
      await flushPromises();

      expect(downloadAsType).not.toHaveBeenCalled();
    });

    it('shows a warning notification when totalCount exceeds 10000', async () => {
      ApplicationsApi.getApplicationUploadFailures.mockResolvedValue({
        data: {
          result: [{ data: { firstName: 'John' }, message: '["error"]' }],
          totalCount: 10500,
        },
      });

      const item = makeItem();
      const wrapper = setup({ items: [item] });
      await flushPromises();

      await wrapper.vm.downloadFailures(item);
      await flushPromises();

      expect(displayNotification).toHaveBeenCalledWith(
        'warning',
        'governance.importHistory.downloadFailuresTruncated:{"count":500}',
      );
    });

    it('does not show a truncation warning when totalCount is within limit', async () => {
      ApplicationsApi.getApplicationUploadFailures.mockResolvedValue({
        data: {
          result: [{ data: { firstName: 'John' }, message: '["error"]' }],
          totalCount: 5000,
        },
      });

      const item = makeItem();
      const wrapper = setup({ items: [item] });
      await flushPromises();

      await wrapper.vm.downloadFailures(item);
      await flushPromises();

      expect(displayNotification).not.toHaveBeenCalled();
    });

    it('emits run-delete-detection from action cell click', async () => {
      const item = makeItem();
      const wrapper = setup({ items: [item] });
      await flushPromises();

      // The second BDropdownItem in the custom-top-actions slot triggers run-delete-detection.
      // BDropdownItem stubs render as <div @click="$emit('click')">; trigger click on the
      // component wrapper so the stub's $emit('click') fires and propagates to the parent handler
      const dropdownItems = wrapper.findAllComponents({ name: 'BDropdownItem' });
      const runBtn = dropdownItems.find((d) => d.text().includes('runDeleteDetection'));
      await runBtn.trigger('click');
      expect(wrapper.emitted('run-delete-detection')).toBeTruthy();
      expect(wrapper.emitted('run-delete-detection')[0][0]).toEqual(item);
    });
  });
});
