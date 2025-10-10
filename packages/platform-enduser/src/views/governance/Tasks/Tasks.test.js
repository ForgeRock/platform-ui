/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as fulfillmentTasks from '@forgerock/platform-shared/src/utils/governance/fulfillmentTasks';
import ResizableTable from '@forgerock/platform-shared/src/directives/ResizableTable/ResizableTable';
import { createRouter, createWebHistory } from 'vue-router';
import * as TasksApi from '@/api/governance/TasksApi';
import store from '@/store';
import i18n from '@/i18n';
import Tasks from './Tasks';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');
jest.mock('@forgerock/platform-shared/src/utils/governance/fulfillmentTasks');
fulfillmentTasks.buildTaskDisplay = jest.fn();
let modalShow;

const mountComponent = () => {
  ({ modalShow } = mockModal());
  setupTestPinia({ user: { userId: '1234' } });
  store.state.SharedStore.enableTableColumnResizing = false;

  // Create the app element for Teleport target
  if (!document.getElementById('app')) {
    const appDiv = document.createElement('div');
    appDiv.id = 'app';
    document.body.appendChild(appDiv);
  }

  // Create a mock router
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'Home', component: { template: '<div>Home</div>' } },
      { path: '/tasks/:taskId', name: 'TaskDetails', component: { template: '<div>TaskDetails</div>' } },
    ],
  });

  return mount(Tasks, {
    global: {
      plugins: [i18n, router],
      directives: {
        'resizable-table': ResizableTable,
      },
    },
  });
};

const mockRequest = {
  id: 3,
  decision: {
    status: 'in-progress',
    outcome: null,
    completionDate: null,
    deadline: null,
    comments: [],
    actors: {
      active: [
        {
          givenName: 'Manuel',
          id: 'managed/user/1234',
          mail: 'manuel.escobar@test.com',
          sn: 'Escobar',
          userName: 'manuel.escobar@test.com',
          phase: 'fulfillmentTask-7651340fcdfd',
        },
      ],
      inactive: [],
    },
    phases: [
      {
        name: 'fulfillmentTask-7651340fcdfd',
        displayName: 'Fulfillment Task Custom Name',
        type: 'fulfillment',
        status: 'in-progress',
        startDate: '2023-06-15T18:14:56+00:00',
      },
    ],
    startDate: '2023-06-22T19:23:26+00:00',
  },
  phases: [
    {
      name: 'fulfillmentTask-7651340fcdfd',
      type: 'fulfillment',
    },
  ],
};

