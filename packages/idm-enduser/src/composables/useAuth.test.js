/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import * as SchemaApi from '@forgerock/platform-shared/src/api/SchemaApi';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { flushPromises } from '@vue/test-utils';
import { useEnduserStore } from '@forgerock/platform-shared/src/stores/enduser';
import * as PrivilegeApi from '@forgerock/platform-shared/src/api/PrivilegeApi';
import { useAuth } from './useAuth';
import * as AuthenticationApi from '../api/AuthenticationApi';

describe('useAuth composable', () => {
  beforeEach(() => {
    setupTestPinia();
  });

  it('should login idm enduser correctly', async () => {
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

    const { loginIdmEnduser } = useAuth();
    await loginIdmEnduser('test', 'test');

    await flushPromises();

    const userStore = useUserStore();
    const enduserStore = useEnduserStore();
    expect(userStore.userId).toBe('test');
    expect(userStore.managedResource).toBe('managed/user');
    expect(enduserStore.setProfile).toBeCalledWith({
      userName: 'john.doe',
      givenName: 'John',
      sn: 'Doe',
      mail: 'test@mail.com',
    });
    expect(userStore.privileges).toEqual(['idm-admin']);
    expect(enduserStore.managedResourceSchema).toEqual({
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
    });
  });

  it('should redirect to admin url if user is openidm-admin', async () => {
    process.env.VUE_APP_ADMIN_URL = 'http://openidm.com';
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://idm-enduser.com',
      },
      writable: true,
    });
    AuthenticationApi.login = jest.fn().mockResolvedValue({
      data: {
        authorization: {
          id: 'openidm-admin',
          component: 'managed/user',
        },
      },
    });

    const { loginIdmEnduser } = useAuth();
    await loginIdmEnduser('test', 'test');

    expect(window.location.href).toBe('http://openidm.com');
  });

  it('should restore the idm session correctly', async () => {
    AuthenticationApi.getAccessToken = jest.fn().mockResolvedValue({
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

    const { restoreIdmEnduserSession } = useAuth();
    restoreIdmEnduserSession();

    await flushPromises();

    const userStore = useUserStore();
    const enduserStore = useEnduserStore();
    expect(userStore.userId).toBe('test');
    expect(userStore.managedResource).toBe('managed/user');
    expect(enduserStore.setProfile).toBeCalledWith({
      userName: 'john.doe',
      givenName: 'John',
      sn: 'Doe',
      mail: 'test@mail.com',
    });
    expect(userStore.privileges).toEqual(['idm-admin']);
    expect(enduserStore.managedResourceSchema).toEqual({
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
    });
  });

  it('should check if user is authenticated correctly', () => {
    const { isAuthenticated } = useAuth();

    const userStore = useUserStore();
    userStore.userId = 'test';

    expect(isAuthenticated()).toBe(true);
  });

  it('not authenticated by default', () => {
    const { isAuthenticated } = useAuth();
    expect(isAuthenticated()).toBe(false);
  });

  it('should initialize logout correctly', () => {
    const { initializeLogout } = useAuth();
    initializeLogout();

    expect(window.logout).toBeDefined();
  });

  it('should logout correctly', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        hash: '/dashboard',
      },
      writable: true,
    });

    const { initializeLogout } = useAuth();
    AuthenticationApi.logout = jest.fn();
    initializeLogout();

    window.logout();

    await flushPromises();

    expect(AuthenticationApi.logout).toBeCalled();
    const userStore = useUserStore();
    expect(userStore.userId).toBe('');
    expect(userStore.managedResource).toBe('');
    expect(userStore.givenName).toBe('');
    expect(userStore.sn).toBe('');
    expect(userStore.email).toBe('');
    expect(userStore.userName).toBe('');
    expect(userStore.privileges).toEqual({});
    const enduserStore = useEnduserStore();
    expect(enduserStore.managedResourceSchema).toEqual({});
    expect(window.location.hash).toBe('/login');
  });
});
