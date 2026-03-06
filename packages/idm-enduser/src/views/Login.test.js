/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as SchemaApi from '@forgerock/platform-shared/src/api/SchemaApi';
import { flushPromises, mount } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as PrivilegeApi from '@forgerock/platform-shared/src/api/PrivilegeApi';
import * as ConfigApi from '@forgerock/platform-shared/src/api/ConfigApi';
import Login from './Login';
import i18n from '@/i18n';
import * as AuthenticationApi from '../api/AuthenticationApi';

const { routerPush } = mockRouter();

describe('Login', () => {
  function setup() {
    setupTestPinia();
    return mount(Login, {
      global: {
        plugins: [i18n],
      },
    });
  }

  it('renders the login form correctly', () => {
    const wrapper = setup();

    expect(wrapper.vm.errorMessage).toBe('');
    expect(wrapper.vm.userName).toBe('');
    expect(wrapper.vm.password).toBe('');
    const usernameField = wrapper.find('input[name="Username"]');
    expect(usernameField.exists()).toBe(true);
    const passwordField = wrapper.find('input[name="Password"]');
    expect(passwordField.exists()).toBe(true);
    const loginButton = wrapper.find('button[type="submit"]');
    expect(loginButton.exists()).toBe(true);
  });

  it('should login correctly', async () => {
    const wrapper = setup();

    AuthenticationApi.logout = jest.fn().mockResolvedValue({});
    AuthenticationApi.login = jest.fn().mockResolvedValue({
      data: {
        authorization: {
          id: 'test',
          component: 'managed/user',
        },
      },
    });
    AuthenticationApi.getProfile = jest.fn().mockResolvedValue({
      data: {
        userName: 'john.doe',
        givenName: 'John',
        sn: 'Doe',
        mail: 'test@mail.com',
      },
    });
    PrivilegeApi.getUserPrivileges = jest.fn().mockResolvedValue({
      data: ['idm-admin'],
    });
    SchemaApi.getSchema = jest.fn().mockResolvedValue({
      data: {
        properties: {
          userName: {
            type: 'string',
          },
          givenName: {
            type: 'string',
          },
          sn: {
            type: 'string',
          },
          mail: {
            type: 'string',
          },
        },
      },
    });
    ConfigApi.getFeatures = jest.fn().mockResolvedValue({
      data: {
        result: [],
      },
    });

    const usernameField = wrapper.find('input[name="Username"]');
    await usernameField.setValue('test');
    const passwordField = wrapper.find('input[name="Password"]');
    await passwordField.setValue('test');
    const loginButton = wrapper.find('button[type="submit"]');
    await loginButton.trigger('submit');

    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe('');
    expect(routerPush).toHaveBeenCalledTimes(1);
    expect(routerPush).toHaveBeenCalledWith({ name: 'Dashboard' });
  });

  it('should display an error message when login fails', async () => {
    const wrapper = setup();

    AuthenticationApi.logout = jest.fn().mockResolvedValue({});
    AuthenticationApi.login = jest.fn().mockRejectedValue({
      status: 401,
    });

    const usernameField = wrapper.find('input[name="Username"]');
    await usernameField.setValue('test');
    const passwordField = wrapper.find('input[name="Password"]');
    await passwordField.setValue('test');
    const loginButton = wrapper.find('button[type="submit"]');
    await loginButton.trigger('submit');

    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe('Invalid username or password');
  });

  it('should display an error message when login fails with a different status code', async () => {
    const wrapper = setup();

    AuthenticationApi.logout = jest.fn().mockResolvedValue({});
    AuthenticationApi.login = jest.fn().mockRejectedValue({
      status: 500,
    });

    const usernameField = wrapper.find('input[name="Username"]');
    await usernameField.setValue('test');
    const passwordField = wrapper.find('input[name="Password"]');
    await passwordField.setValue('test');
    const loginButton = wrapper.find('button[type="submit"]');
    await loginButton.trigger('submit');

    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe('Login failure');
  });
});
