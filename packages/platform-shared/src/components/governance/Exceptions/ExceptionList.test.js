/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as ViolationApi from '@forgerock/platform-shared/src/api/governance/ViolationApi';
import * as Notification from '@forgerock/platform-shared/src/utils/notification';
import ExceptionList from './ExceptionList';
import i18n from '@/i18n';
import * as store from '@/store';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

CommonsApi.getResource.mockReturnValue(Promise.resolve({
  data: {
    result: [{ givenName: 'firstName', sn: 'lastName', id: 'userId' }],
  },
}));

describe('ExceptionList', () => {
  const defaultProps = {
    policyRuleOptions: ['ruleOne'],
    isAdmin: true,
  };
  function mountComponent(props = {}) {
    const wrapper = mount(ExceptionList, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...defaultProps,
        ...props,
      },
    });
    return wrapper;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows exceptions in a list with correct columns', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const columns = table.findAll('[role=columnheader]');

    expect(columns.length).toBe(6);
    expect(columns[0].text()).toBe('User (Click to sort ascending)');
    expect(columns[1].text()).toBe('Rule (Click to sort ascending)');
    expect(columns[2].text()).toBe('Initial Violation');
    expect(columns[3].text()).toBe('Latest Violation');
    expect(columns[4].text()).toBe('Expiration');
    expect(columns[5].text()).toBe('');
  });

  it('shows exceptions in a list with correct columns if is enduser', async () => {
    const wrapper = mountComponent({ isAdmin: false });
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const columns = table.findAll('[role=columnheader]');

    expect(columns.length).toBe(6);
    expect(columns[0].text()).toBe('User (Click to sort ascending)');
    expect(columns[1].text()).toBe('Rule (Click to sort ascending)');
    expect(columns[2].text()).toBe('Initial Violation');
    expect(columns[3].text()).toBe('Latest Violation');
    expect(columns[4].text()).toBe('Expiration');
    expect(columns[5].classes()).toContain('w-100px');
  });

  it('emits handle-search when filter is changed', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const filter = wrapper.findComponent('[role=toolbar]');
    filter.vm.$emit('input', {
      rule: 'testRule',
      user: 'testUser',
      searchValue: 'searchValue',
    });
    await flushPromises();

    expect(wrapper.emitted('handle-search')[2][1].operand).toEqual([
      {
        operator: 'EQUALS',
        operand: {
          targetName: 'decision.status',
          targetValue: 'exception',
        },
      },
      {
        operator: 'EQUALS',
        operand: { targetName: 'policyRule.id', targetValue: 'testRule' },
      },
      {
        operator: 'EQUALS',
        operand: { targetName: 'user.id', targetValue: 'testUser' },
      },
      {
        operator: 'OR',
        operand: [
          {
            operator: 'CONTAINS',
            operand: { targetName: 'user.userName', targetValue: 'searchValue' },
          },
          {
            operator: 'CONTAINS',
            operand: { targetName: 'user.givenName', targetValue: 'searchValue' },
          },
          {
            operator: 'CONTAINS',
            operand: { targetName: 'user.sn', targetValue: 'searchValue' },
          },
          {
            operator: 'CONTAINS',
            operand: { targetName: 'policyRule.name', targetValue: 'searchValue' },
          },
        ],
      },
    ]);
  });

  it('emits handle-search when sort-changed event is triggered', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    table.vm.$emit('sort-changed', { sortDesc: true, sortBy: 'name' });
    expect(wrapper.emitted('handle-search')[1][0]).toEqual({
      fields: 'id,user,policyRule,decision,stats',
      pageSize: 10,
      pagedResultsOffset: 0,
      sortDir: 'desc',
      sortKeys: 'decision.startDate',
    });
  });

  it('should forward the violation when the forward modal emits forward-item event and decrease the violations count value in the store', async () => {
    ViolationApi.forwardViolation = jest.fn().mockReturnValue(Promise.resolve());
    const displayNotificationSpy = jest.spyOn(Notification, 'displayNotification').mockImplementation(() => {});
    store.default.replaceState({
      violationsCount: 1,
    });
    const storeSpy = jest.spyOn(store.default, 'commit').mockImplementation();

    const wrapper = mountComponent({
      isAdmin: false,
      tableRows: [],
    });
    await flushPromises();

    wrapper.vm.selectedItem = {
      id: '002bd665-3946-465c-b444-de470fa04254',
      rawData: {
        decision: {
          phases: [
            {
              name: 'testPhase',
            },
          ],
        },
      },
    };

    const forwardModal = wrapper.findComponent({ name: 'ViolationForwardModal' });
    forwardModal.vm.$emit('forward-item', {
      actorId: 'test', comment: 'test',
    });
    await flushPromises();

    expect(ViolationApi.forwardViolation).toHaveBeenCalledWith('002bd665-3946-465c-b444-de470fa04254', 'testPhase', 'test', {
      allow: true, comment: true, exception: true, reassign: true, remediate: true,
    }, 'test');
    expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'Violation successfully forwarded');
    expect(storeSpy).toHaveBeenCalledWith('setViolationsCount', 0);
  });

  it('should extend exception when the exception modal emits action event and decrease the violations count on the store when the violation is allowed forever', async () => {
    ViolationApi.allowException = jest.fn().mockReturnValue(Promise.resolve());
    const displayNotificationSpy = jest.spyOn(Notification, 'displayNotification').mockImplementation(() => {});
    store.default.replaceState({
      violationsCount: 1,
    });
    const storeSpy = jest.spyOn(store.default, 'commit').mockImplementation();

    const wrapper = mountComponent({
      isAdmin: false,
      tableRows: [],
    });
    await flushPromises();

    const exceptionModal = wrapper.findComponent({ name: 'ExceptionModal' });
    exceptionModal.vm.$emit('action', {
      violationId: '002bd665-3946-465c-b444-de470fa04254',
      phaseId: 'testPhase',
      payload: {
        exceptionExpirationDate: null,
        comment: '',
      },
    });
    await flushPromises();

    expect(ViolationApi.allowException).toHaveBeenCalledWith('002bd665-3946-465c-b444-de470fa04254', 'testPhase', {
      exceptionExpirationDate: null,
      comment: '',
    });
    expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'Exception successfully extended');
    expect(wrapper.emitted('handle-search')).toBeTruthy();
    expect(storeSpy).toHaveBeenCalledWith('setViolationsCount', 0);
  });

  it('should extend exception when the exception modal emits action event and not decrease the violations count on the store when the violation is not allowed forever', async () => {
    ViolationApi.allowException = jest.fn().mockReturnValue(Promise.resolve());
    const displayNotificationSpy = jest.spyOn(Notification, 'displayNotification').mockImplementation(() => {});
    const storeSpy = jest.spyOn(store.default, 'commit').mockImplementation();

    const wrapper = mountComponent({
      isAdmin: false,
      tableRows: [],
    });
    await flushPromises();

    const exceptionModal = wrapper.findComponent({ name: 'ExceptionModal' });
    exceptionModal.vm.$emit('action', {
      violationId: '002bd665-3946-465c-b444-de470fa04254',
      phaseId: 'testPhase',
      payload: {
        exceptionExpirationDate: '2024-06-15',
        comment: 'test',
      },
    });
    await flushPromises();

    expect(ViolationApi.allowException).toHaveBeenCalledWith('002bd665-3946-465c-b444-de470fa04254', 'testPhase', {
      exceptionExpirationDate: '2024-06-15',
      comment: 'test',
    });
    expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'Exception successfully extended');
    expect(wrapper.emitted('handle-search')).toBeTruthy();
    expect(storeSpy).not.toHaveBeenCalled();
  });
});
