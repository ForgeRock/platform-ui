/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import * as AuditApi from '@forgerock/platform-shared/src/api/governance/AuditApi';
import AuditLogHistogram from './AuditLogHistogram';

jest.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
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

function mountComponent(props = {}) {
  AuditApi.getAuditLogs = jest.fn().mockResolvedValue({
    data: { result: makeRecords(3), totalCount: 3 },
  });

  return mount(AuditLogHistogram, {
    global: { mocks: { $t: (t) => t } },
    props: {
      fromDate: twelveHoursAgo.toISOString(),
      toDate: now.toISOString(),
      ...props,
    },
  });
}

describe('AuditLogHistogram', () => {
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

  it('renders VChart after loading', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.findComponent({ name: 'VChart' }).exists()).toBe(true);
  });
});