describe('Tasks', () => {
  CommonsApi.getResource.mockReturnValue(Promise.resolve({}));
  fulfillmentTasks.buildTaskDisplay = jest.fn().mockReturnValue([{
    details: {
      id: 'task1',
      assignee: 'John Doe',
      name: 'Phase 1',
      priority: 'high',
      assignedDate: 'Jan 1, 2023',
    },
    rawData: mockRequest,
  }]);

  let wrapper;

  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
    TasksApi.getUserFulfillmentTasks = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {
          result: [mockRequest],
          totalCount: 1,
        },
      }),
    );
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  it('shows no data component when no tasks are found', async () => {
    TasksApi.getUserFulfillmentTasks = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {
          result: [],
          totalCount: 0,
        },
      }),
    );

    // Override the global mock to return empty array for this test
    fulfillmentTasks.buildTaskDisplay.mockReturnValue([]);

    wrapper = mountComponent();
    await flushPromises();

    // Check for the NoData component by name
    const noData = wrapper.findComponent({ name: 'NoData' });
    expect(noData.exists()).toBe(true);
    expect(noData.props('icon')).toBe('inbox');
  });

  it('sets page size and gets tasks based on event from pagination component', async () => {
    const getTasksSpy = jest.spyOn(TasksApi, 'getUserFulfillmentTasks').mockImplementation(() => Promise.resolve({
      data: {
        result: [
          {
            id: 'task1',
            phases: [{ name: 'phase1' }],
            decision: {
              phases: [{ name: 'phase1', displayName: 'Phase 1', startDate: '2023-01-01' }],
              actors: {
                active: [{
                  phase: 'phase1', givenName: 'John', sn: 'Doe', userName: 'jdoe',
                }],
                inactive: [],
              },
            },
            request: { common: { priority: 'high' } },
          },
        ],
        totalCount: 1,
      },
    }));

    wrapper = mountComponent();
    await flushPromises();

    // Clear the calls made during mount
    getTasksSpy.mockClear();

    const pagination = wrapper.findComponent({ name: 'Pagination' });
    pagination.vm.$emit('on-page-size-change', 2);
    await flushPromises();

    expect(wrapper.vm.pageSize).toBe(2);

    // Check the most recent call after the page size change
    const lastCall = getTasksSpy.mock.calls[getTasksSpy.mock.calls.length - 1];
    expect(lastCall[0]).toBe('1234');
    expect(lastCall[1]).toEqual(expect.objectContaining({
      _pagedResultsOffset: 0,
      _pageSize: 2,
      _sortKeys: 'decision.phases.startDate',
      _sortType: 'date',
      _sortDir: 'desc',
      actorStatus: 'active',
    }));
  });

  it('sets page and gets tasks based on event from pagination component', async () => {
    const getTasksSpy = jest.spyOn(TasksApi, 'getUserFulfillmentTasks');

    wrapper = mountComponent();
    await flushPromises();

    // Clear the calls made during mount
    getTasksSpy.mockClear();

    const pagination = wrapper.findComponent({ name: 'Pagination' });
    pagination.vm.$emit('input', 2);
    await flushPromises();

    expect(wrapper.vm.currentPage).toBe(2);

    // Check the most recent call after the page change
    const lastCall = getTasksSpy.mock.calls[getTasksSpy.mock.calls.length - 1];
    expect(lastCall[0]).toBe('1234');
    expect(lastCall[1]).toEqual(expect.objectContaining({
      _pagedResultsOffset: 10,
      _pageSize: 10,
      _sortKeys: 'decision.phases.startDate',
      _sortType: 'date',
      _sortDir: 'desc',
      actorStatus: 'active',
    }));
  });

  it('sets status and gets tasks based on event from toolbar', async () => {
    const getTasksSpy = jest.spyOn(TasksApi, 'getUserFulfillmentTasks');

    wrapper = mountComponent();
    await flushPromises();

    // Clear the calls made during mount
    getTasksSpy.mockClear();

    const toolbar = wrapper.findComponent({ name: 'RequestToolbar' });
    toolbar.vm.$emit('status-change', 'complete');
    await flushPromises();

    // Check the most recent call after the status change
    const lastCall = getTasksSpy.mock.calls[getTasksSpy.mock.calls.length - 1];
    expect(lastCall[0]).toBe('1234');
    expect(lastCall[1]).toEqual(expect.objectContaining({
      _pagedResultsOffset: 0,
      _pageSize: 10,
      _sortKeys: 'decision.phases.startDate',
      _sortType: 'date',
      _sortDir: 'desc',
      actorStatus: 'inactive',
    }));
  });

  it('sets tasks count to show in side nav bar badge', async () => {
    store.state.fulfillmentTasksCount = 0;
    const storeSpy = jest.spyOn(store, 'commit').mockImplementation();

    wrapper = mountComponent();
    await flushPromises();

    expect(storeSpy).toHaveBeenCalledWith('setFulfillmentTasksCount', 1);
  });

  it('opens request modal with type FULFILL', async () => {
    // Restore the original mock for this test that needs task data
    fulfillmentTasks.buildTaskDisplay.mockReturnValue([{
      details: {
        id: 'task1',
        assignee: 'John Doe',
        name: 'Phase 1',
        priority: 'high',
        assignedDate: 'Jan 1, 2023',
      },
      rawData: mockRequest,
    }]);

    wrapper = mountComponent();
    await flushPromises();

    wrapper.findComponent({ name: 'RequestActionsCell' }).vm.$emit('action', 'FULFILL');
    expect(wrapper.vm.modalType).toBe('FULFILL');
    expect(modalShow).toHaveBeenCalledWith('request_modal');
  });

  it('opens request modal with type DENY', async () => {
    // Restore the original mock for this test that needs task data
    fulfillmentTasks.buildTaskDisplay.mockReturnValue([{
      details: {
        id: 'task1',
        assignee: 'John Doe',
        name: 'Phase 1',
        priority: 'high',
        assignedDate: 'Jan 1, 2023',
      },
      rawData: mockRequest,
    }]);

    wrapper = mountComponent();
    await flushPromises();

    wrapper.findComponent({ name: 'RequestActionsCell' }).vm.$emit('action', 'DENY');
    expect(wrapper.vm.modalType).toBe('DENY');
    expect(modalShow).toHaveBeenCalledWith('request_modal');
  });
});
