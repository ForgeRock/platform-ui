/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { detailTypes } from '../../../utils/governance/AccessRequestUtils';
import Tasks from './Tasks';

jest.mock('@forgerock/platform-shared/src/composables/bvModal');

let wrapper;

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

function setup(props) {
  useBvModal.mockReturnValue({ bvModal: { value: { show: jest.fn(), hide: jest.fn() } } });
  return mount(Tasks, {
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
  });
}

describe('Tasks', () => {
  it('Should renders table columns correctly', () => {
    wrapper = setup();
    const columns = wrapper.findAll('th');
    expect(columns.length).toBe(3);
    expect(columns[0].text()).toBe('Task');
    expect(columns[1].text()).toBe('Approver(s)');
    expect(columns[2].text()).toBe('Status');
  });

  it('should call the appropriate method when opening task details modal', async () => {
    wrapper = setup();
    await flushPromises();

    const showSpy = jest.spyOn(wrapper.vm.bvModal.value, 'show');
    expect(showSpy).not.toHaveBeenCalled();

    wrapper.vm.showTaskDetailsModal(ITEM);
    await flushPromises();
    expect(showSpy).toHaveBeenCalledWith('TaskDetailsModal');
  });

  it('Should render wait date correctly', () => {
    wrapper = setup();
    const smalls = wrapper.findAll('tr small');
    const date1 = smalls[0];
    expect(date1.text()).toBe('Jul 16, 2025');

    const date2 = smalls[2];
    expect(date2.text()).toBe('Until Jul 17, 2025');
  });

  it('Should not render dropdown menu for user requests', () => {
    wrapper = setup();
    const dropdowns = wrapper.findAll('.dropdown-menu');
    expect(dropdowns.length).toBe(0);
  });

  it('Should render dropdown menus for admin requests', () => {
    wrapper = setup({ type: detailTypes.ADMIN_REQUEST });
    const dropdowns = wrapper.findAll('.dropdown-menu');
    expect(dropdowns.length).toBe(2);

    const completedDropDown = dropdowns[0].findAll('li');
    expect(completedDropDown.length).toBe(1);
    expect(completedDropDown[0].text()).toContain('viewDetails');

    const activeDropdown = dropdowns[1].findAll('li');
    expect(activeDropdown.length).toBe(2);
    expect(activeDropdown[0].text()).toContain('viewDetails');
    expect(activeDropdown[1].text()).toContain('changeResumeDate');
  });

  it('Should render action menu for admin requests with active approval', () => {
    const activeApprovalItem = cloneDeep(ITEM);
    activeApprovalItem.rawData.decision.phases[0].status = 'in-progress';
    activeApprovalItem.rawData.decision.phases.splice(1, 1);

    wrapper = setup({ item: activeApprovalItem, type: detailTypes.ADMIN_REQUEST });
    const dropdowns = wrapper.findAll('.dropdown-menu');
    expect(dropdowns.length).toBe(1);

    const completedDropDown = dropdowns[0].findAll('li');
    expect(completedDropDown.length).toBe(6);
    expect(completedDropDown[0].text()).toContain('approve');
    expect(completedDropDown[1].text()).toContain('reject');
    expect(completedDropDown[3].text()).toContain('forward');
    expect(completedDropDown[4].text()).toContain('addComment');
    expect(completedDropDown[5].text()).toContain('viewDetails');
  });
});
