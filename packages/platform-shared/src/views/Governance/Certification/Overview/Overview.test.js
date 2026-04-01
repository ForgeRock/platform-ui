/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import Overview from './index';
import * as AccessReviewApi from '@/api/governance/AccessReviewApi';
import * as CampaignApi from '@/api/governance/CampaignApi';

const CARD_TITLES = [
  'governance.certification.activeCampaigns',
  'governance.certification.expiringCampaigns',
  'governance.certification.activeReviews',
  'governance.certification.campaignsByType',
  'governance.certification.campaignsByStatus',
  'governance.certification.accessReviewHistory',
];

const CARD_TOOLTIPS = [
  'governance.certification.activeCampaignsTooltip',
  'governance.certification.expiringCampaignsTooltip',
  'governance.certification.activeReviewsTooltip',
];

CampaignApi.getActiveCampaignsCount = jest.fn();
AccessReviewApi.getAccessReviewHistory = jest.fn();
CampaignApi.getActiveCampaignsCount = jest.fn();
AccessReviewApi.getActiveReviews = jest.fn();
CampaignApi.getCampaignsByStatus = jest.fn();
CampaignApi.getCampaignsByType = jest.fn();
CampaignApi.getExpiringCampaigns = jest.fn();

describe('Overview View', () => {
  let wrapper;

  function setup() {
    wrapper = shallowMount(Overview, {
      global: {
        renderStubDefaultSlot: true,
        mocks: {
          $t: (index) => index,
        },
      },
    });
  }

  beforeEach(() => {
    AccessReviewApi.getAccessReviewHistory.mockImplementation(() => new Promise((res) => res([])));
    CampaignApi.getActiveCampaignsCount.mockImplementation(() => new Promise((res) => res(null)));
    AccessReviewApi.getActiveReviews.mockImplementation(() => new Promise((res) => res(null)));
    CampaignApi.getCampaignsByStatus.mockImplementation(() => new Promise((res) => res([])));
    CampaignApi.getCampaignsByType.mockImplementation(() => new Promise((res) => res([])));
    CampaignApi.getExpiringCampaigns.mockImplementation(() => new Promise((res) => res(null)));
  });

  it('Overview without data does not display pie charts', () => {
    setup();
    const cards = wrapper.findAll('fr-visualization-card-stub');
    expect(cards.length).toBe(3);
    cards.forEach((card, index) => {
      expect(card.attributes('title')).toBe(CARD_TITLES[index]);
      expect(card.attributes('tooltip')).toBe(CARD_TOOLTIPS[index]);
      expect(card.attributes('count')).toBe('0');
    });
  });

  it('active campaigns data and props validation', async () => {
    CampaignApi.getActiveCampaignsCount.mockImplementation(() => new Promise((res) => res('10')));
    setup();

    await flushPromises();

    expect(wrapper.vm.activeCampaigns).toBe('10');
    expect(wrapper.vm.isLoadingActiveCampaigns).toBe(false);
    const visualizationCard = wrapper.findAll('fr-visualization-card-stub')[0];
    expect(visualizationCard.exists()).toBe(true);
    expect(visualizationCard.attributes('count')).toBe('10');
    expect(visualizationCard.attributes('loading')).toBeUndefined();
  });

  it('expiring campaigns data and props validation', async () => {
    CampaignApi.getExpiringCampaigns.mockImplementation(() => new Promise((res) => res('10')));
    setup();

    await flushPromises();

    expect(wrapper.vm.expiringCampaigns).toBe('10');
    expect(wrapper.vm.isLoadingExpiringCampaigns).toBe(false);
    const visualizationCard = wrapper.findAll('fr-visualization-card-stub')[1];
    expect(visualizationCard.exists()).toBe(true);
    expect(visualizationCard.attributes('count')).toBe('10');
    expect(visualizationCard.attributes('loading')).toBeUndefined();
  });

  it('active reviews data and props validation', async () => {
    AccessReviewApi.getActiveReviews.mockImplementation(() => new Promise((res) => res('10')));
    setup();

    await flushPromises();

    expect(wrapper.vm.activeReviews).toBe('10');
    expect(wrapper.vm.isLoadingActiveReviews).toBe(false);
    const visualizationCard = wrapper.findAll('fr-visualization-card-stub')[2];
    expect(visualizationCard.exists()).toBe(true);
    expect(visualizationCard.attributes('count')).toBe('10');
    expect(visualizationCard.attributes('loading')).toBeUndefined();
  });

  it('campaigns by type data and props validation', async () => {
    const response = [
      {
        label: 'identity',
        value: 30,
        color: 'red',
      },
      {
        label: 'application',
        value: 40,
        color: 'yellow',
      },
      {
        label: 'entitlement',
        value: 50,
        color: 'green',
      },
      {
        label: 'roleMembership',
        value: 40,
        color: 'black',
      },
    ];
    CampaignApi.getCampaignsByType.mockImplementation(() => new Promise((res) => res(response)));
    setup();

    await flushPromises();

    expect(wrapper.vm.campaignsByType).toEqual(response);
    expect(wrapper.vm.isLoadingCampaignsByType).toBe(false);
    const visualizationCard = wrapper.findAll('fr-visualization-card-stub')[3];
    expect(visualizationCard.exists()).toBe(true);
    expect(visualizationCard.attributes('loading')).toBeUndefined();
    expect(visualizationCard.attributes('title')).toBe(CARD_TITLES[3]);
  });

  it('campaigns by status data and props validation', async () => {
    const response = [
      {
        label: 'active',
        value: 30,
        color: 'red',
      },
      {
        label: 'signed-off',
        value: 40,
        color: 'yellow',
      },
      {
        label: 'staging',
        value: 50,
        color: 'green',
      },
    ];
    CampaignApi.getCampaignsByStatus.mockImplementation(() => new Promise((res) => res(response)));
    setup();

    await flushPromises();

    expect(wrapper.vm.campaignsByStatus).toEqual(response);
    expect(wrapper.vm.isLoadingCampaignsByStatus).toBe(false);
    const visualizationCard = wrapper.findAll('fr-visualization-card-stub')[3];
    expect(visualizationCard.exists()).toBe(true);
    expect(visualizationCard.attributes('loading')).toBeUndefined();
    expect(visualizationCard.attributes('title')).toBe(CARD_TITLES[4]);
  });

  it('access review history data and props validation', async () => {
    const response = [
      {
        label: 'certify',
        value: 30,
        color: 'red',
      },
      {
        label: 'revoke',
        value: 40,
        color: 'yellow',
      },
    ];
    AccessReviewApi.getAccessReviewHistory.mockImplementation(() => new Promise((res) => res(response)));
    setup();

    await flushPromises();

    expect(wrapper.vm.accessReviewHistory).toEqual(response);
    expect(wrapper.vm.isLoadingAccessReviewHistory).toBe(false);
    const visualizationCard = wrapper.findAll('fr-visualization-card-stub')[3];
    expect(visualizationCard.exists()).toBe(true);
    expect(visualizationCard.attributes('loading')).toBeUndefined();
    expect(visualizationCard.attributes('title')).toBe(CARD_TITLES[5]);
  });
});
