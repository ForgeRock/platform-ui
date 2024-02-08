/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import Notifications from '@kyvg/vue3-notification';
import MediaMixin from '@forgerock/platform-shared/src/mixins/MediaMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import * as CatalogApi from '@forgerock/platform-shared/src/api/governance/CatalogApi';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import getPriorityImageSrc from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import NewRequest from './index';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/utils/governance/AccessRequestUtils');
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
  const RestMixin = {
    methods: {
      getRequestService: jest.fn().mockImplementation({ post: () => Promise.resolve() }),
    },
  };
  window.matchMedia = jest.fn((param) => param);
  async function mountComponent(overrideParams = {}, overrideData = {}) {
    setupTestPinia();
    const wrapper = mount(NewRequest, {
      global: {
        stubs: ['RouterLink'],
        plugins: [i18n, Notifications],
        mocks: {
          $router: { push: jest.fn() },
          $store: {
            state: {
              requestCartUsers: [{
                name: 'Barbara Jensen',
                userName: 'bjensen',
                id: '123',
              }],
            },
            ...overrideParams,
          },
          $bvModal: {
            show: jest.fn(),
          },
        },
        mixins: [RestMixin, MediaMixin, NotificationMixin],
      },
    });
    await wrapper.setData(overrideData);
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
    const wrapper = await mountComponent();
    await flushPromises();

    const breadcrumb = wrapper.find('router-link-stub');
    expect(breadcrumb.exists()).toBe(true);
    expect(breadcrumb.attributes().to).toBe('/my-requests');
  });

  it('should expand side panel when cart is clicked', async () => {
    const wrapper = await mountComponent();
    await flushPromises();

    let shoppingCartSidePanel = wrapper.find('div[class="fr-cart-panel position-fixed shadow-lg h-100 overflow-auto"]');
    expect(shoppingCartSidePanel.exists()).toBe(true);

    const shoppingCartButton = wrapper.find('#expandRequestCart');
    shoppingCartButton.trigger('click');
    await flushPromises();

    shoppingCartSidePanel = wrapper.find('div[class="fr-cart-panel position-fixed shadow-lg h-100 overflow-auto"]');
    expect(shoppingCartSidePanel.exists()).toBe(false);
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

    const wrapper = await mountComponent();
    await flushPromises();

    let modalTitle = wrapper.find('h1.h5.modal-title');
    expect(modalTitle.exists()).toBe(false);
    expect(wrapper.vm.requestCartItems).toStrictEqual([]);

    await wrapper.setData({ isTesting: true });
    const catalogItemRequestButton = wrapper.findAll('span[class="hover-underline color-blue"]')[0];
    expect(catalogItemRequestButton.exists()).toBe(true);
    catalogItemRequestButton.trigger('click');
    await flushPromises();

    modalTitle = wrapper.find('h1.h5.modal-title');
    expect(modalTitle.exists()).toBe(true);
    expect(modalTitle.text()).toBe('Request Error');
  });

  it('openUserModal called saves currentUserSelectedModal data and shows GovernanceUserDetailsModal', async () => {
    const wrapper = await mountComponent();
    const id = 'id-test';
    const user = {
      givenName: 'Test',
      sn: 'Test',
    };

    CommonsApi.getResource.mockImplementation(() => Promise.resolve({
      data: {
        result: [user],
      },
    }));
    wrapper.vm.openUserDetailsModal(id);
    await flushPromises();

    expect(wrapper.vm.currentUser).toEqual(user);
    expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('GovernanceUserDetailsModal');
  });

  it('searchApplications should call the get resources to filter the non authorative applications', async () => {
    const wrapper = await mountComponent();
    CommonsApi.getResource.mockImplementation(() => Promise.resolve({
      data: {
        result: [],
      },
    }));
    wrapper.vm.searchApplications('name');
    await flushPromises();

    expect(CommonsApi.getResource).toHaveBeenCalledWith('application', { queryString: 'name', authoritative: false });
  });
});
