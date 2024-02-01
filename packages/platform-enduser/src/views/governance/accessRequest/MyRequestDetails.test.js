/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import i18n from '@/i18n';
import router from '@/router';
import MyRequestDetails from './MyRequestDetails';

jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');

const accessRequest = {
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
    completionDate: null,
    deadline: null,
    outcome: null,
    phases: [],
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

describe('MyRequestDetails', () => {
  const setup = (props) => {
    setupTestPinia({ user: { userId: '1234' } });
    return mount(MyRequestDetails, {
      global: {
        plugins: [router, i18n],
      },
      props,
    });
  };

  let wrapper;

  AccessRequestApi.getRequest = jest.fn().mockReturnValue(Promise.resolve({
    data: accessRequest,
  }));

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
      const detail = findByTestId(wrapper, 'request-detail');
      expect(detail.text()).toContain('My Azure App');
      expect(detail.text()).toContain('Manuel Escobar');
      expect(detail.text()).toContain('manuel.escobar@test.com');
      expect(detail.text()).toContain('Remove Application');
      expect(detail.text()).toContain('Pending');
      expect(detail.text()).toContain('Medium Priority');
    });
    it('shows cancel panel for in progress request', async () => {
      wrapper = setup();
      await flushPromises();
      const detail = findByTestId(wrapper, 'request-detail-cancel');
      expect(detail.exists()).toBeTruthy();
    });
    it('hides cancel panel for completed request', async () => {
      const completedReq = { ...accessRequest };
      completedReq.decision.status = 'complete';
      AccessRequestApi.getRequest = jest.fn().mockReturnValue(Promise.resolve({
        data: completedReq,
      }));

      wrapper = setup();
      await flushPromises();
      const detail = findByTestId(wrapper, 'request-detail-cancel');
      expect(detail.exists()).toBeFalsy();
    });
    it('shows cancel panel for canceled request', async () => {
      const canceledReq = { ...accessRequest };
      canceledReq.decision.status = 'cancelled';
      AccessRequestApi.getRequest = jest.fn().mockReturnValue(Promise.resolve({
        data: canceledReq,
      }));

      wrapper = setup();
      await flushPromises();
      const detail = findByTestId(wrapper, 'request-detail-cancel');
      expect(detail.exists()).toBeFalsy();
    });
  });
});
