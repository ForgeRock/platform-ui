/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import { setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';
import * as SelfServiceApi from '@/api/SelfServiceApi';
import * as AuthenticationApi from '@/api/AuthenticationApi';
import Social from './Social';
import i18n from '@/i18n';

mockModal();
jest.mock('@/api/SelfServiceApi');
jest.mock('@/api/AuthenticationApi');

SelfServiceApi.getIdentityProviders.mockResolvedValue({
  data: {
    providers: [
      {
        provider: 'facebook',
        uiConfig: {
          iconBackground: '#3b5998',
          iconClass: 'fa-facebook',
          iconFontColor: 'white',
          buttonImage: 'images/facebook.png',
          buttonClass: 'home',
          buttonDisplayName: 'Facebook',
          buttonCustomStyle: 'background-color: #3b5998;border-color: #3b5998; color: white;',
          buttonCustomStyleHover: 'background-color: #334b7d;border-color: #334b7d; color: white;',
        },
        propertyMap: [
          {
            source: 'id',
            target: 'id',
          },
          {
            source: 'name',
            target: 'displayName',
          },
          {
            source: 'first_name',
            target: 'givenName',
          },
          {
            source: 'last_name',
            target: 'familyName',
          },
          {
            source: 'email',
            target: 'email',
          },
          {
            source: 'email',
            target: 'username',
          },
          {
            source: 'locale',
            target: 'locale',
          },
          {
            source: 'picture',
            target: 'photoUrl',
            transform: {
              type: 'text/javascript',
              source: 'source.data.url',
            },
          },
        ],
        redirectUri: 'http://localhost:8889/',
        enabled: true,
      },
      {
        provider: 'google',
        uiConfig: {
          iconBackground: '#4184f3',
          iconClass: 'fa-google',
          iconFontColor: 'white',
          buttonImage: 'images/g-logo.png',
          buttonDisplayName: 'Google',
          buttonCustomStyle: 'background-color: #fff; color: #757575; border-color: #ddd;',
          buttonCustomStyleHover: 'color: #6d6d6d; background-color: #eee; border-color: #ccc;',
        },
        propertyMap: [
          {
            source: 'sub',
            target: 'id',
          },
          {
            source: 'name',
            target: 'displayName',
          },
          {
            source: 'given_name',
            target: 'givenName',
          },
          {
            source: 'family_name',
            target: 'familyName',
          },
          {
            source: 'picture',
            target: 'photoUrl',
          },
          {
            source: 'email',
            target: 'email',
          },
          {
            source: 'email',
            target: 'username',
          },
          {
            source: 'locale',
            target: 'locale',
          },
        ],
        redirectUri: 'http://localhost:8889/',
        enabled: true,
      },
    ],
  },
});

SelfServiceApi.getConnectedProviders.mockResolvedValue({
  data: {
    idps: [
      {
        _ref: 'managed/facebook/3321072124604699',
        _refResourceCollection: 'managed/facebook',
        _refResourceId: '3321072124604699',
        id: '3321072124604699',
        name: 'Michael Wong',
      },
    ],
  },
});

SelfServiceApi.getSocialProviderProfile.mockResolvedValue({
  data: [
    {
      id: 'testId',
      displayName: 'Michael Wong',
      givenName: 'Michael',
      familyName: 'Wong',
      email: 'test@test.com',
      username: 'test@test.com',
      photoUrl: 'someUrl',
    },
  ],
});

const piniaMockState = {
  initialState: {
    user: {
      userId: 'testId',
      managedResource: 'managed/user',
    },
  },
};

describe('Social', () => {
  setActivePinia(createTestingPinia(piniaMockState));
  function setup(propsData = {}) {
    return mount(Social, {
      global: {
        plugins: [i18n],
      },
      props: {
        isTesting: true,
        ...propsData,
      },
    });
  }

  it('has title and description', async () => {
    const wrapper = setup();
    await flushPromises();
    expect(wrapper.find('h2').text()).toBe('Social Sign-in');
    expect(wrapper.find('p').text()).toBe('Sign into your account using social identity providers.');
  });

  it('calls to get available and connected social providers', async () => {
    setup();
    await flushPromises();

    expect(SelfServiceApi.getIdentityProviders).toHaveBeenCalled();
    expect(SelfServiceApi.getConnectedProviders).toHaveBeenCalledWith('managed/user', 'testId');
  });

  describe('connected providers', () => {
    it('renders social provider profile data', async () => {
      const wrapper = setup();
      await flushPromises();

      const providers = wrapper.findAll('[data-testid="accordion-item-wrapper"]');
      const facebookProvider = providers[0];

      expect(facebookProvider.text()).toMatch('Facebook');
      expect(facebookProvider.text()).toMatch('Connected');
    });

    it('opens disconnect modal when disconnect button is clicked', async () => {
      const { modalShow } = mockModal();
      const wrapper = setup();
      await flushPromises();

      const providers = wrapper.findAll('[data-testid="accordion-item-wrapper"]');
      const facebookProvider = providers[0];
      const disconnectButton = facebookProvider.find('button');
      expect(disconnectButton.text()).toBe('Disconnect');
      await disconnectButton.trigger('click');

      expect(modalShow).toHaveBeenCalledWith('disconnectModal');

      const disconnectModal = wrapper.findComponent({ name: 'BModal' });
      expect(disconnectModal.exists()).toBe(true);
      expect(disconnectModal.text()).toMatch('Disconnect Facebook');
      expect(disconnectModal.text()).toMatch('If you disconnect, you will not be able to log in with Facebook.');
    });

    it('calls api to disconnect social provider when confirm disconnect button is clicked', async () => {
      const wrapper = setup();
      await flushPromises();

      const facebookProvider = wrapper.findAll('[data-testid="accordion-item-wrapper"]')[0];
      await facebookProvider.find('button').trigger('click');
      const disconnectModal = wrapper.findComponent({ name: 'BModal' });
      await disconnectModal.find('button.btn-danger').trigger('click');
      expect(SelfServiceApi.unbindSocialProvider).toHaveBeenCalledWith('managed/user', 'testId', 'facebook');
    });
  });

  describe('disconnected providers', () => {
    it('renders connect button for disconnected providers', async () => {
      const wrapper = setup();
      await flushPromises();

      const providers = wrapper.findAll('[data-testid="accordion-item-wrapper"]');
      const googleProvider = providers[1];

      expect(googleProvider.text()).toMatch('Google');
      expect(googleProvider.text()).toMatch('Not Connected');
    });

    it('calls api to connect social provider when connect button is clicked', async () => {
      const wrapper = setup();
      await flushPromises();

      const googleProvider = wrapper.findAll('[data-testid="accordion-item-wrapper"]')[1];
      const connectButton = googleProvider.find('button');
      expect(connectButton.text()).toBe('Connect');
      await connectButton.trigger('click');

      expect(AuthenticationApi.getAuthRedirect).toHaveBeenCalled();
    });
  });
});
