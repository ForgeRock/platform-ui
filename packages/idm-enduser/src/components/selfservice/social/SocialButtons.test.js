/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import SocialButtons from './SocialButtons';
import * as AuthenticationApi from '@/api/AuthenticationApi';
import i18n from '@/i18n';

const mockProviders = [
  {
    provider: 'google',
    uiConfig: {
      buttonCustomStyle: 'background: red;',
      buttonCustomStyleHover: 'background: blue;',
      buttonImage: 'google.png',
      buttonDisplayName: 'Google',
      iconClass: 'fa-google',
    },
  },
  {
    provider: 'facebook',
    uiConfig: {
      buttonCustomStyle: 'background: green;',
      buttonCustomStyleHover: 'background: yellow;',
      buttonImage: '',
      buttonDisplayName: 'Facebook',
      iconClass: 'fa-facebook',
    },
  },
];

Object.defineProperty(window, 'location', {
  value: {
    href: 'http://idm-enduser.com',
  },
  writable: true,
});

AuthenticationApi.getAuthenticationConfig = jest.fn().mockResolvedValue({
  data: {
    providers: mockProviders,
  },
});
AuthenticationApi.logout = jest.fn().mockResolvedValue({});

describe('SocialButtons', () => {
  function mountComponent(propsData = {}) {
    return mount(SocialButtons, {
      props: {
        ...propsData,
      },
      global: {
        plugins: [i18n],
      },
    });
  }

  it('calls to get authentication config on mount', async () => {
    mountComponent();
    await flushPromises();

    expect(AuthenticationApi.getAuthenticationConfig).toHaveBeenCalled();
  });

  it('renders social buttons for each provider', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].text()).toContain('Google');
    expect(buttons[1].text()).toContain('Facebook');
  });

  it('shows sign-up message when signIn prop is false', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].text()).toContain('Sign up with Google');
    expect(buttons[1].text()).toContain('Sign up with Facebook');
  });

  it('shows sign-in message when signIn prop is true', async () => {
    const wrapper = mountComponent({ signIn: true });
    await flushPromises();

    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].text()).toContain('Sign in with Google');
    expect(buttons[1].text()).toContain('Sign in with Facebook');
  });

  it('calls to get auth redirect on button click', async () => {
    const mockRedirectResponse = {
      data: {
        token: 'mockToken',
        redirect: 'http://redirect.url',
      },
    };
    AuthenticationApi.getAuthRedirect = jest.fn().mockResolvedValue(mockRedirectResponse);

    const wrapper = mountComponent();
    await flushPromises();

    const buttons = wrapper.findAll('button');
    await buttons[0].trigger('click');

    expect(AuthenticationApi.getAuthRedirect).toHaveBeenCalledWith({ landingPage: 'undefined//undefined/#/login?_oauthReturn=true&provider=google&gotoURL=%23', provider: 'google' });
  });
});
