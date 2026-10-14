/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { DOMWrapper, flushPromises, mount } from '@vue/test-utils';
import { createAppContainer, toggleActionsMenu } from '@forgerock/platform-shared/src/utils/testHelpers';
import { cloneDeep } from 'lodash';
import dayjs from 'dayjs';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import { detailTypes } from '../../../utils/governance/AccessRequestUtils';
import Tasks from './Tasks';

const ITEM = {
  rawData: {
    decision: {
      actors: {
        active: [
          {
            givenName: 'Frank',
            id: 'managed/user/5c6670e2-4d94-441d-8a45-736f29ecf73d',
            mail: 'fyork@example.com',
            sn: 'York',
            userName: 'fyork',
          },
        ],
        inactive: [
          {
            id: 'managed/user/4f954458-769f-49d6-b506-52ee9990c51b',
            givenName: 'Audrey',
            mail: 'audrey.phillips@ulifereports.onmicrosoft.com',
            sn: 'Phillips',
            userName: 'audrey.phillips@ulifereports.onmicrosoft.com',
            phase: 'approvalTask-c7867dd2593a',
          },
        ],
      },
      phases: [
        {
          name: 'approvalTask-c7867dd2593a',
          displayName: 'Approval Task',
          type: 'request',
          status: 'complete',
          decision: 'approve',
          startDate: '2025-07-16T18:35:10+00:00',
          workflowTaskId: '17765',
          completedBy: {
            givenName: 'Audrey',
            id: 'managed/user/4f954458-769f-49d6-b506-52ee9990c51b',
            mail: 'audrey.phillips@ulifereports.onmicrosoft.com',
            sn: 'Phillips',
            userName: 'audrey.phillips@ulifereports.onmicrosoft.com',
          },
          completionDate: '2025-07-16T18:40:18+00:00',
          justification: 'Test',
        },
        {
          name: 'waitTask-4e25b1ee7a14',
          displayName: 'Wait Until Start Date',
          type: 'scheduled',
          status: 'in-progress',
          startDate: '2025-07-16T18:40:19+00:00',
          events: {
            scheduled: {
              date: '2025-07-17T06:00:00',
            },
          },
          workflowTaskId: '17784',
        },
      ],
    },
  },
};

const COMPLETED_REQUEST_ITEM = {
  rawData: {
    decision: {
      actors: {
        active: [],
        inactive: [
          {
            id: 'managed/user/4f954458-769f-49d6-b506-52ee9990c51b',
            givenName: 'Audrey',
            mail: 'audrey.phillips@ulifereports.onmicrosoft.com',
            sn: 'Phillips',
            userName: 'audrey.phillips@ulifereports.onmicrosoft.com',
            phase: 'approvalTask-c7867dd2593a',
          },
        ],
      },
      outcome: 'provisioned',
      phases: [
        {
          name: 'approvalTask-c7867dd2593a',
          displayName: 'Approval Task',
          type: 'request',
          status: 'complete',
          decision: 'approve',
          startDate: '2025-07-16T18:35:10+00:00',
          workflowTaskId: '17765',
          completedBy: {
            givenName: 'Audrey',
            id: 'managed/user/4f954458-769f-49d6-b506-52ee9990c51b',
            mail: 'audrey.phillips@ulifereports.onmicrosoft.com',
            sn: 'Phillips',
            userName: 'audrey.phillips@ulifereports.onmicrosoft.com',
          },
          completionDate: '2025-07-16T18:40:18+00:00',
          justification: 'Test',
        },
        {
          name: 'waitTask-4e25b1ee7a14',
          displayName: 'Wait Until Start Date',
          type: 'scheduled',
          status: 'complete',
          startDate: '2025-07-16T18:40:19+00:00',
          completionDate: '2025-07-17T06:00:00',
          completedBy: {
            id: 'SYSTEM',
          },
          workflowTaskId: '17784',
        },
      ],
    },
  },
};

