/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { defineComponent, h } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import * as AuditApi from '@forgerock/platform-shared/src/api/governance/AuditApi';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import AuditLogHistogram from './AuditLogHistogram';

jest.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key, params) => (params ? `${key}:${params.label}:${params.count}` : key),
  }),
}));

jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  showErrorMessage: jest.fn(),
}));

const now = new Date('2026-06-04T12:00:00.000Z');
const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

const makeRecords = (count) => Array.from({ length: count }, (_, i) => ({
  id: `r-${i}`,
  timestamp: new Date(twelveHoursAgo.getTime() + i * 1000).toISOString(),
}));

const chart = {
  on: jest.fn(),
  off: jest.fn(),
};

const VChartStub = defineComponent({
  name: 'VChart',
  setup(_, { expose }) {
    expose({ chart });
    return () => h('div');
  },
});

function mountComponent(props = {}) {
  AuditApi.getAuditLogs = jest.fn().mockResolvedValue({
    data: { result: makeRecords(3), totalCount: 3 },
  });

  return mount(AuditLogHistogram, {
    global: {
      mocks: { $t: (t, params) => (params ? `${t}:${params.label}:${params.count}` : t) },
      stubs: { VChart: VChartStub },
    },
    props: {
      fromDate: twelveHoursAgo.toISOString(),
      toDate: now.toISOString(),
      ...props,
    },
  });
}

describe('AuditLogHistogram', () => {
  beforeEach(() => {
    chart.on.mockClear();
    chart.off.mockClear();
  });
  it('calls getAuditLogs on mount with the fromDate/toDate as a filter', async () => {
    mountComponent();
    await flushPromises();

    expect(AuditApi.getAuditLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
        endDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
        pageSize: 1000,
        page: 1,
      }),
    );
  });

  it('does not call getAuditLogs when fromDate is empty', async () => {
    AuditApi.getAuditLogs = jest.fn();
    mount(AuditLogHistogram, {
      global: { mocks: { $t: (t) => t } },
      props: { fromDate: '', toDate: '' },
    });
    await flushPromises();

    expect(AuditApi.getAuditLogs).not.toHaveBeenCalled();
  });

  it('reloads data when fromDate prop changes', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    AuditApi.getAuditLogs.mockClear();
    const newFrom = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
    await wrapper.setProps({ fromDate: newFrom });
    await flushPromises();

    expect(AuditApi.getAuditLogs).toHaveBeenCalledTimes(1);
    expect(AuditApi.getAuditLogs.mock.calls[0][0].startDate).toBe(new Date(newFrom).toISOString());
  });

  it('uses daily buckets when range exceeds 48 hours', async () => {
    const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    mountComponent({ fromDate: from, toDate: now.toISOString() });
    await flushPromises();

    // 7 days → daily buckets; we just verify the API was called correctly
    expect(AuditApi.getAuditLogs).toHaveBeenCalled();
  });

  it('includes the queryFilter prop in the request', async () => {
    mountComponent({ queryFilter: "actor eq 'user-123'" });
    await flushPromises();

    expect(AuditApi.getAuditLogs.mock.calls[0][0].queryFilter).toBe("actor eq 'user-123'");
  });

  it('registers a click handler on the chart instance', async () => {
    mountComponent();
    await flushPromises();

    expect(chart.off).toHaveBeenCalledWith('click', expect.any(Function));
    expect(chart.on).toHaveBeenCalledWith('click', expect.any(Function));
    expect(chart.off.mock.calls[0][1]).toBe(chart.on.mock.calls[0][1]);
  });

  it('emits the selected hourly bucket range from chart clicks', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const handler = chart.on.mock.calls[0][1];

    handler({ dataIndex: 2 });

    expect(wrapper.emitted('bar-click')).toEqual([[
      {
        fromDate: new Date(twelveHoursAgo.getTime() + 60 * 60 * 1000).toISOString(),
        toDate: new Date(twelveHoursAgo.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      },
    ]]);
  });

  it('emits the selected daily bucket range from chart clicks', async () => {
    const from = new Date('2026-06-01T00:00:00.000Z');
    const to = new Date('2026-06-08T00:00:00.000Z');
    const wrapper = mountComponent({ fromDate: from.toISOString(), toDate: to.toISOString() });
    await flushPromises();
    const handler = chart.on.mock.calls[0][1];

    handler({ dataIndex: 2 });

    expect(wrapper.emitted('bar-click')).toEqual([[
      {
        fromDate: '2026-06-03T00:00:00.000Z',
        toDate: '2026-06-04T00:00:00.000Z',
      },
    ]]);
  });

  it('does not emit when a chart click has no matching bucket', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const handler = chart.on.mock.calls[0][1];

    handler({ dataIndex: 99 });

    expect(wrapper.emitted('bar-click')).toBeUndefined();
  });

  it('does not have accessibility violations', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    await runA11yTest(wrapper);
  });

  it('renders VChart after loading', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.findComponent({ name: 'VChart' }).exists()).toBe(true);
  });
});
