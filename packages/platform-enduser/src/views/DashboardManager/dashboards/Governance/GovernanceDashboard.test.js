/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import Notifications from '@kyvg/vue3-notification';
import * as AccessReviewApi from '@/api/governance/AccessReviewApi';
import * as AccessRequestApi from '@/api/governance/AccessRequestApi';
import GovernanceDashboard from './index';

jest.mock('@/api/governance/AccessReviewApi');
jest.mock('@/api/governance/AccessRequestApi');

describe('GovernanceDashboard', () => {
  let wrapper;

  AccessReviewApi.getCertificationItems = jest.fn().mockReturnValue(Promise.resolve({ data: {} }));
  AccessRequestApi.getUserRequests = jest.fn().mockReturnValue(Promise.resolve({ data: {} }));
  AccessRequestApi.getUserApprovals = jest.fn().mockReturnValue(Promise.resolve({ data: {} }));

  function shallowMountComponent() {
    setupTestPinia({ user: { userId: '123' } });
    wrapper = shallowMount(GovernanceDashboard, {
      global: {
        mocks: {
          $t: (text) => (text),
          $store: {
            state: {
              SharedStore: {},
            },
          },
        },
        plugins: [Notifications],
      },
    });
  }
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAccessReviewsCount', () => {
    shallowMountComponent();
    it('should call getCertificationItems', async () => {
      const getCertSpy = jest.spyOn(AccessReviewApi, 'getCertificationItems').mockImplementation(() => Promise.resolve({ data: { objectTypes: {} } }));
      wrapper.vm.getAccessReviewsCount();

      await wrapper.vm.$nextTick();
      expect(getCertSpy).toHaveBeenCalledWith({ status: 'active' });
    });
  });

  describe('getPendingRequestsCount', () => {
    shallowMountComponent();
    it('should call getUserRequests', async () => {
      const getCertSpy = jest.spyOn(AccessRequestApi, 'getUserRequests').mockImplementation(() => Promise.resolve({ data: { objectTypes: {} } }));
      wrapper.vm.getPendingRequestsCount();

      await wrapper.vm.$nextTick();
      expect(getCertSpy)
        .toHaveBeenCalledWith(
          '123',
          {
            pageSize: 0,
            status: 'in-progress',
          },
          { operand: [{ operand: { targetName: 'decision.status', targetValue: 'in-progress' }, operator: 'EQUALS' }], operator: 'AND' },
        );
    });
  });

  describe('getPendingApprovalsCount', () => {
    shallowMountComponent();
    it('should call getUserApprovals', async () => {
      const getCertSpy = jest.spyOn(AccessRequestApi, 'getUserApprovals').mockImplementation(() => Promise.resolve({ data: { objectTypes: {} } }));
      wrapper.vm.getPendingApprovalsCount();

      await wrapper.vm.$nextTick();
      expect(getCertSpy)
        .toHaveBeenCalledWith(
          '123',
          {
            pageSize: 0,
            actorStatus: 'active',
          },
        );
    });
  });
});
