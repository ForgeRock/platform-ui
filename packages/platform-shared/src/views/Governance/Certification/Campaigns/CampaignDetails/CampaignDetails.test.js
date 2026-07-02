/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as CampaignApi from '@/api/governance/CampaignApi';
import CampaignDetails from './index';
import FrSystemMessages from './SystemMessages/SystemMessages';

CampaignApi.getCampaignDetails = jest.fn();

describe('CampaignDetails Component', () => {
  let wrapper;
  beforeEach(() => {
    CampaignApi.getCampaignDetails.mockImplementation(() => Promise.resolve({
      name: 'Test Cert',
      certificationType: 'identity',
      deadline: '2022-12-19T22:51:51+00:00',
      systemMessages: { errors: [], info: [] },
    }));
    setupTestPinia();
    wrapper = shallowMount(CampaignDetails, {
      global: {
        renderStubDefaultSlot: true,
        mocks: {
          $t: (text) => (text),
          $route: {
            params: {
              campaignId: 'af7d9cb8-0f34-4007-898b-03bd08dbd029',
              tab: 'details',
            },
          },
        },
      },
    });
  });

  it('header loaded correctly', async () => {
    await flushPromises();

    const header = findByTestId(wrapper, 'header');
    expect(header.exists()).toBe(true);
    expect(header.attributes('title')).toBe('Test Cert');
    expect(header.attributes('toptext')).toBe('governance.editTemplate.templateType.identity');
  });

  it('tabs loaded correctly', async () => {
    await flushPromises();

    expect(wrapper.vm.tabIndex).toBe(0);
    expect(findByTestId(wrapper, 'cert-tabs').exists()).toBe(true);
    const overviewTab = findByTestId(wrapper, 'overview-tab');
    expect(overviewTab.exists()).toBe(true);
    expect(overviewTab.attributes('title')).toBe('governance.certificationDetails.detailsTabTitle');
    expect(overviewTab.attributes('active')).toBe('true');
    const accessReviewsTab = findByTestId(wrapper, 'access-reviews-tab');
    expect(accessReviewsTab.exists()).toBe(true);
    expect(accessReviewsTab.attributes('title')).toBe('governance.certificationDetails.accessReviewsTabTitle');
    expect(accessReviewsTab.attributes('active')).toBeUndefined();
  });

  it('CampaignOverview loaded correctly', async () => {
    await flushPromises();

    const campaignOverview = findByTestId(wrapper, 'campaign-overview');
    expect(campaignOverview.exists()).toBe(true);
    expect(campaignOverview.attributes('campaign')).toBeDefined();
  });
  it('does not update tabIndex if tab is not found', () => {
    const selectTabSpy = jest.spyOn(wrapper.vm, 'selectTab');
    wrapper.vm.handleRouteUpdate('');
    expect(wrapper.vm.tabIndex).toBe(-1);
    expect(selectTabSpy).toHaveBeenCalledWith(-1);
  });
  it('update tabIndex when the tab route param changes', () => {
    const selectTabSpy = jest.spyOn(wrapper.vm, 'selectTab');
    wrapper.vm.tabs = ['details', 'access-reviews'];
    wrapper.vm.handleRouteUpdate('access-reviews');
    expect(wrapper.vm.tabIndex).toBe(1);
    expect(selectTabSpy).toHaveBeenCalledWith(1);
  });
  it('system-messages tab exists with correct title and renders FrSystemMessages with prop', async () => {
    await flushPromises();

    const systemMessagesTab = findByTestId(wrapper, 'system-messages-tab');
    expect(systemMessagesTab.exists()).toBe(true);
    expect(systemMessagesTab.attributes('title')).toBe('governance.certificationDetails.systemMessages.systemMessagesTabTitle');

    const systemMessages = wrapper.findComponent(FrSystemMessages);
    expect(systemMessages.exists()).toBe(true);
    expect(systemMessages.props('systemMessages')).toEqual({ errors: [], info: [] });
  });
  it('handleRouteUpdate sets tabIndex to 2 for system-messages', () => {
    const selectTabSpy = jest.spyOn(wrapper.vm, 'selectTab');
    wrapper.vm.tabs = ['details', 'access-reviews', 'system-messages'];
    wrapper.vm.handleRouteUpdate('system-messages');
    expect(wrapper.vm.tabIndex).toBe(2);
    expect(selectTabSpy).toHaveBeenCalledWith(2);
  });
});
