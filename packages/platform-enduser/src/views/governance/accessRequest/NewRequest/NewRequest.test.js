/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import getPriorityImageSrc from '@/components/utils/governance/AccessRequestUtils';
import NewRequest from './index';
import i18n from '@/i18n';

jest.mock('@/components/utils/governance/AccessRequestUtils');

describe('NewRequest', () => {
  const requestCartItems = [
    {
      description: 'ServiceNow',
      icon: '',
      id: '1',
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
    const wrapper = mountComponent();
    await flushPromises();

    // Find first application button and click Add request
    expect(wrapper.vm.requestCartItems).toStrictEqual([]);
    const accessRequestCatalog = wrapper.findAll('span[class="hover-underline color-blue"]').at(0);
    expect(accessRequestCatalog.exists()).toBe(true);
    accessRequestCatalog.trigger('click');
    await flushPromises();

    expect(wrapper.vm.requestCartItems.length).toBe(1);
    expect(wrapper.vm.requestCartItems[0].itemType).toBe('application');
    expect(wrapper.vm.requestCartItems[0].templateName).toBe('servicenow');
  });

  it('should remove item from cart', async () => {
    const wrapper = mountComponent({}, { requestCartItems });
    await flushPromises();

    // Find first application button and click Remove request
    expect(wrapper.vm.requestCartItems).toBe(requestCartItems);
    const accessRequestCatalog = wrapper.find('span[class="mr-2 text-success material-icons-outlined"]');
    accessRequestCatalog.trigger('click');
    await flushPromises();

    expect(wrapper.vm.requestCartItems).toStrictEqual([]);
  });
});
