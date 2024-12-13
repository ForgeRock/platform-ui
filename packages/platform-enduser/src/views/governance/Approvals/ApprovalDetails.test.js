/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as RequestFormAssignmentsApi from '@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi';
import i18n from '@/i18n';
import router from '@/router';
import ApprovalDetails from './ApprovalDetails';

jest.mock('@forgerock/platform-shared/src/composables/bvModal');
jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    consumer: {
      web: {
        '1_0-web': { id: 'web', displayName: 'Web Application', image: 'web.png' },
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
    displayName: value,
  },
}));

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
          approve: true,
          cancel: true,
          comment: true,
          reassign: true,
          reject: true,
        },
      },
    ],
    inactive: [],
  },
  comments: [],
  completionDate: null,
  deadline: null,
  outcome: null,
  phases: [
    {
      name: 'phase-name',
    },
  ],
  startDate: '2023-06-22T19:23:26+00:00',
  status: 'in-progress',
};

const accessRequest = {
  application: {
    description: 'My Azure App',
    icon: '',
    id: '2',
    name: 'My Azure App',
    templateName: 'azure.ad',
    templateVersion: '2.0',
  },
  decision,
  id: 1,
  request: {
    common: {
      endDate: '2023-07-15T19:23:26+00:00',
      priority: 'medium',
    },
  },
  requestType: 'applicationRemove',
  requester: {
    givenName: 'Andrew',
    id: '1234-456-2',
    mail: 'andrew.hertel@test.com',
    sn: 'Hertel',
    userName: 'andrew.hertel@test.com',
  },
  user: {
    givenName: 'Manuel',
    id: '1234-456-3',
    mail: 'manuel.escobar@test.com',
    sn: 'Escobar',
    userName: 'manuel.escobar@test.com',
  },
  phases: [
    {
      name: 'phase-name',
      permissions: {
        approve: true,
        comment: true,
        modify: true,
        reassign: true,
        reject: true,
      },
    },
  ],
};

describe('ApprovalDetails', () => {
  const setup = (props) => {
    useBvModal.mockReturnValue({ bvModal: { show: jest.fn(), hide: jest.fn() } });
    setupTestPinia({ user: { userId: '1234' } });
    return mount(ApprovalDetails, {
      global: {
        plugins: [router, i18n],
      },
      props,
    });
  };

  let wrapper;

  beforeEach(() => {
    AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(Promise.resolve({
      data: { result: [accessRequest] },
    }));
    RequestFormAssignmentsApi.getFormAssignmentByWorkflowNode = jest.fn().mockResolvedValue({ data: { result: [] } });
  });

  describe('@Component Tests', () => {
    it('has header with request type and name', async () => {
      wrapper = setup();
      await flushPromises();
      const header = findByTestId(wrapper, 'request-detail-header');
      expect(header.text()).toContain('Remove Application');
      expect(header.text()).toContain('My Azure App');
    });
    it('shows request details', async () => {
      wrapper = setup();
      await flushPromises();
      const detail = findByTestId(wrapper, 'approval-detail');
      expect(detail.text()).toContain('Manuel Escobar');
      expect(detail.text()).toContain('manuel.escobar@test.com');
      expect(detail.text()).toContain('Pending');
      expect(detail.text()).toContain('Medium Priority');
    });

    it('can get an inactive approval', async () => {
      AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(Promise.reject());
      AccessRequestApi.getRequest = jest.fn().mockReturnValue(Promise.resolve({
        data: accessRequest,
      }));
      wrapper = setup();
      await flushPromises();

      const header = findByTestId(wrapper, 'request-detail-header');
      expect(header.exists()).toBeTruthy();
      const detail = findByTestId(wrapper, 'approval-detail');
      expect(detail.exists()).toBeTruthy();
    });

    describe('actions', () => {
      describe('active approval', () => {
        beforeEach(() => {
          wrapper = setup();
        });
        it('shows approve action if the Approve permission is true', () => {
          const actions = findByTestId(wrapper, 'approval-detail-actions');
          expect(actions.text()).toContain('Approve');
        });
        it('shows reject action if the Reject permission is true', () => {
          const actions = findByTestId(wrapper, 'approval-detail-actions');
          expect(actions.text()).toContain('Reject');
        });
        it('shows forward action if the Forward permission is true', () => {
          const actions = findByTestId(wrapper, 'approval-detail-actions');
          expect(actions.text()).toContain('Forward');
        });
        it('should set the permissions with the api permissions result', () => {
          expect(wrapper.vm.actionPermissions).toEqual({
            approve: true,
            comment: true,
            modify: true,
            reassign: true,
            reject: true,
          });
        });
      });
      it('hides actions for inactive approval', async () => {
        AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(Promise.reject());
        AccessRequestApi.getRequest = jest.fn().mockReturnValue(Promise.resolve({
          data: accessRequest,
        }));
        wrapper = setup();
        await flushPromises();

        const actions = findByTestId(wrapper, 'approval-detail-actions');
        expect(actions.exists()).toBeFalsy();
      });
    });
  });
});
