/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { findByTestId, findByText } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { detailTypes } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import i18n from '@/i18n';
import AccessRequestDetails from './AccessRequestDetails';

jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => ({ params: { requestId: 1 } })),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    consumer: {
      web: {
        '1_0-web': { id: 'web', displayName: 'Web Application', image: 'web.png' },
      },
    },
  }),
}));

describe('AccessRequestDetails', () => {
  const setup = (props = { requestId: '1' }) => {
    setupTestPinia({ user: { userId: '1234' } });
    return mount(AccessRequestDetails, {
      global: {
        plugins: [i18n],
      },
      props,
    });
  };

  function mockRequest() {
    return {
      application: {
        description: 'My Azure App',
        icon: '',
        id: '2',
        name: 'My Azure App',
        templateName: 'azure.ad',
        templateVersion: '2.0',
      },
      decision: {
        actors: {
          active: [
            {
              givenName: 'Manuel',
              id: '1234-456-3',
              mail: 'manuel.escobar@test.com',
              sn: 'Escobar',
              userName: 'manuel.escobar@test.com',
              phase: 'phase-name',
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
      },
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
    };
  }

  beforeEach(() => {
    AccessRequestApi.getRequest = jest.fn().mockResolvedValue({
      data: mockRequest(),
    });
    AccessRequestApi.getRequestType = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        displayName: 'Request Display Name',
      },
    }));
  });

  describe('@Component Tests', () => {
    it('has header with request type and name', async () => {
      const wrapper = setup();
      await flushPromises();
      const header = findByTestId(wrapper, 'request-detail-header');
      expect(header.text()).toContain('Remove Application');
      expect(header.text()).toContain('My Azure App');
    });
    it('shows request details', async () => {
      const wrapper = setup();
      await flushPromises();
      const detail = findByTestId(wrapper, 'request-detail');
      expect(detail.text()).toContain('Manuel Escobar');
      expect(detail.text()).toContain('manuel.escobar@test.com');
      expect(detail.text()).toContain('Pending');
      expect(detail.text()).toContain('Medium Priority');
      expect(AccessRequestApi.getRequest).toHaveBeenCalledWith('1');
    });
    it('shows cancel panel for in progress request', async () => {
      const wrapper = setup();
      await flushPromises();
      const detail = findByTestId(wrapper, 'request-detail-cancel');
      expect(detail.exists()).toBeTruthy();
    });
    it('hides cancel panel for completed request', async () => {
      const completedReq = mockRequest();
      completedReq.decision.status = 'complete';
      AccessRequestApi.getRequest = jest.fn().mockReturnValue(Promise.resolve({
        data: completedReq,
      }));

      const wrapper = setup();
      await flushPromises();
      const detail = findByTestId(wrapper, 'request-detail-cancel');
      expect(detail.exists()).toBeFalsy();
    });
    it('shows cancel panel for canceled request', async () => {
      const canceledReq = mockRequest();
      canceledReq.decision.status = 'cancelled';
      AccessRequestApi.getRequest = jest.fn().mockReturnValue(Promise.resolve({
        data: canceledReq,
      }));

      const wrapper = setup();
      await flushPromises();
      const detail = findByTestId(wrapper, 'request-detail-cancel');
      expect(detail.exists()).toBeFalsy();
    });

    it('forward is disabled by default', async () => {
      const wrapper = setup();
      await flushPromises();
      const forwardButton = findByText(wrapper, 'button', 'Forward');
      expect(forwardButton).toBeUndefined();
    });

    it('allow forward when viewing a request as an admin', async () => {
      const wrapper = setup({
        requestId: '1',
        type: detailTypes.ADMIN_REQUEST,
      });
      await flushPromises();
      const forwardButton = findByText(wrapper, 'button', 'Forward');
      expect(forwardButton.exists()).toBe(true);
    });
  });
});
