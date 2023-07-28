/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import flushPromises from 'flush-promises';
import * as AccessRequestApi from '@/api/governance/AccessRequestApi';
import getPriorityImageSrc from '@/components/utils/governance/AccessRequestUtils';
import i18n from '@/i18n';
import MyRequests from './index';

jest.mock('@/components/utils/governance/AccessRequestUtils');
jest.mock('@/api/governance/AccessRequestApi');

const accessRequests = [{
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
  entitlement: {
    description: 'Administers different groups',
    displayName: 'Groups Administrator',
    id: '2',
  },
  id: 1,
  request: {
    common: {
      endDate: '2023-07-15T19:23:26+00:00',
      priority: 'medium',
    },
  },
  requestType: 'entitlementRevoke',
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
}];

describe('MyRequests', () => {
  const stubProps = {
    i18n,
    mocks: {
      $store: { state: { UserStore: { userId: '80202' } } },
    },
  };

  const setup = (props) => (mount(MyRequests, {
    ...stubProps,
    ...props,
  }));

  AccessRequestApi.getUserRequests = jest.fn().mockReturnValue(Promise.resolve({
    data: {
      result: accessRequests,
    },
  }));

  beforeEach(() => {
    getPriorityImageSrc.mockClear();
  });

  describe('@Component Tests', () => {
    it('Executes the request details modal after clicking on "View Details"', async () => {
      const wrapper = setup();
      const viewDetails = jest.spyOn(wrapper.vm, 'openModal').mockImplementation();
      await flushPromises();
      const viewDetailsButton = findByTestId(wrapper, 'view-details-button');
      expect(viewDetailsButton.exists()).toBe(true);
      await viewDetailsButton.trigger('click');
      expect(viewDetails).toHaveBeenCalled();
    });
  });
});
