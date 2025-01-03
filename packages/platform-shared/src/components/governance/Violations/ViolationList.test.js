/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import * as ViolationApi from '@forgerock/platform-shared/src/api/governance/ViolationApi';
import * as Notification from '@forgerock/platform-shared/src/utils/notification';
import dayjs from 'dayjs';
import ViolationList from './ViolationList';
import i18n from '@/i18n';
import * as store from '@/store';

jest.mock('@forgerock/platform-shared/src/composables/bvModal');
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');
CommonsApi.getResource.mockReturnValue(Promise.resolve({
  data: {
    result: [{ givenName: 'firstName', sn: 'lastName', id: 'userId' }],
  },
}));

describe('ViolationList', () => {
  const defaultProps = {
    policyRuleOptions: ['ruleOne'],
    isAdmin: true,
  };
  function mountComponent(props = {}) {
    const bvModalOptions = { show: jest.fn(), hide: jest.fn() };
    useBvModal.mockReturnValue({ bvModal: { value: bvModalOptions, ...bvModalOptions } });
    const wrapper = mount(ViolationList, {
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
      tableRows: [{}],
    });

    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const itemCells = table.findAll('tbody td');
    const actionCell = itemCells.at(4);
    expect(actionCell.text()).toBe('more_horizredoForward');
  });

  it('should hide actions in admin when status is complete', async () => {
    const wrapper = mountComponent({
      tableRows: [{}],
    });
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
    const table = wrapper.findComponent('.table-responsive');
    const itemCells = table.findAll('tbody td');
    const actionCell = itemCells.at(3);
    expect(actionCell.text()).toBe('');
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

  it('add fixed with of 120px to actions column when is admin', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const columns = table.findAll('[role=columnheader]');
    expect(columns[4].classes()).toContain('w-120px');
  });

  it('not to add fixed with to actions column when is not admin', async () => {
    const wrapper = mountComponent({ isAdmin: false });
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const columns = table.findAll('[role=columnheader]');
    expect(columns[3].classes()).not.toContain('w-120px');
  });

  it('should show dropdown options only for not pending violations', async () => {
    const tableRows = [
      {
        decision: {
          status: 'pending',
          startDate: '2024-05-13T23:12:21+00:00',
          phases: [
            {
              name: 'testPhase',
            },
          ],
        },
      },
      {
        decision: {
          status: 'in-progress',
          startDate: '2024-05-13T23:12:21+00:00',
          phases: [
            {
              name: 'testPhase-2',
            },
          ],
        },
      },
    ];
    const wrapper = mountComponent({ tableRows });
    await flushPromises();

    const table = wrapper.findComponent('.table-responsive');
    const rows = table.findAll('[role=row]');
    const dropdownInFirstViolation = rows[1].find('div.dropdown.b-dropdown.btn-group');
    const dropdownInSecondViolation = rows[2].find('div.dropdown.b-dropdown.btn-group');

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
            phases: [
              {
                name: 'testPhase',
              },
            ],
          },
          policyRule: {
            name: 'NoCustomerSupport',
          },
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
    expect(buttons.length).toBe(3);
    expect(buttons[0].text()).toBe('checkAllow');
    expect(buttons[1].text()).toBe('blockRevoke');
  });

  it('should show view details item on actions list when is not admin', async () => {
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
    const items = row.findAll('[role="menuitem"]');

    expect(items.length).toBe(2);
    expect(items[1].text()).toBe('list_altView Details');
  });

  it('emits viewViolationDetails event when a row is clicked', async () => {
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
    await row.trigger('click');

    expect(wrapper.emitted('viewViolationDetails')[0][0].id).toBe('002bd665-3946-465c-b444-de470fa04254');
  });

  it('emits viewViolationDetails event when view details button is clicked', async () => {
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
    const dropDownItems = row.findAll('.dropdown-item');
    await dropDownItems[1].trigger('click');

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
    expect(wrapper.vm.bvModal.show).toHaveBeenCalledWith('ExceptionModal');
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
    expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'Exception successfully allowed');
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
    expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'Exception successfully allowed');
    expect(wrapper.emitted('handle-search')).toBeTruthy();
    expect(storeSpy).not.toHaveBeenCalled();
  });

  it('should show error message when the exception modal emits action event and the api call fails', async () => {
    const error = new Error('ERROR');
    ViolationApi.allowException = jest.fn().mockImplementation(() => Promise.reject(error));
    const showErrorMessageSpy = jest.spyOn(Notification, 'showErrorMessage').mockImplementation(() => {});

    const wrapper = mountComponent({
      isAdmin: false,
      tableRows: [],
    });
    await flushPromises();

    const exceptionModal = wrapper.findComponent({ name: 'ExceptionModal' });
    exceptionModal.vm.$emit('action', {
      violationId: '002bd665-3946-465c-b444-de470fa04254',
      phaseId: 'testPhase',
      payload: 'test',
    });
    await flushPromises();

    expect(ViolationApi.allowException).toHaveBeenCalledWith('002bd665-3946-465c-b444-de470fa04254', 'testPhase', 'test');
    expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'There was an error allowing the exception');
  });

  it('should emit viewViolationDetails event when the exception modal emits view-violation-details', async () => {
    const wrapper = mountComponent({
      isAdmin: false,
      tableRows: [],
    });
    await flushPromises();

    const exceptionModal = wrapper.findComponent({ name: 'ExceptionModal' });
    exceptionModal.vm.$emit('view-violation-details', {
      id: '002bd665-3946-465c-b444-de470fa04254',
    });
    await flushPromises();

    expect(wrapper.emitted('viewViolationDetails')).toBeTruthy();
  });

  it('should rearrange columns based on event from column organizer', async () => {
    const wrapper = mountComponent({
      isTesting: true,
      tableRows: [],
    });
    await flushPromises();

    const activeColumns = [
      {
        key: 'policyRule',
        category: 'rule',
        label: i18n.global.t('governance.violations.rule'),
        show: true,
        sortable: true,
      },
      {
        key: 'user',
        category: 'user',
        label: i18n.global.t('common.user.user'),
        show: true,
        sortable: true,
      },
      {
        key: 'created',
        category: 'violation',
        class: 'w-150px',
        label: i18n.global.t('common.created'),
        show: false,
        sortable: true,
      },
      {
        key: 'actions',
        label: '',
        show: true,
      },
    ];

    const columnOrganizer = wrapper.findComponent('#ColumnOrganizerModal___BV_modal_outer_');
    columnOrganizer.vm.$emit('update-columns', { activeColumns });

    await flushPromises();
    const tableHeadings = wrapper.find('[role=table]').findAll('[role=columnheader]');
    expect(tableHeadings[0].text()).toBe('Rule (Click to sort ascending)');
    expect(tableHeadings[1].text()).toBe('User (Click to sort ascending)');
  });

  it('should emit revoke-violation event when the revoke button is clicked for a violation on the list', async () => {
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
    await buttons[1].trigger('click');

    expect(wrapper.emitted('revoke-violation')).toBeTruthy();
    expect(wrapper.emitted('revoke-violation')[0][0]).toEqual({
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
});
