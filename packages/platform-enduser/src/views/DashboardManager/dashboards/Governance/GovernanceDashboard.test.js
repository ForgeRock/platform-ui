/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, mount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import Notifications from '@kyvg/vue3-notification';
import i18n from '@/i18n';
import GovernanceDashboard from '.';
import * as RecommendationsApi from '@/api/governance/RecommendationsApi';

jest.mock('@/api/governance/AccessReviewApi');
jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');
const push = jest.fn();

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

  const defaultRecommendationsState = {
    certificationCount: 1,
    approvalsCount: 1,
    violationsCount: 2,
    fulfillmentTasksCount: 3,
    govAutoIdEnabled: true,
  };

  const defaultRecommendationsData = {
    recommendationsCount: 4,
  };

  function mountComponent(stateObj = defaultRecommendationsState, dataObj = defaultRecommendationsData) {
    setupTestPinia({ user: { userId: '123' } });
    wrapper = mount(GovernanceDashboard, {
      global: {
        mocks: {
          $store: {
            state: stateObj,
            commit: jest.fn(),
          },
          $router: {
            push,
          },
        },
        plugins: [Notifications, i18n],
      },
      data() {
        return dataObj;
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

  describe('getRecommendationsCount', () => {
    mountComponent();
    it('should call getUserRecommendations', async () => {
      const getRecommendationSpy = jest.spyOn(RecommendationsApi, 'getUserRecommendations').mockImplementation(() => Promise.resolve({ data: {} }));
      wrapper.vm.getRecommendationsCount();

      await wrapper.vm.$nextTick();
      expect(getRecommendationSpy)
        .toHaveBeenCalledWith(
          '123',
          {
            _pageSize: 0,
          },
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

  it('Recommendations count properly rendered', () => {
    mountComponent();
    const link = wrapper.find('.alert-link');
    expect(link.text()).toContain('View 4 recommendations');
  });

  it('Recommendations click navigates to catalog with the correct initial tab', async () => {
    mountComponent();
    const link = wrapper.find('.alert-link');
    await link.trigger('click');
    expect(push).toHaveBeenCalledWith({ name: 'AccessRequestNew', params: { returnPath: '/dashboard' } });
  });

  it('Recommendations count not rendered with zero recommendations present', () => {
    const zeroRecommendationsData = {
      recommendationsCount: 0,
    };
    mountComponent(defaultRecommendationsState, zeroRecommendationsData);
    const link = wrapper.find('.alert-link');
    expect(link.exists()).toBe(false);
  });
});
