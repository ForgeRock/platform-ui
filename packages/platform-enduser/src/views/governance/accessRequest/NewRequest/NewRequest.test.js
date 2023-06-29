/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import NewRequest from './index';
import i18n from '@/i18n';

describe('NewRequest', () => {
  const RestMixin = {
    methods: {
      getRequestService: jest.fn().mockImplementation({ post: () => Promise.resolve() }),
    },
  };
  window.matchMedia = jest.fn((param) => param);
  function mountComponent(overrideParams = {}) {
    const wrapper = mount(NewRequest, {
      i18n,
      mixins: [RestMixin],
      mocks: {
        $router: { push: jest.fn() },
        $route: {
          params: {
            requestingFor: {
              name: 'Barbara Jensen',
              userName: 'bjensen',
            },
          },
          ...overrideParams,
        },
      },
      stubs: ['RouterLink'],
    });
    return wrapper;
  }

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

    let shoppingCartSidePanel = wrapper.find('div[class="fr-cart-panel position-fixed shadow-lg h-100 pb-4"]');
    expect(shoppingCartSidePanel.exists()).toBe(true);

    const shoppingCartButton = wrapper.find('#expandRequestCart');
    shoppingCartButton.trigger('click');
    await flushPromises();

    shoppingCartSidePanel = wrapper.find('div[class="fr-cart-panel position-fixed shadow-lg h-100 pb-4"]');
    expect(shoppingCartSidePanel.exists()).toBe(false);
  });
});
