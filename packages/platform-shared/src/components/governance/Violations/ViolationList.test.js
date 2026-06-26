/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import { mockNotification } from '@forgerock/platform-shared/src/testing/utils/mockNotification';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as ViolationApi from '@forgerock/platform-shared/src/api/governance/ViolationApi';
import dayjs from 'dayjs';
import FrColumnPicker from '@forgerock/platform-shared/src/components/ColumnPicker/ColumnPicker';
import FrExceptionModal from '@forgerock/platform-shared/src/components/governance/Exceptions/ExceptionModal';
import FrViolationForwardModal from '@forgerock/platform-shared/src/components/governance/Violations/ViolationForwardModal';
import ViolationList from './ViolationList';
import i18n from '@/i18n';
import store from '@/store';

const notification = mockNotification();
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');
jest.mock('@/store', () => ({
  state: {
    SharedStore: {
      webStorageAvailable: true,
    },
    violationsCount: 10,
  },
  commit: jest.fn(),
}));

CommonsApi.getResource.mockReturnValue(Promise.resolve({
  data: {
    result: [{ givenName: 'firstName', sn: 'lastName', id: 'userId' }],
  },
}));

let modalShow;

describe('ViolationList', () => {
  const defaultProps = {
    policyRuleOptions: ['ruleOne'],
    isAdmin: true,
  };
  function mountComponent(props = {}) {
    ({ modalShow } = mockModal());
    const wrapper = mount(ViolationList, {
      global: {
        plugins: [i18n],
        directives: {
          'resizable-table': true,
        },
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
    const app = document.createElement('div');
    app.id = 'app';
    document.body.appendChild(app);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('shows violations in a list with correct columns when is Admin', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const columns = table.findAll('[role=columnheader]');

    expect(columns.length).toBe(5);
    expect(columns[0].text()).toBe('User (Click to sort ascending)');
    expect(columns[1].text()).toBe('Reviewer(s)');
    expect(columns[2].text()).toBe('Rule (Click to sort ascending)');
    expect(columns[3].text()).toBe('Created (Click to sort ascending)');
  });

  it('should show actions in admin when status is pending', async () => {
    const wrapper = mountComponent({
      tableRows: [{
        id: '1',
        decision: { status: 'pending' },
        user: { givenName: 'test', sn: 'user' },
        policyRule: { name: 'testRule' },
        reviewers: [],
      }],
    });

    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const itemCells = table.findAll('tbody td');
    const actionCell = itemCells.at(4);
    expect(actionCell.exists()).toBe(true);
  });

  it('should hide actions in admin when status is complete', async () => {
    const wrapper = mountComponent({
      tableRows: [{
        id: '1',
        decision: { status: 'pending' },
        user: { givenName: 'test', sn: 'user' },
        policyRule: { name: 'testRule' },
        reviewers: [],
      }],
    });
    await flushPromises();

    const filter = wrapper.findComponent({ name: 'ViolationToolbar' });
    await filter.vm.$emit('input', {
      status: 'complete',
      rule: '',
      user: '',
      startDate: '',
      endDate: '',
      searchValue: '',
    });

    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const columns = table.findAll('[role=columnheader]');
    // Should have 3 columns (User, Policy Rule, Created). Actions and Reviewers are removed by computed violationColumnsToShow
    expect(columns.length).toBe(3);
    expect(columns.find((c) => c.text().includes('Actions'))).toBeUndefined();
    expect(columns.find((c) => c.text().includes('Reviewer'))).toBeUndefined();
  });

  it('shows violations in a list with correct columns when is enduser', async () => {
    const wrapper = mountComponent({ isAdmin: false });
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const columns = table.findAll('[role=columnheader]');

    expect(columns.length).toBe(4);
    expect(columns[0].text()).toBe('User (Click to sort ascending)');
    expect(columns[1].text()).toBe('Rule (Click to sort ascending)');
    expect(columns[2].text()).toBe('Created (Click to sort ascending)');
  });

  it('does not use w-250px class on actions column when is admin', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const columns = table.findAll('[role=columnheader]');
    expect(columns[4].classes()).not.toContain('w-250px');
  });

  it('uses w-250px class on actions column when is not admin', async () => {
    const wrapper = mountComponent({ isAdmin: false });
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const columns = table.findAll('[role=columnheader]');
    expect(columns[3].classes()).toContain('w-250px');
  });

  it('should show dropdown options only for not pending violations', async () => {
    const tableRows = [
      {
        id: '1',
        decision: {
          status: 'pending',
          startDate: '2024-05-13T23:12:21+00:00',
          phases: [{ name: 'testPhase' }],
        },
        reviewers: [],
      },
      {
        id: '2',
        decision: {
          status: 'in-progress',
          startDate: '2024-05-13T23:12:21+00:00',
          phases: [{ name: 'testPhase-2' }],
        },
        reviewers: [],
      },
    ];
    const wrapper = mountComponent({ tableRows });
    await flushPromises();

    const table = wrapper.findComponent('.table-responsive');
    const rows = table.findAll('[role=row]');
    const dropdownInFirstViolation = rows[1].find('.menu-container');
    const dropdownInSecondViolation = rows[2].find('.menu-container');

    expect(dropdownInFirstViolation.exists()).toBe(false);
    expect(dropdownInSecondViolation.exists()).toBe(true);
  });

  it('emits handle-search when filter is changed including the endDate one day addition', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const filter = wrapper.findComponent('[role=toolbar]');
    filter.vm.$emit('input', {
      status: 'testStatus',
      rule: 'testRule',
      user: 'testUser',
      startDate: '',
      endDate: '12/12/2025',
      searchValue: 'searchValue',
    });
    await flushPromises();

    expect(wrapper.emitted('handle-search')[2][1].operand).toEqual([
      {
        operator: 'EQUALS',
        operand: {
          targetName: 'decision.status',
          targetValue: 'testStatus',
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
        operator: 'LTE',
        operand: { targetName: 'decision.startDate', targetValue: `${dayjs('12/12/2025').add(1, 'day').toISOString().split('.')[0]}+00:00` },
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

  it('includes actor status when searching for complete violations in enduser', async () => {
    const wrapper = mountComponent({ isAdmin: false });
    await flushPromises();
    const filter = wrapper.findComponent('[role=toolbar]');
    filter.vm.$emit('input', {
      status: 'complete',
      rule: '',
      user: '',
      startDate: '',
      endDate: '',
      searchValue: '',
    });
    await flushPromises();

    expect(wrapper.emitted('handle-search')[1][1].operand).toEqual([
      {
        operator: 'EQUALS',
        operand: {
          targetName: 'decision.status',
          targetValue: 'complete',
        },
      },
    ]);

    expect(wrapper.emitted('handle-search')[1][0]).toEqual({
      _fields: 'id,user,policyRule,decision',
      _pageSize: 10,
      _pagedResultsOffset: 0,
      _sortDir: 'desc',
      _sortKeys: 'decision.startDate',
      actorStatus: 'inactive',
    });
  });

  it('emits handle-search when sort-changed event is triggered', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    table.vm.$emit('sort-changed', { sortDesc: true, sortBy: 'name' });
    expect(wrapper.emitted('handle-search')[1][0]).toEqual({
      _fields: 'id,user,policyRule,decision',
      _pageSize: 10,
      _pagedResultsOffset: 0,
      _sortDir: 'desc',
      _sortKeys: 'decision.startDate',
    });
  });

  it('should show allow and revoke buttons when is not admin', async () => {
    const wrapper = mountComponent({
      isAdmin: false,
      tableRows: [
        {
          decision: {
            status: 'in-progress',
            startDate: '2024-05-13T23:12:21+00:00',
            phases: [{ name: 'testPhase' }],
          },
          policyRule: { name: 'NoCustomerSupport' },
          user: {
            givenName: 'Opal',
            sn: 'Millions',
            userName: 'Opal@IGATestQA.onmicrosoft.com',
          },
          reviewers: [],
          id: '002bd665-3946-465c-b444-de470fa04254',
        },
      ],
    });
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const rows = table.findAll('[role="row"]');
    const row = rows[1];
    const buttons = row.findAll('button');
    expect(buttons.length).toBe(3);
  });

  it('should show view details item on actions list when is not admin', async () => {
    const wrapper = mountComponent({
      isAdmin: false,
      tableRows: [
        {
          decision: {
            status: 'in-progress',
            startDate: '2024-05-13T23:12:21+00:00',
            phases: [{ name: 'testPhase' }],
          },
          policyRule: { name: 'NoCustomerSupport' },
          user: {
            givenName: 'Opal',
            sn: 'Millions',
            userName: 'Opal@IGATestQA.onmicrosoft.com',
          },
          reviewers: [],
          id: '002bd665-3946-465c-b444-de470fa04254',
        },
      ],
    });
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const rows = table.findAll('[role="row"]');
    const row = rows[1];
    const menuButton = row.find('button.dropdown-toggle');
    await menuButton.trigger('click');
    await flushPromises();
    const items = document.querySelectorAll('[role="menuitem"]');

    expect(items.length).toBe(2);
  });

  it('table rows have tabindex="0" and aria-selected when selectable is set', async () => {
    const tableRows = [
      {
        decision: {
          status: 'in-progress',
          startDate: '2024-05-13T23:12:21+00:00',
          phases: [{ name: 'testPhase' }],
        },
        policyRule: { name: 'NoCustomerSupport' },
        user: { givenName: 'Opal', sn: 'Millions', userName: 'Opal@IGATestQA.onmicrosoft.com' },
        id: '002bd665-3946-465c-b444-de470fa04254',
      },
    ];
    const wrapper = mountComponent({ isAdmin: false, tableRows });
    await flushPromises();
    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((row) => {
      expect(row.attributes('tabindex')).toBe('0');
      expect(row.attributes('aria-selected')).toBeDefined();
    });
  });

  it('emits viewViolationDetails event when row-selected fires with an item', async () => {
    const tableRows = [
      {
        decision: {
          status: 'in-progress',
          startDate: '2024-05-13T23:12:21+00:00',
          phases: [{ name: 'testPhase' }],
        },
        policyRule: { name: 'NoCustomerSupport' },
        user: {
          givenName: 'Opal',
          sn: 'Millions',
          userName: 'Opal@IGATestQA.onmicrosoft.com',
        },
        id: '002bd665-3946-465c-b444-de470fa04254',
      },
    ];
    const wrapper = mountComponent({ isAdmin: false, tableRows });
    await flushPromises();

    const table = wrapper.findComponent({ name: 'BTable' });
    await table.vm.$emit('row-selected', [wrapper.vm.items[0]]);

    expect(wrapper.emitted('viewViolationDetails')[0][0].id).toBe('002bd665-3946-465c-b444-de470fa04254');
  });

  it('does not emit viewViolationDetails when row-selected fires with empty array', async () => {
    const wrapper = mountComponent({ isAdmin: false, tableRows: [] });
    await flushPromises();

    const table = wrapper.findComponent({ name: 'BTable' });
    await table.vm.$emit('row-selected', []);

    expect(wrapper.emitted('viewViolationDetails')).toBeFalsy();
  });

  it('emits viewViolationDetails event when view details button is clicked', async () => {
    const wrapper = mountComponent({
      isAdmin: false,
      tableRows: [
        {
          decision: {
            status: 'in-progress',
            startDate: '2024-05-13T23:12:21+00:00',
            phases: [{ name: 'testPhase' }],
          },
          policyRule: { name: 'NoCustomerSupport' },
          user: {
            givenName: 'Opal',
            sn: 'Millions',
            userName: 'Opal@IGATestQA.onmicrosoft.com',
          },
          id: '002bd665-3946-465c-b444-de470fa04254',
        },
      ],
    });
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const rows = table.findAll('[role="row"]');
    const row = rows[1];
    const menuButton = row.find('button.dropdown-toggle');
    await menuButton.trigger('click');
    await flushPromises();
    const dropDownItems = document.querySelectorAll('.dropdown-item');
    dropDownItems[1].click();
    await flushPromises();

    expect(wrapper.emitted('viewViolationDetails')[0][0].id).toBe('002bd665-3946-465c-b444-de470fa04254');
  });

  it('should open the allow exception modal when the allow button for a violation on the list is clicked', async () => {
    const wrapper = mountComponent({
      isAdmin: false,
      tableRows: [
        {
          decision: {
            status: 'in-progress',
            startDate: '2024-05-13T23:12:21+00:00',
            phases: [
              {
                name: 'testPhase',
              },
            ],
          },
          policyRule: {
            name: 'NoCustomerSupport',
          },
          reviewers: [],
          user: {
            cn: 'Opal Millions',
            givenName: 'Opal',
            id: '4f268edd-fa51-412a-8168-1443b4ad8198',
            mail: 'Opal@IGATestQA.onmicrosoft.com',
            sn: 'Millions',
            userName: 'Opal@IGATestQA.onmicrosoft.com',
          },
          id: '002bd665-3946-465c-b444-de470fa04254',
        },
      ],
    });
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const rows = table.findAll('[role="row"]');
    const row = rows[1];
    const buttons = row.findAll('button');
    await buttons[0].trigger('click');

    expect(wrapper.vm.selectedViolation).toEqual({
      created: '2024-05-13T23:12:21+00:00',
      id: '002bd665-3946-465c-b444-de470fa04254',
      phaseId: 'testPhase',
      policyRule: {
        name: 'NoCustomerSupport',
      },
      rawData: {
        decision: {
          phases: [
            {
              name: 'testPhase',
            },
          ],
          startDate: '2024-05-13T23:12:21+00:00',
          status: 'in-progress',
        },
        id: '002bd665-3946-465c-b444-de470fa04254',
        policyRule: {
          name: 'NoCustomerSupport',
        },
        reviewers: [],
        user: {
          cn: 'Opal Millions',
          givenName: 'Opal',
          id: '4f268edd-fa51-412a-8168-1443b4ad8198',
          mail: 'Opal@IGATestQA.onmicrosoft.com',
          sn: 'Millions',
          userName: 'Opal@IGATestQA.onmicrosoft.com',
        },
      },
      reviewers: [],
      status: 'in-progress',
      user: {
        cn: 'Opal Millions',
        givenName: 'Opal',
        id: '4f268edd-fa51-412a-8168-1443b4ad8198',
        mail: 'Opal@IGATestQA.onmicrosoft.com',
        sn: 'Millions',
        userName: 'Opal@IGATestQA.onmicrosoft.com',
      },
    });
    expect(modalShow).toHaveBeenCalledWith('FrExceptionModal');
  });

  it('should extend exception when the exception modal emits action event and decrease the violations count on the store when the violation is allowed forever', async () => {
    ViolationApi.allowException = jest.fn().mockReturnValue(Promise.resolve());
    const displayNotificationSpy = jest.spyOn(notification, 'displayNotification');
    const wrapper = mountComponent({
      isAdmin: false,
      tableRows: [],
    });
    await flushPromises();

    const exceptionModal = wrapper.findComponent(FrExceptionModal);
    await exceptionModal.vm.$emit('action', {
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
    expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'Exception successfully allowed');
    expect(wrapper.emitted('handle-search')).toBeTruthy();
    expect(store.commit).toHaveBeenCalledWith('setViolationsCount', 9);
  });

  it('should extend exception when the exception modal emits action event and not decrease the violations count on the store when the violation is not allowed forever', async () => {
    ViolationApi.allowException = jest.fn().mockReturnValue(Promise.resolve());
    const displayNotificationSpy = jest.spyOn(notification, 'displayNotification');
    const wrapper = mountComponent({
      isAdmin: false,
      tableRows: [],
    });
    await flushPromises();

    const exceptionModal = wrapper.findComponent(FrExceptionModal);
    await exceptionModal.vm.$emit('action', {
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
    expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'Exception successfully allowed');
    expect(wrapper.emitted('handle-search')).toBeTruthy();
    expect(store.commit).not.toHaveBeenCalled();
  });

  it('should show error message when the exception modal emits action event and the api call fails', async () => {
    const error = new Error('ERROR');
    ViolationApi.allowException = jest.fn().mockImplementation(() => Promise.reject(error));
    const showErrorMessageSpy = jest.spyOn(notification, 'showErrorMessage');
    const wrapper = mountComponent({
      isAdmin: false,
      tableRows: [],
    });
    await flushPromises();

    const exceptionModal = wrapper.findComponent(FrExceptionModal);
    await exceptionModal.vm.$emit('action', {
      violationId: '002bd665-3946-465c-b444-de470fa04254',
      phaseId: 'testPhase',
      payload: 'test',
    });
    await flushPromises();

    expect(ViolationApi.allowException).toHaveBeenCalledWith('002bd665-3946-465c-b444-de470fa04254', 'testPhase', 'test');
    expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'There was an error allowing the exception');
  });

  it('should emit viewViolationDetails event when the exception modal emits viewViolationDetails', async () => {
    const wrapper = mountComponent({
      isAdmin: false,
      tableRows: [],
    });
    await flushPromises();

    const exceptionModal = wrapper.findComponent(FrExceptionModal);
    await exceptionModal.vm.$emit('viewViolationDetails', {
      id: '002bd665-3946-465c-b444-de470fa04254',
    });
    await flushPromises();

    expect(wrapper.emitted('viewViolationDetails')).toBeTruthy();
  });

  it('should rearrange columns based on event from column organizer', async () => {
    const wrapper = mountComponent({
      tableRows: [],
    });
    await flushPromises();

    const activeColumns = [
      {
        key: 'policyRule',
        category: 'rule',
        label: 'Rule',
        show: true,
        sortable: true,
      },
      {
        key: 'user',
        category: 'user',
        label: 'User',
        show: true,
        sortable: true,
      },
    ];

    const columnPicker = wrapper.findComponent(FrColumnPicker);
    await columnPicker.vm.$emit('apply', activeColumns);

    // activeColumns should include the preserved 'actions' column
    expect(wrapper.vm.activeColumns).toEqual([
      ...activeColumns,
      {
        key: 'actions',
        class: [{ 'w-250px bg-white': false }, 'w-120px fr-no-resize sticky-right'],
        label: 'Actions',
        show: true,
      },
    ]);
  });

  it('should emit revoke-violation event when the revoke button is clicked for a violation on the list', async () => {
    const wrapper = mountComponent({
      isAdmin: false,
      tableRows: [
        {
          decision: {
            status: 'in-progress',
            startDate: '2024-05-13T23:12:21+00:00',
            phases: [{ name: 'testPhase' }],
          },
          policyRule: { name: 'NoCustomerSupport' },
          user: {
            givenName: 'Opal',
            sn: 'Millions',
            userName: 'Opal@IGATestQA.onmicrosoft.com',
          },
          reviewers: [],
          id: '002bd665-3946-465c-b444-de470fa04254',
        },
      ],
    });
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const rows = table.findAll('[role="row"]');
    const row = rows[1];
    const buttons = row.findAll('button');
    await buttons[1].trigger('click');

    expect(wrapper.emitted('revoke-violation')).toBeTruthy();
    expect(wrapper.emitted('revoke-violation')[0][0].id).toEqual('002bd665-3946-465c-b444-de470fa04254');
  });

  it('should forward the violation when the forward modal emits forward-item event and decrease the violations count value in the store', async () => {
    ViolationApi.forwardViolation = jest.fn().mockReturnValue(Promise.resolve());
    const displayNotificationSpy = jest.spyOn(notification, 'displayNotification');
    const wrapper = mountComponent({
      isAdmin: false,
      tableRows: [],
    });
    await flushPromises();

    wrapper.vm.itemToForward = {
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

    const forwardModal = wrapper.findComponent(FrViolationForwardModal);
    await forwardModal.vm.$emit('forward-item', {
      actorId: 'test', comment: 'test',
    });
    await flushPromises();

    expect(ViolationApi.forwardViolation).toHaveBeenCalledWith('002bd665-3946-465c-b444-de470fa04254', 'testPhase', 'test', {
      allow: true, comment: true, exception: true, reassign: true, remediate: true,
    }, 'test');
    expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'Violation successfully forwarded');
    expect(store.commit).toHaveBeenCalledWith('setViolationsCount', 9);
  });
});
