/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as AccessRequestApi from '@/api/governance/AccessRequestApi';
import Approvals from './index';

const mountComponent = () => mount(Approvals, {
  mocks: {
    $t: (text) => text,
    $store: { state: { UserStore: {} } },
  },
});

const mockRequest = {
  id: 3,
  requestType: 'accountRevoke',
  request: {
    common: {
      priority: 'high',
      startDate: '2023-06-22T19:23:26+00:00',
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

describe('RequestFilter', () => {
  CommonsApi.getResource = jest.fn().mockReturnValue(Promise.resolve({}));
  let wrapper;

  it('shows no data component when no requests are found', async () => {
    AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        results: [],
        totalCount: 0,
      },
    }));

    wrapper = mountComponent();
    await flushPromises();

    const noData = findByTestId(wrapper, 'approvals-no-data');
    expect(noData.exists()).toBeTruthy();
  });

  it('shows pagination component when there is at least one request found', async () => {
    AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        results: [mockRequest],
        totalCount: 1,
      },
    }));

    wrapper = mountComponent();
    await flushPromises();

    const pagination = findByTestId(wrapper, 'approvals-pagination');
    expect(pagination.exists()).toBeTruthy();
  });

  it('sets page size and gets approvals based on event from pagination component', async () => {
    AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        results: [mockRequest],
        totalCount: 1,
      },
    }));

    wrapper = mountComponent();
    await flushPromises();

    const getApprovalsSpy = jest.spyOn(AccessRequestApi, 'getUserApprovals');

    const pagination = findByTestId(wrapper, 'approvals-pagination');
    pagination.vm.$emit('on-page-size-change', 2);
    expect(wrapper.vm.pageSize).toBe(2);
    expect(getApprovalsSpy).toHaveBeenCalledWith(
      undefined,
      { pageNumber: 1, pageSize: 2, status: 'governance.status.pending' },
      {},
    );
  });

  it('sets page and gets approvals based on event from pagination component', async () => {
    AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        results: [mockRequest],
        totalCount: 1,
      },
    }));

    wrapper = mountComponent();
    await flushPromises();

    const getApprovalsSpy = jest.spyOn(AccessRequestApi, 'getUserApprovals');

    const pagination = findByTestId(wrapper, 'approvals-pagination');
    pagination.vm.$emit('input', 2);
    expect(wrapper.vm.currentPage).toBe(2);
    expect(getApprovalsSpy).toHaveBeenCalledWith(
      undefined,
      { pageNumber: 2, pageSize: 10, status: 'governance.status.pending' },
      {},
    );
  });

  it('sets status and gets approvals based on event from toolbar', async () => {
    AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        results: [mockRequest],
        totalCount: 1,
      },
    }));

    wrapper = mountComponent();
    await flushPromises();

    const getApprovalsSpy = jest.spyOn(AccessRequestApi, 'getUserApprovals');

    const toolbar = findByTestId(wrapper, 'approvals-toolbar');
    toolbar.vm.$emit('status-change', 'newStatus');
    expect(getApprovalsSpy).toHaveBeenCalledWith(
      undefined,
      { pageNumber: 1, pageSize: 10, status: 'newStatus' },
      {},
    );
  });

  it('sets filter and gets approvals based on event from toolbar', async () => {
    AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        results: [mockRequest],
        totalCount: 1,
      },
    }));

    wrapper = mountComponent();
    await flushPromises();

    const getApprovalsSpy = jest.spyOn(AccessRequestApi, 'getUserApprovals');

    const toolbar = findByTestId(wrapper, 'approvals-toolbar');
    toolbar.vm.$emit('filter-change', { filter: 'test' });
    expect(getApprovalsSpy).toHaveBeenCalledWith(
      undefined,
      { pageNumber: 1, pageSize: 10, status: 'governance.status.pending' },
      { filter: 'test' },
    );
  });
});
