/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import Notifications from '@kyvg/vue3-notification';
import GovernanceDashboard from './index';

jest.mock('@/api/governance/AccessReviewApi');
jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');

describe('GovernanceDashboard', () => {
  let wrapper;

  AccessRequestApi.getUserRequests = jest.fn().mockReturnValue(Promise.resolve({ data: {} }));

  function shallowMountComponent() {
    setupTestPinia({ user: { userId: '123' } });
    wrapper = shallowMount(GovernanceDashboard, {
      global: {
        mocks: {
          $t: (text) => (text),
          $store: {
            state: {
              certificationCount: 1,
              approvalsCount: 1,
              violationsCount: 2,
              fulfillmentTasksCount: 3,
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

  it('Access review count properly rendered', () => {
    shallowMountComponent();
    const card = wrapper.findComponent('[linkpath="access-reviews"]');
    expect(card.vm.count).toBe(1);
  });

  it('Pending approvals count properly rendered', () => {
    shallowMountComponent();
    const card = wrapper.findComponent('[linkpath="approvals"]');
    expect(card.vm.count).toBe(1);
  });

  it('Compliance violations count properly rendered', () => {
    shallowMountComponent();
    const card = wrapper.findComponent('[linkpath="violations"]');
    expect(card.vm.count).toBe(2);
  });

  it('Pending tasks count properly rendered', () => {
    shallowMountComponent();
    const card = wrapper.findComponent('[linkpath="tasks"]');
    expect(card.vm.count).toBe(3);
  });
});
