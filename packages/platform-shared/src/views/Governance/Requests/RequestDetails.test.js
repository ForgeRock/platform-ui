/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import RequestDetails from './RequestDetails';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi', () => ({
  getIgaAutoIdConfig: jest.fn(),
}));

describe('RequestDetails', () => {
  function setup({ adminUser = false } = {}) {
    const idmRoles = adminUser ? ['internal/role/openidm-admin'] : [];
    const idmUIAdminRoles = adminUser ? ['internal/role/openidm-admin'] : [];
    setupTestPinia({ user: { userId: '1234', idmRoles, idmUIAdminRoles } });
    return shallowMount(RequestDetails, {
      global: {
        plugins: [i18n],
        mocks: {
          $router: { push: jest.fn() },
        },
        stubs: {
          FrAccessRequestDetails: {
            name: 'AccessRequestDetails',
            template: '<div />',
            props: ['requestId', 'autoIdSettings', 'type'],
          },
        },
      },
    });
  }

  beforeEach(() => {
    mockRouter({ params: { requestId: 'req-123' } });
    CommonsApi.getIgaAutoIdConfig.mockResolvedValue({
      data: {
        enableAutoId: true,
        highScorePercentThreshold: 81.3,
        lowScorePercentThreshold: 24,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('passes requestId from route params to AccessRequestDetails', async () => {
    const wrapper = setup();
    await flushPromises();

    const details = wrapper.findComponent({ name: 'AccessRequestDetails' });
    expect(details.props('requestId')).toBe('req-123');
  });

  it('passes autoIdSettings fetched on mount to AccessRequestDetails', async () => {
    const wrapper = setup();
    await flushPromises();

    const details = wrapper.findComponent({ name: 'AccessRequestDetails' });
    expect(details.props('autoIdSettings')).toEqual({
      enableAutoId: true,
      highScorePercentThreshold: 81.3,
      lowScorePercentThreshold: 24,
    });
  });

  it('navigates to UserAdminRequests on navigate-to-list for non-admin user', async () => {
    const wrapper = setup();
    await flushPromises();

    const routerPushSpy = jest.spyOn(wrapper.vm.$router, 'push');
    wrapper.findComponent({ name: 'AccessRequestDetails' }).vm.$emit('navigate-to-list');

    expect(routerPushSpy).toHaveBeenCalledWith({ name: 'UserAdminRequests' });
  });

  it('navigates to GovernanceRequests on navigate-to-list for admin user', async () => {
    const wrapper = setup({ adminUser: true });
    await flushPromises();

    const routerPushSpy = jest.spyOn(wrapper.vm.$router, 'push');
    wrapper.findComponent({ name: 'AccessRequestDetails' }).vm.$emit('navigate-to-list');

    expect(routerPushSpy).toHaveBeenCalledWith({ name: 'GovernanceRequests' });
  });

  it('does not throw when getIgaAutoIdConfig fails', async () => {
    CommonsApi.getIgaAutoIdConfig.mockRejectedValue(new Error('network error'));

    const wrapper = setup();
    await flushPromises();

    const details = wrapper.findComponent({ name: 'AccessRequestDetails' });
    expect(details.props('autoIdSettings')).toEqual({});
  });
});
