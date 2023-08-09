/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, createWrapper } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import getPriorityImageSrc from '@/components/utils/governance/AccessRequestUtils';
import * as CatalogApi from '@/api/governance/CatalogApi';
import * as AccessRequestApi from '@/api/governance/AccessRequestApi';
import NewRequest from './index';
import i18n from '@/i18n';

jest.mock('@/components/utils/governance/AccessRequestUtils');
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

CatalogApi.searchCatalog = jest.fn().mockReturnValue({
  data: {
    result: [
      {
        id: '111',
        application: {
          description: 'My Service Now App',
          icon: '',
          id: '1',
          name: 'My Service Now App',
          templateName: 'servicenow',
          templateVersion: '2.0',
        },
      },
    ],
  },
});

describe('NewRequest', () => {
  const requestCartItems = [
    {
      description: 'ServiceNow',
      icon: '',
      id: '111',
      itemType: 'applications',
      name: 'My Service Now App',
      templateName: 'servicenow',
    },
  ];
  const RestMixin = {
    methods: {
      getRequestService: jest.fn().mockImplementation({ post: () => Promise.resolve() }),
    },
  };
  window.matchMedia = jest.fn((param) => param);
  function mountComponent(overrideParams = {}, overrideData = {}) {
    const wrapper = mount(NewRequest, {
      i18n,
      mixins: [RestMixin],
      mocks: {
        $router: { push: jest.fn() },
        $route: {
          params: {
            requestingFor: [{
              name: 'Barbara Jensen',
              userName: 'bjensen',
              id: '123',
            }],
          },
          ...overrideParams,
        },
      },
      stubs: ['RouterLink'],
    });
    wrapper.setData(overrideData);
    return wrapper;
  }

  window.matchMedia = jest.fn((param) => param);

  beforeEach(() => {
    getPriorityImageSrc.mockClear();

    AccessRequestApi.validateRequest = jest.fn().mockReturnValue({
      data: {
        errors: [],
      },
    });
    CommonsApi.getUserGrants.mockImplementation(() => Promise.resolve({ data: { results: [] } }));
  });

  it('should render with top navigation bar including breadcrumb', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const breadcrumb = wrapper.find('h1[class="text-truncate h4"]');
    expect(breadcrumb.exists()).toBe(true);
    expect(breadcrumb.find('span[class="align-middle"]').text()).toBe('My Requests');
  });

  it('should expand side panel when cart is clicked', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    let shoppingCartSidePanel = wrapper.find('div[class="fr-cart-panel position-fixed shadow-lg h-100 overflow-auto"]');
    expect(shoppingCartSidePanel.exists()).toBe(true);

    const shoppingCartButton = wrapper.find('#expandRequestCart');
    shoppingCartButton.trigger('click');
    await flushPromises();

    shoppingCartSidePanel = wrapper.find('div[class="fr-cart-panel position-fixed shadow-lg h-100 overflow-auto"]');
    expect(shoppingCartSidePanel.exists()).toBe(false);
  });

  it('should add item to cart', async () => {
    const wrapper = mountComponent({}, { loading: false });
    await flushPromises();

    // Find first application button and click Add request
    expect(wrapper.vm.requestCartItems).toStrictEqual([]);
    const catalogItemRequestButton = wrapper.findAll('span[class="hover-underline color-blue"]').at(0);
    expect(catalogItemRequestButton.exists()).toBe(true);
    catalogItemRequestButton.trigger('click');
    await flushPromises();

    expect(wrapper.vm.requestCartItems.length).toBe(1);
    expect(wrapper.vm.requestCartItems[0].itemType).toBe('application');
    expect(wrapper.vm.requestCartItems[0].templateName).toBe('servicenow');
  });

  it('should remove item from cart', async () => {
    const wrapper = mountComponent({}, { requestCartItems, loading: false });
    await flushPromises();

    // Find first application button and click Remove request
    expect(wrapper.vm.requestCartItems).toBe(requestCartItems);
    const accessRequestCatalog = wrapper.find('span[class="mr-2 text-success material-icons-outlined"]');
    accessRequestCatalog.trigger('click');
    await flushPromises();

    expect(wrapper.vm.requestCartItems).toStrictEqual([]);
  });

  it('should open error modal when user already has access', async () => {
    AccessRequestApi.validateRequest = jest.fn().mockReturnValue({
      data: {
        errors: [
          {
            userId: '123',
            error: 'DUPLICATED',
          },
        ],
      },
    });

    const wrapper = mountComponent();
    await flushPromises();

    let modalTitle = wrapper.find('h1.h5.modal-title');
    expect(modalTitle.exists()).toBe(false);
    expect(wrapper.vm.requestCartItems).toStrictEqual([]);

    wrapper.setData({ isTesting: true });
    const catalogItemRequestButton = wrapper.findAll('span[class="hover-underline color-blue"]').at(0);
    expect(catalogItemRequestButton.exists()).toBe(true);
    catalogItemRequestButton.trigger('click');
    await flushPromises();

    modalTitle = wrapper.find('h1.h5.modal-title');
    expect(modalTitle.exists()).toBe(true);
    expect(modalTitle.text()).toBe('Request Error');
  });

  it('openUserModal called saves currentUserSelectedModal data and shows GovernanceUserDetailsModal', async () => {
    const wrapper = mountComponent();
    const rootWrapper = createWrapper(wrapper.vm.$root);
    const id = 'id-test';
    const user = {
      givenName: 'Test',
      sn: 'Test',
    };

    CommonsApi.getUserDetails.mockImplementation(() => Promise.resolve({
      data: {
        result: [user],
      },
    }));
    wrapper.vm.openUserDetailsModal(id);
    await flushPromises();

    expect(wrapper.vm.currentUser).toEqual(user);
    expect(rootWrapper.emitted('bv::show::modal')).toBeTruthy();
    expect(rootWrapper.emitted('bv::show::modal').length).toBe(1);
    expect(rootWrapper.emitted('bv::show::modal')[0][0]).toEqual('GovernanceUserDetailsModal');
  });
});