let modalShow;
function setup(props) {
  ({ modalShow } = mockModal());
  return {
    wrapper: mount(Tasks, {
      attachTo: createAppContainer(),
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
      props: {
        item: ITEM,
        type: detailTypes.USER_REQUEST,
        ...props,
      },
    }),
    domWrapper: new DOMWrapper(document.body),
  };
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('Tasks', () => {
  it('Should renders table columns correctly', () => {
    const { wrapper } = setup();
    const columns = wrapper.findAll('th');
    expect(columns.length).toBe(3);
    expect(columns[0].text()).toBe('Task');
    expect(columns[1].text()).toBe('Approver(s)');
    expect(columns[2].text()).toBe('Status');
  });

  it('should call the appropriate method when opening task details modal', async () => {
    const { wrapper } = setup();
    await flushPromises();

    expect(modalShow).not.toHaveBeenCalled();

    wrapper.vm.showTaskDetailsModal(ITEM);
    await flushPromises();
    expect(modalShow).toHaveBeenCalledWith('TaskDetailsModal');
  });

  it('Should render wait date correctly', () => {
    const { wrapper } = setup();
    const smalls = wrapper.findAll('tr small');
    const date1 = smalls[0];
    // Completed approval task shows its completion date
    expect(date1.text()).toBe(dayjs('2025-07-16T18:40:18+00:00').format('MMM D, YYYY h:mm A'));

    const date2 = smalls[2];
    expect(date2.text()).toBe(`Until ${dayjs('2025-07-17T06:00:00').format('MMM D, YYYY h:mm A')}`);
  });

  it('Should render the completion date for a completed wait task', async () => {
    const { wrapper } = setup({ item: COMPLETED_REQUEST_ITEM });

    await flushPromises();

    const smalls = wrapper.findAll('tr small');
    expect(smalls[2].text()).toBe(dayjs('2025-07-17T06:00:00').format('MMM D, YYYY h:mm A'));
  });

  it('Should render the start date for a task without a completion date', async () => {
    const noCompletionDateItem = cloneDeep(ITEM);
    delete noCompletionDateItem.rawData.decision.phases[0].completionDate;
    const { wrapper } = setup({ item: noCompletionDateItem });

    await flushPromises();

    const smalls = wrapper.findAll('tr small');
    expect(smalls[0].text()).toBe(dayjs('2025-07-16T18:35:10+00:00').format('MMM D, YYYY h:mm A'));
  });

  it('Should not render dropdown menu for user requests', () => {
    const { wrapper } = setup();
    const dropdowns = wrapper.findAll('.dropdown-menu');
    expect(dropdowns.length).toBe(0);
  });

  it('Should render dropdown menus for admin requests', async () => {
    const { domWrapper } = setup({ type: detailTypes.ADMIN_REQUEST });

    await flushPromises();
    const actionsCellRows = domWrapper.findAll('td').filter((item) => item.classes().includes('sticky-right'));
    expect(actionsCellRows.length).toBe(2);

    await toggleActionsMenu(actionsCellRows[0]);
    const completedDropDown = domWrapper.findAll('[role="menuitem"]');
    expect(completedDropDown.length).toBe(1);
    expect(completedDropDown[0].text()).toContain('viewDetails');

    await toggleActionsMenu(actionsCellRows[0]);
    await toggleActionsMenu(actionsCellRows[1]);
    const activeDropdown = domWrapper.findAll('[role="menuitem"]');
    expect(activeDropdown.length).toBe(2);
    expect(activeDropdown[0].text()).toContain('viewDetails');
    expect(activeDropdown[1].text()).toContain('changeResumeDate');
  });

  it('table rows have tabindex="0" and aria-selected when selectable is set', async () => {
    const { wrapper } = setup();
    await flushPromises();
    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((row) => {
      expect(row.attributes('tabindex')).toBe('0');
      expect(row.attributes('aria-selected')).toBeDefined();
    });
  });

  it('opens task details modal when row-selected fires with an item', async () => {
    const { wrapper } = setup();
    await flushPromises();

    const table = wrapper.findComponent({ name: 'BTable' });
    await table.vm.$emit('row-selected', [wrapper.vm.tableData[0]]);

    expect(modalShow).toHaveBeenCalledWith('TaskDetailsModal');
  });

  it('does not open modal when row-selected fires with empty array', async () => {
    const { wrapper } = setup();
    await flushPromises();

    const table = wrapper.findComponent({ name: 'BTable' });
    await table.vm.$emit('row-selected', []);

    expect(modalShow).not.toHaveBeenCalled();
  });

  it('Should render action menu for admin requests with active approval', async () => {
    const activeApprovalItem = cloneDeep(ITEM);
    activeApprovalItem.rawData.decision.phases[0].status = 'in-progress';
    activeApprovalItem.rawData.decision.phases.splice(1, 1);
    const { domWrapper } = setup({ item: activeApprovalItem, type: detailTypes.ADMIN_REQUEST });

    await flushPromises();

    await toggleActionsMenu(domWrapper);
    const completedDropDown = domWrapper.findAll('[role="menuitem"]');
    expect(completedDropDown.length).toBe(5);
    expect(completedDropDown[0].text()).toContain('approve');
    expect(completedDropDown[1].text()).toContain('reject');
    expect(completedDropDown[2].text()).toContain('forward');
    expect(completedDropDown[3].text()).toContain('addComment');
    expect(completedDropDown[4].text()).toContain('viewDetails');
  });

  it('Should render the request outcome for a completed wait task instead of pending', async () => {
    const { wrapper } = setup({ item: COMPLETED_REQUEST_ITEM });

    await flushPromises();

    const badges = wrapper.findAll('.badge');
    expect(badges.length).toBe(2);
    expect(badges[0].text()).toBe('Approved');
    expect(badges[1].text()).toBe('Completed');
  });

  it('Should render an in-progress task with the warning variant', async () => {
    const { wrapper } = setup();

    await flushPromises();

    const badges = wrapper.findAll('.badge');
    expect(badges.length).toBe(2);
    expect(badges[0].classes()).toContain('badge-success');
    expect(badges[1].classes()).toContain('badge-warning');
  });

  it('Should leave the approvers column blank for a system task', async () => {
    const { wrapper } = setup({ item: COMPLETED_REQUEST_ITEM });

    await flushPromises();

    // Only the approval task renders an avatar; the wait task cell is blank
    const singleUserItems = wrapper.findAll('[data-testid="single-user-item"]');
    expect(singleUserItems.length).toBe(1);
    const approverCells = wrapper.findAll('tbody tr').map((row) => row.findAll('td')[1].text());
    expect(approverCells[0]).not.toBe('');
    expect(approverCells[1]).toBe('');
  });

  it('Should not render profile icon for a completed wait task without completedBy', async () => {
    const noCompletedByItem = cloneDeep(COMPLETED_REQUEST_ITEM);
    delete noCompletedByItem.rawData.decision.phases[1].completedBy;
    const { wrapper } = setup({ item: noCompletedByItem });

    await flushPromises();

    const avatarItems = wrapper.findAll('[data-testid="avatar-item"]');
    const singleUserItems = wrapper.findAll('[data-testid="single-user-item"]');
    expect(avatarItems.length).toBe(0);
    expect(singleUserItems.length).toBe(1);
  });

  it('opens task details modal with completed status for a completed wait task', async () => {
    const { wrapper } = setup({ item: COMPLETED_REQUEST_ITEM });
    await flushPromises();

    const table = wrapper.findComponent({ name: 'BTable' });
    await table.vm.$emit('row-selected', [wrapper.vm.tableData[1]]);

    expect(modalShow).toHaveBeenCalledWith('TaskDetailsModal');
    expect(wrapper.vm.taskDetails.completedBy).toEqual([{ id: 'SYSTEM' }]);
    expect(wrapper.vm.taskDetails.status).toBe('Completed');
    expect(wrapper.vm.taskDetails.statusBadge).toBe('success');
  });
});
