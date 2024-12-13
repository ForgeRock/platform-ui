/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { findByTestId, findComponentByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { clone } from 'lodash';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { getRequestFilter } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import i18n from '@/i18n';
import router from '@/router';
import Approvals from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    consumer: {
      azure: {
        '2.0-azure': { id: 'azure.ad', displayName: 'azure', image: 'microsoft.svg' },
      },
    },
  }),
}));

CommonsApi.getIgaAccessRequest = jest.fn().mockImplementation(() => Promise.resolve({
  data: {
    requireRequestJustification: false,
    requireRejectJustification: false,
    requireApproveJustification: false,
    defaultApprover: '',
    allowSelfApproval: true,
  },
}));

AccessRequestApi.getRequestType = jest.fn().mockImplementation((value) => Promise.resolve({
  data: {
    id: value,
    displayName: `${value}-displayName`,
  },
}));

const mountComponent = () => {
  setupTestPinia({ user: { userId: '1234' } });
  return mount(Approvals, {
    global: {
      plugins: [i18n, router],
      mocks: {
        $store: {
          commit: jest.fn(),
          state: { SharedStore: { governanceEnabled: true } },
        },
      },
    },
  });
};

const actors = {
  active: [
    {
      id: 'managed/user/1234',
      permissions: {
        approve: true,
        cancel: true,
        comment: true,
        fulfill: true,
        modify: true,
        reassign: true,
        reject: true,
      },
    },
  ],
};

const mockRequest = {
  id: 3,
  requestType: 'applicationRemove',
  request: {
    common: {
      priority: 'high',
      endDate: '2023-07-15T19:23:26+00:00',
    },
  },
  requester: {
    mail: 'mike.wong@test.com',
    givenName: 'Mike',
    sn: 'Wong',
    id: '1234-456-1',
    userName: 'mike.wong@test.com',
  },
  user: {
    mail: 'andrew.hertel@test.com',
    givenName: 'Andrew',
    sn: 'Hertel',
    id: '1234-456-2',
    userName: 'andrew.hertel@test.com',
  },
  decision: {
    status: 'in-progress',
    outcome: null,
    completionDate: null,
    deadline: null,
    comments: [],
    actors,
    phases: [
      {
        name: 'userApprove',
        type: 'request',
        status: 'in-progress',
        decision: null,
        startDate: '2023-06-15T18:14:56+00:00',
        events: {
          assignment: {
            notification: 'requestAssigned',
          },
          reassign: {
            notification: 'requestReassign',
          },
        },
        workflowTaskId: '2511',
      },
    ],
    startDate: '2023-06-22T19:23:26+00:00',
  },
  application: {
    description: 'My Azure App',
    icon: '',
    id: '2',
    name: 'My Azure App',
    templateName: 'azure.ad',
    templateVersion: '2.0',
  },
};

const openModalMock = {
  itemName: 'Remove Application: My Azure App',
  details: {
    date: 'Jun 22, 2023',
    description: 'My Azure App',
    icon: 'https://cdn.forgerock.com/platform/app-templates/images/microsoft.svg',
    id: 3,
    name: 'My Azure App',
    priority: 'high',
    requestedBy: 'Mike Wong',
    requestedFor: 'Andrew Hertel',
    type: 'Remove Application',
  },
  rawData: {
    application: {
      description: 'My Azure App',
      icon: '',
      id: '2',
      name: 'My Azure App',
      templateName: 'azure.ad',
      templateVersion: '2.0',
    },
    decision: {
      comments: [],
      actors,
      completionDate: null,
      deadline: null,
      outcome: null,
      phases: [
        {
          decision: null,
          events: {
            assignment: { notification: 'requestAssigned' },
            reassign: { notification: 'requestReassign' },
          },
          name: 'userApprove',
          startDate: '2023-06-15T18:14:56+00:00',
          status: 'in-progress',
          type: 'request',
          workflowTaskId: '2511',
        },
      ],
      startDate: '2023-06-22T19:23:26+00:00',
      status: 'in-progress',
    },
    id: 3,
    request: {
      common: {
        endDate: '2023-07-15T19:23:26+00:00',
        priority: 'high',
      },
    },
    requestType: 'applicationRemove',
    requestTypeDisplayName: 'applicationRemove-displayName',
    requester: {
      givenName: 'Mike',
      id: '1234-456-1',
      mail: 'mike.wong@test.com',
      sn: 'Wong',
      userName: 'mike.wong@test.com',
    },
    user: {
      givenName: 'Andrew',
      id: '1234-456-2',
      mail: 'andrew.hertel@test.com',
      sn: 'Hertel',
      userName: 'andrew.hertel@test.com',
    },
  },
};

