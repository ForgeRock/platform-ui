/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import OAuthReturn from './OAuthReturn';
import * as AuthenticationApi from '@/api/AuthenticationApi';
import i18n from '@/i18n';

AuthenticationApi.handlePostAuth = jest.fn().mockResolvedValue({
  data: {
    token: 'test-token',
  },
});

AuthenticationApi.loginWithDataStoreToken = jest.fn().mockResolvedValue({
  data: {},
});

Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    search: '?provider=test-provider',
    pathname: '/self-service/oauth/return',
  },
});

describe('OAuthReturn', () => {
  let routerPush;
  beforeEach(() => {
    ({ routerPush } = mockRouter());

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key) => key,
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });
  function mountComponent() {
    return mount(OAuthReturn, {
      global: {
        plugins: [i18n],
      },
    });
  }

  it('calls handlePostAuth on mount', async () => {
    mountComponent();
    await flushPromises();

    expect(AuthenticationApi.handlePostAuth).toHaveBeenCalledWith(atob('dataStoreToken'), {
      provider: ['test-provider'],
    });
  });

  it('routes to login on error', async () => {
    AuthenticationApi.handlePostAuth.mockRejectedValueOnce(new Error('Test error'));
    mountComponent();
    await flushPromises();

    expect(routerPush).toHaveBeenCalledWith('/login');
  });

  it('routes to profile when linked provider exists', async () => {
    mountComponent();
    await flushPromises();

    expect(routerPush).toHaveBeenCalledWith({ name: 'Profile' });
  });

  it('routes to dashboard when no originalToken and no linked provider', async () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => null,
        removeItem: jest.fn(),
      },
      writable: true,
    });
    mountComponent();
    await flushPromises();

    expect(routerPush).toHaveBeenCalledWith('/');
  });

  it('routes to account claiming if login with data store token fails', async () => {
    AuthenticationApi.loginWithDataStoreToken.mockRejectedValueOnce(new Error('Test error'));
    mountComponent();
    await flushPromises();

    expect(routerPush).toHaveBeenCalledWith({
      name: 'AccountClaiming',
    });
  });
});
