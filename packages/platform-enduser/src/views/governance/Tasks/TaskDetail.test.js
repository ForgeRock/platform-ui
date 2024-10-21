/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as VueRouter from 'vue-router';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import i18n from '@/i18n';
import TaskDetail from './TaskDetail';
import * as TasksApi from '@/api/governance/TasksApi';

jest.mock('@forgerock/platform-shared/src/composables/bvModal');

const decision = {
  actors: {
    active: [
      {
        givenName: 'Manuel',
        id: 'managed/user/1234',
        mail: 'manuel.escobar@test.com',
        sn: 'Escobar',
        userName: 'manuel.escobar@test.com',
        phase: 'phase-name',
        permissions: {
          comment: true,
          modify: true,
          reassign: true,
          cancel: true,
          fulfill: true,
          deny: true,
        },
      },
    ],
    inactive: [],
  },
  comments: [],
  outcome: null,
  phases: [
    {
      name: 'phase-name',
      displayName: 'Phase Name',
      startDate: '2023-06-22T19:23:26+00:00',
    },
  ],
  startDate: '2023-06-22T19:23:26+00:00',
  status: 'in-progress',
};

const task = {
  decision,
  id: 1,
  request: {
    common: {
      endDate: '2023-07-15T19:23:26+00:00',
      priority: 'medium',
    },
  },
  phases: [
    {
      name: 'phase-name',
      permissions: {
        comment: true,
        modify: true,
        reassign: true,
        fulfill: true,
        deny: true,
      },
    },
  ],
};

jest.mock('vue-router');

describe('TaskDetail', () => {
  let wrapper;
  const setup = () => {
    const bvModalOptions = { show: jest.fn(), hide: jest.fn() };
    useBvModal.mockReturnValue({ bvModal: { value: bvModalOptions, ...bvModalOptions } });
    setupTestPinia({ user: { userId: '1234' } });
    return mount(TaskDetail, {
      global: {
        plugins: [i18n],
      },
    });
  };

  beforeEach(() => {
    VueRouter.useRoute.mockReturnValue({
      params: {
        taskId: 'testTaskId',
      },
    });
    TasksApi.getUserFulfillmentTasks = jest.fn().mockReturnValue(Promise.resolve({
      data: { result: [task] },
    }));
  });

  it('has header with task name and assignee', async () => {
    wrapper = setup();
    await flushPromises();
    expect(wrapper.text()).toMatch('Phase Name');
    expect(wrapper.text()).toMatch('Manuel Escobar');
  });

  it('will get task details for an active task', async () => {
    const taskSpy = jest.spyOn(TasksApi, 'getUserFulfillmentTasks');
    wrapper = setup();
    await flushPromises();

    expect(taskSpy).toHaveBeenCalledWith(
      '1234',
      {
        _action: 'search',
        actorStatus: 'active',
      },
      {
        operand: {
          targetName: 'id',
          targetValue: 'testTaskId',
        },
        operator: 'EQUALS',
      },
    );
  });

  it('will get task details for an inactive task if no active task is found', async () => {
    const taskSpy = jest.spyOn(TasksApi, 'getUserFulfillmentTasks').mockImplementation((userid, params) => {
      if (params.actorStatus === 'active') {
        return Promise.resolve({ data: { result: [] } });
      }
      return Promise.resolve({ data: { result: [task] } });
    });
    wrapper = setup();
    await flushPromises();

    expect(taskSpy).toHaveBeenCalledWith(
      '1234',
      {
        _action: 'search',
        actorStatus: 'inactive',
      },
      {
        operand: {
          targetName: 'id',
          targetValue: 'testTaskId',
        },
        operator: 'EQUALS',
      },
    );
  });

  it('shows task actions', async () => {
    wrapper = setup();
    await flushPromises();

    const actions = wrapper.findAll('button');
    expect(actions[0].text()).toMatch('Complete');
    expect(actions[1].text()).toMatch('Reject');
    expect(actions[2].text()).toMatch('Forward');
  });

  it('opens request modal with type FULFILL', async () => {
    wrapper = setup();
    const showModalSpy = jest.spyOn(wrapper.vm.bvModal, 'show');
    await flushPromises();

    wrapper.findComponent({ name: 'RequestActions' }).vm.$emit('action', 'FULFILL');
    expect(wrapper.vm.modalType).toBe('FULFILL');
    expect(showModalSpy).toHaveBeenCalledWith('request_modal');
  });

  it('opens request modal with type DENY', async () => {
    wrapper = setup();
    const showModalSpy = jest.spyOn(wrapper.vm.bvModal, 'show');
    await flushPromises();

    wrapper.findComponent({ name: 'RequestActions' }).vm.$emit('action', 'DENY');
    expect(wrapper.vm.modalType).toBe('DENY');
    expect(showModalSpy).toHaveBeenCalledWith('request_modal');
  });
});
