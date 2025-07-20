/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import i18n from '@/i18n';
import AccessRequestCatalog from './index';

const mockCatalogItems = [
  {
    appType: 'role',
    icon: '',
    name: 'Roll',
    description: 'A good roll, flakey, warm, yum.',
    templateName: 'template',
    requested: true,
    id: 1,
  },
  {
    appType: 'role',
    icon: '',
    name: 'role 2',
    description: 'A perfect role',
    templateName: 'template2',
    requested: false,
    id: 2,
  },
];

const mockRecommendationItems = [
  {
    appType: 'entitlement',
    icon: '',
    name: 'Entitlement',
    description: 'A recommended entitlement.',
    templateName: 'template',
    requested: true,
    prediction: {
      confidenceLevel: 'HIGH',
      confidenceIcon: 'thumb_up_off_alt',
      confidence: 0.9,
      confidencePercentage: 90,
    },
    id: 1,
  },
  {
    appType: 'entitlement',
    icon: '',
    name: 'Entitlement 2',
    description: 'Another recommended entitlement.',
    templateName: 'template',
    requested: false,
    id: 2,
  },
];

describe('AccessRequestCatalog Component', () => {
  CommonsApi.getFilterSchema = jest.fn().mockImplementation(() => Promise.resolve({ data: {} }));

  function mountComponent(propsData, overrideData = { selectedTab: 2 }) {
    const wrapper = mount(AccessRequestCatalog, {
      global: {
        plugins: [i18n],
        mocks: {
          $store: {
            state: {
              govAutoIdSettings: {
                enableAutoId: true,
                highScorePercentThreshold: 80,
                lowScorePercentThreshold: 20,
              },
            },
          },
        },
      },
      props: {
        loading: false,
        ...propsData,
      },
      mocks: {
        $bvModal: {
          show: jest.fn(),
        },
      },
    });
    wrapper.setData(overrideData);
    return wrapper;
  }

  it('displays total count in singular', async () => {
    const wrapper = mountComponent({ catalogItems: [{}], totalCount: 1 });
    await flushPromises();
    const resultsText = wrapper.find('.btn-toolbar .text-muted');

    expect(resultsText.exists()).toBeTruthy();
    expect(resultsText.text()).toEqual('1 Result');
  });

  it('displays total count in plural', async () => {
    const wrapper = mountComponent({ catalogItems: [{}], totalCount: 2 });
    await flushPromises();
    const resultsText = wrapper.find('.btn-toolbar .text-muted');

    expect(resultsText.exists()).toBeTruthy();
    expect(resultsText.text()).toEqual('2 Results');
  });

  it('displays catalog items passed in as props', async () => {
    const wrapper = mountComponent(
      {
        catalogItems: [
          {
            appType: 'role',
            icon: '',
            name: 'Roll',
            description: 'A good roll, flakey, warm, yum.',
          },
          {
            appType: 'role',
            icon: '',
            name: 'role 2',
            description: 'A perfect role',
          },
        ],
      },
    );
    await flushPromises();
    const catalogCards = wrapper.findAll('div.card');

    expect(catalogCards.length).toEqual(2);
  });

  it('does not display pagination if equal to or less than 10 results', () => {
    const wrapper = mountComponent({ totalCount: 10 });
    const paginationComponent = wrapper.find('.pagination-dropdown');

    expect(paginationComponent.exists()).toBeFalsy();
  });

  it('displays pagination if more than 10 results', async () => {
    const wrapper = mountComponent({ catalogItems: [{}], totalCount: 11 });
    await flushPromises();
    const paginationComponent = wrapper.find('.pagination-dropdown');

    expect(paginationComponent.exists()).toBeTruthy();
  });

  it('displays catalog item as requested if it is in the request cart', async () => {
    const wrapper = mountComponent(
      {
        catalogItems: mockCatalogItems,
      },
    );
    await flushPromises();
    const catalogCards = wrapper.findAll('div.card');
    expect(catalogCards[0].find('.card-footer').text()).toBe('checkAdded');
    expect(catalogCards[1].find('.card-footer').text()).toBe('addRequest');
  });

  it('emits out event to open details modal when item is clicked', async () => {
    const wrapper = mountComponent(
      {
        catalogItems: mockCatalogItems,
      },
    );
    const openItemDetailsSpy = jest.spyOn(wrapper.vm, 'openItemDetails').mockImplementation();
    await flushPromises();
    wrapper.vm.selectedTab = 2;
    const catalogCards = wrapper.findAll('div.card');
    catalogCards[1].trigger('click');
    await flushPromises();
    expect(openItemDetailsSpy).toHaveBeenCalledWith({
      appType: 'role',
      description: 'A perfect role',
      icon: '',
      id: 2,
      name: 'role 2',
      requested: false,
      templateName: 'template2',
    });
  });

  it('only shows entitlements tab when viewing recommended access', async () => {
    const wrapper = mountComponent(
      {
        catalogItems: mockRecommendationItems,
        initialTab: 'entitlement',
        requestType: 'recommendations',
      },
    );
    await flushPromises();
    const tabs = wrapper.find('.nav-tabs');
    const tabItems = tabs.findAll('.nav-item');
    expect(tabItems.length).toEqual(1);
  });

  it('shows recommended access for the access that has predictions', async () => {
    const wrapper = mountComponent(
      {
        catalogItems: mockRecommendationItems,
        initialTab: 'entitlement',
        requestType: 'recommendations',
      },
    );
    await flushPromises();
    const recommendedText = wrapper.findAll('.recommended-text');
    expect(recommendedText.length).toEqual(1);
    const iconSpan = wrapper.find('span[id="predictionIcon-1"]');
    expect(iconSpan.text()).toEqual('thumb_up_off_alt');
  });
});
