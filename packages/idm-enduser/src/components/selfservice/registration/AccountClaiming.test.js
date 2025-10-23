/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import RegistrationMock from './mocks/RegistrationMock';
import AccountClaiming from './AccountClaiming';
import * as SelfServiceApi from '@/api/SelfServiceApi';
import * as AuthenticationApi from '@/api/AuthenticationApi';
import i18n from '@/i18n';

mockValidation();
mockRouter();

AuthenticationApi.loginWithDataStoreToken = jest.fn().mockResolvedValue({});

const initialStage = {
  type: 'parameters',
  tag: 'initial',
};

const claimStage = {
  type: 'socialUserClaim',
  tag: 'initial',
  token: 'test-token',
};

const endStage = {
  type: 'localAutoLogin',
  tag: 'end',
  status: {
    success: true,
  },
  additions: {
    successUrl: '',
  },
};

describe('AccountClaiming', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    SelfServiceApi.loadData = jest.fn().mockResolvedValue({
      data: initialStage,
    });

    SelfServiceApi.advanceStage = jest.fn().mockResolvedValueOnce({
      data: claimStage,
    }).mockResolvedValueOnce({
      data: endStage,
    });
  });

  function mountComponent() {
    return mount(AccountClaiming, {
      props: {
        selfServiceDetails: RegistrationMock,
        isTesting: true,
      },
      global: {
        plugins: [i18n],
        mocks: {
          $store: { state: {} },
        },
      },
    });
  }

  it('loads self service data and sets child component on mount', async () => {
    mountComponent();
    await flushPromises();

    expect(SelfServiceApi.loadData).toHaveBeenCalledWith('socialUserClaim');
    expect(SelfServiceApi.advanceStage).toHaveBeenCalledWith({ input: {} }, 'socialUserClaim', true);
  });

  it('submits client token for the initial stage', async () => {
    mountComponent();
    await flushPromises();

    expect(SelfServiceApi.advanceStage).toHaveBeenCalledWith({ input: {} }, 'socialUserClaim', true);
    expect(SelfServiceApi.advanceStage).toHaveBeenCalledWith(
      {
        input: { clientToken: null },
        token: 'test-token',
      },
      'socialUserClaim',
      true,
    );
  });

  it('routes to registration on successful completion', async () => {
    const { routerPush } = mockRouter();
    mountComponent();
    await flushPromises();

    expect(routerPush).toHaveBeenCalledWith({ name: 'Registration', params: { clientToken: null } });
  });

  it('routes to login on error', async () => {
    const { routerPush } = mockRouter();
    SelfServiceApi.advanceStage = jest.fn().mockResolvedValueOnce({
      data: 'badStage',
    });

    mountComponent();
    await flushPromises();

    expect(routerPush).toHaveBeenCalledWith('/login');
  });
});
