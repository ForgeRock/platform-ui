/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as TasksApi from '@/api/governance/TasksApi';
import * as store from '@/store';
import i18n from '@/i18n';
import Tasks from './Tasks';

jest.mock('@forgerock/platform-shared/src/composables/bvModal');
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

const mountComponent = () => {
  const bvModalOptions = { show: jest.fn(), hide: jest.fn() };
  useBvModal.mockReturnValue({ bvModal: { value: bvModalOptions, ...bvModalOptions } });
  setupTestPinia({ user: { userId: '1234' } });
  return mount(Tasks, {
    global: {
      plugins: [i18n],
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

describe('Approvals', () => {
  CommonsApi.getResource.mockReturnValue(Promise.resolve({}));
  let wrapper;

  beforeEach(() => {
    TasksApi.getUserFulfillmentTasks = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {
          result: [mockRequest],
          totalCount: 1,
        },
      }),
    );
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

    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.find('.fr-no-data').text()).toBe('inboxNo Tasks');
  });

  it('sets page size and gets approvals based on event from pagination component', async () => {
    wrapper = mountComponent();
    await flushPromises();
    const getTasksSpy = jest.spyOn(TasksApi, 'getUserFulfillmentTasks');

    const pagination = wrapper.findComponent({ name: 'Pagination' });
    pagination.vm.$emit('on-page-size-change', 2);
    expect(wrapper.vm.pageSize).toBe(2);
    expect(getTasksSpy).toHaveBeenCalledWith(
      '1234',
      {
        _pagedResultsOffset: 0,
        _pageSize: 2,
        _sortKeys: 'decision.phases.startDate',
        _sortType: 'date',
        _sortDir: 'desc',
        actorStatus: 'active',
      },
      {
        operator: 'AND',
        operand: [],
      },
    );
  });

  it('sets page and gets tasks based on event from pagination component', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const getTasksSpy = jest.spyOn(TasksApi, 'getUserFulfillmentTasks');

    const pagination = wrapper.findComponent({ name: 'Pagination' });
    pagination.vm.$emit('input', 2);
    expect(wrapper.vm.currentPage).toBe(2);
    expect(getTasksSpy).toHaveBeenCalledWith(
      '1234',
      {
        _pagedResultsOffset: 10,
        _pageSize: 10,
        _sortKeys: 'decision.phases.startDate',
        _sortType: 'date',
        _sortDir: 'desc',
        actorStatus: 'active',
      },
      {
        operator: 'AND',
        operand: [],
      },
    );
  });

  it('sets status and gets tasks based on event from toolbar', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const getTasksSpy = jest.spyOn(TasksApi, 'getUserFulfillmentTasks');

    const toolbar = wrapper.findComponent({ name: 'RequestToolbar' });
    toolbar.vm.$emit('status-change', 'complete');
    expect(getTasksSpy).toHaveBeenCalledWith(
      '1234',
      {
        _pagedResultsOffset: 0,
        _pageSize: 10,
        _sortKeys: 'decision.phases.startDate',
        _sortType: 'date',
        _sortDir: 'desc',
        actorStatus: 'inactive',
      },
      {
        operator: 'AND',
        operand: [],
      },
    );
  });

  it('sets tasks count to show in side nav bar badge', async () => {
    store.default.replaceState({
      fulfillmentTasksCount: 0,
    });
    const storeSpy = jest.spyOn(store.default, 'commit').mockImplementation();

    wrapper = mountComponent();
    await flushPromises();

    expect(storeSpy).toHaveBeenCalledWith('setFulfillmentTasksCount', 1);
  });

  it('opens request modal with type FULFILL', async () => {
    wrapper = mountComponent();
    const showModalSpy = jest.spyOn(wrapper.vm.bvModal, 'show');
    await flushPromises();

    wrapper.findComponent({ name: 'RequestActionsCell' }).vm.$emit('action', 'FULFILL');
    expect(wrapper.vm.modalType).toBe('FULFILL');
    expect(showModalSpy).toHaveBeenCalledWith('request_modal');
  });

  it('opens request modal with type DENY', async () => {
    wrapper = mountComponent();
    const showModalSpy = jest.spyOn(wrapper.vm.bvModal, 'show');
    await flushPromises();

    wrapper.findComponent({ name: 'RequestActionsCell' }).vm.$emit('action', 'DENY');
    expect(wrapper.vm.modalType).toBe('DENY');
    expect(showModalSpy).toHaveBeenCalledWith('request_modal');
  });
});