describe('Approvals', () => {
  CommonsApi.getResource.mockReturnValue(Promise.resolve({}));
  let wrapper;

  it('shows no data component when no requests are found', async () => {
    AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {
          result: [],
          totalCount: 0,
        },
      }),
    );

    wrapper = mountComponent();
    await flushPromises();

    const noData = findByTestId(wrapper, 'approvals-no-data');
    expect(noData.exists()).toBeTruthy();
  });

  it('shows pagination component when there is at least one request found', async () => {
    AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {
          result: [mockRequest],
          totalCount: 1,
        },
      }),
    );

    wrapper = mountComponent();
    await flushPromises();

    const pagination = findByTestId(wrapper, 'approvals-pagination');
    expect(pagination.exists()).toBeTruthy();
  });

  it('sets page size and gets approvals based on event from pagination component', async () => {
    AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {
          result: [mockRequest],
          totalCount: 1,
        },
      }),
    );

    wrapper = mountComponent();
    await flushPromises();
    const getApprovalsSpy = jest.spyOn(AccessRequestApi, 'getUserApprovals');

    const pagination = findComponentByTestId(wrapper, 'approvals-pagination');
    pagination.vm.$emit('on-page-size-change', 2);
    expect(wrapper.vm.pageSize).toBe(2);
    expect(getApprovalsSpy).toHaveBeenCalledWith(
      '1234',
      {
        _pagedResultsOffset: 0,
        _pageSize: 2,
        _sortKeys: 'decision.startDate',
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

  it('sets page and gets approvals based on event from pagination component', async () => {
    AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {
          result: [mockRequest],
          totalCount: 1,
        },
      }),
    );

    wrapper = mountComponent();
    await flushPromises();

    const getApprovalsSpy = jest.spyOn(AccessRequestApi, 'getUserApprovals');

    const pagination = findComponentByTestId(wrapper, 'approvals-pagination');
    pagination.vm.$emit('input', 2);
    expect(wrapper.vm.currentPage).toBe(2);
    expect(getApprovalsSpy).toHaveBeenCalledWith(
      '1234',
      {
        _pagedResultsOffset: 10,
        _pageSize: 10,
        _sortKeys: 'decision.startDate',
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

  it('sets status and gets approvals based on event from toolbar', async () => {
    AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {
          result: [mockRequest],
          totalCount: 1,
        },
      }),
    );

    wrapper = mountComponent();
    await flushPromises();

    const getApprovalsSpy = jest.spyOn(AccessRequestApi, 'getUserApprovals');

    const toolbar = findComponentByTestId(wrapper, 'approvals-toolbar');
    toolbar.vm.$emit('status-change', 'complete');
    expect(getApprovalsSpy).toHaveBeenCalledWith(
      '1234',
      {
        _pagedResultsOffset: 0,
        _pageSize: 10,
        _sortKeys: 'decision.startDate',
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

  it('sets filter and gets approvals based on event from toolbar', async () => {
    AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {
          result: [mockRequest],
          totalCount: 1,
        },
      }),
    );

    wrapper = mountComponent();
    await flushPromises();

    const getApprovalsSpy = jest.spyOn(AccessRequestApi, 'getUserApprovals');

    const toolbar = findComponentByTestId(wrapper, 'approvals-toolbar');
    toolbar.vm.$emit('filter-change', {
      query: 'testId',
    });

    await flushPromises();

    expect(getApprovalsSpy).toHaveBeenCalledWith(
      '1234',
      {
        _pagedResultsOffset: 0,
        _pageSize: 10,
        _sortKeys: 'decision.startDate',
        _sortType: 'date',
        _sortDir: 'desc',
        actorStatus: 'active',
      },
      getRequestFilter({ query: 'testId' }),
    );
  });

  it('test open modal with Approve', async () => {
    AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {
          result: [mockRequest],
          totalCount: 1,
        },
      }),
    );

    wrapper = mountComponent();
    const showModalSpy = jest
      .spyOn(wrapper.vm, 'openModal')
      .mockImplementation();
    await flushPromises();

    findByTestId(wrapper, 'dropdown-actions').trigger('click');
    findByTestId(wrapper, 'dropdown-action-approve').trigger('click');
    expect(showModalSpy).toHaveBeenCalledWith(openModalMock, 'APPROVE');
  });
  it('test open modal with reject', async () => {
    AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {
          result: [mockRequest],
          totalCount: 1,
        },
      }),
    );

    wrapper = mountComponent();
    const showModalSpy = jest
      .spyOn(wrapper.vm, 'openModal')
      .mockImplementation();
    await flushPromises();

    findByTestId(wrapper, 'dropdown-actions').trigger('click');
    findByTestId(wrapper, 'dropdown-action-reject').trigger('click');
    await wrapper.vm.$nextTick();
    expect(showModalSpy).toHaveBeenCalledWith(openModalMock, 'REJECT');
  });
  it('test open modal with reassign', async () => {
    AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {
          result: [mockRequest],
          totalCount: 1,
        },
      }),
    );
    const newOpenModalMock = clone(openModalMock);

    wrapper = mountComponent();
    const showModalSpy = jest
      .spyOn(wrapper.vm, 'openModal')
      .mockImplementation();
    await flushPromises();

    findByTestId(wrapper, 'dropdown-actions').trigger('click');
    findByTestId(wrapper, 'dropdown-action-reassign').trigger('click');
    await wrapper.vm.$nextTick();
    expect(showModalSpy).toHaveBeenCalledWith(newOpenModalMock, 'REASSIGN');
  });

  it('sets approval count to show in side nav bar badge', async () => {
    AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {
          result: [mockRequest],
          totalCount: 1,
        },
      }),
    );

    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.vm.$store.commit).toHaveBeenCalledWith('setApprovalsCount', 1);
  });

  it('Loaditem function updates the list item correctly', async () => {
    const newMockRequest = clone(mockRequest);
    newMockRequest.decision.comments = [{ comment: 'test' }];
    const newOpenModalMock = clone(openModalMock);
    newOpenModalMock.rawData.decision.comments = [{ comment: 'test' }];
    delete newOpenModalMock.itemName;
    delete newOpenModalMock.rawData.requestTypeDisplayName;
    AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {
          result: [mockRequest],
        },
      }),
    );
    AccessRequestApi.getRequest = jest.fn().mockReturnValue(
      Promise.resolve({
        data: newMockRequest,
      }),
    );
    wrapper = mountComponent();
    wrapper.vm.loadItem(1);
    await flushPromises();
    expect(wrapper.vm.modalItem).toMatchObject(newOpenModalMock);
  });
});
