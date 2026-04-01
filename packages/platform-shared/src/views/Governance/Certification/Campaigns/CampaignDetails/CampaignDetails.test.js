/**
 * Copyright 2023-2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as CampaignApi from '@/api/governance/CampaignApi';
import CampaignDetails from './index';

CampaignApi.getCampaignDetails = jest.fn();

describe('CampaignDetails Component', () => {
  let wrapper;
  beforeEach(() => {
    CampaignApi.getCampaignDetails.mockImplementation(() => Promise.resolve({
      name: 'Test Cert',
      certificationType: 'identity',
      deadline: '2022-12-19T22:51:51+00:00',
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
});
