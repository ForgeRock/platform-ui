/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import Notifications from '@kyvg/vue3-notification';
import MediaMixin from '@forgerock/platform-shared/src/mixins/MediaMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import * as CatalogApi from '@forgerock/platform-shared/src/api/governance/CatalogApi';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as PolicyApi from '@forgerock/platform-shared/src/api/governance/PolicyApi';
import { getPriorityImageSrc } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import NewRequest from './index';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/utils/governance/AccessRequestUtils');
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    consumer: {
      web: {
        '1_0-web': { id: 'web', displayName: 'Web Application', image: 'web.png' },
      },
    },
  }),
}));

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
CommonsApi.getIgaAccessRequest.mockImplementation(() => Promise.resolve({
  data: {
    requireRequestJustification: false,
    requireRejectJustification: false,
    requireApproveJustification: false,
    defaultApprover: '',
    allowSelfApproval: false,
  },
}));

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

    ManagedResourceApi.getManagedResourceList = jest.fn().mockImplementation(() => Promise.resolve({
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

  it('should perform an SOD check if one user is requesting at least one entitlement', async () => {
    const wrapper = await mountComponent();
    CommonsApi.getResource.mockImplementation(() => Promise.resolve({
      data: {
        result: [],
      },
    }));
    const scanApi = jest.spyOn(PolicyApi, 'scanNewEntitlementAccess').mockImplementation(() => Promise.resolve({ data: { result: [{}] } }));

    await flushPromises();
    const requestCart = wrapper.findComponent({ name: 'RequestCart' });
    wrapper.vm.requestCartItems = [
      {
        itemType: 'entitlement',
        id: 'entitlementId',
        assignmentId: 'assignmentId',
      },
    ];
    await flushPromises();
    await requestCart.vm.$emit('submit-new-request', {});
    await flushPromises();

    expect(scanApi).toHaveBeenCalled();
  });

  it('should call to create a request if the SOD check returns no violations', async () => {
    const wrapper = await mountComponent();
    CommonsApi.getResource.mockImplementation(() => Promise.resolve({
      data: {
        result: [],
      },
    }));
    const scanApi = jest.spyOn(PolicyApi, 'scanNewEntitlementAccess').mockImplementation(() => Promise.resolve({ data: { result: [] } }));
    const requestApi = jest.spyOn(AccessRequestApi, 'saveNewRequest').mockImplementation(() => Promise.resolve({ data: [] }));

    await flushPromises();
    const requestCart = wrapper.findComponent({ name: 'RequestCart' });
    wrapper.vm.requestCartItems = [
      {
        itemType: 'entitlement',
        id: 'entitlementId',
        assignmentId: 'assignmentId',
      },
    ];
    await flushPromises();
    await requestCart.vm.$emit('submit-new-request', {});
    await flushPromises();

    expect(scanApi).toHaveBeenCalled();
    expect(requestApi).toHaveBeenCalled();
  });

  it('should submit request with requestData if it is an application with request data', async () => {
    const wrapper = await mountComponent();
    CommonsApi.getResource.mockImplementation(() => Promise.resolve({
      data: {
        result: [],
      },
    }));
    const requestApi = jest.spyOn(AccessRequestApi, 'saveNewRequest').mockImplementation(() => Promise.resolve({ data: [] }));

    await flushPromises();
    const requestCart = wrapper.findComponent({ name: 'RequestCart' });
    wrapper.vm.requestCartItems = [
      {
        itemType: 'application',
        id: 'applicationId',
        requestData: { test: 'test' },
      },
    ];
    await flushPromises();
    await requestCart.vm.$emit('submit-new-request', {});
    await flushPromises();

    expect(requestApi).toHaveBeenCalledWith({
      catalogs: [
        {
          data: {
            form: {
              test: 'test',
            },
          },
          id: 'applicationId',
          type: 'application',
        },
      ],
      users: ['123'],
    });
  });
});
