/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable global-require */
import * as configApi from '@forgerock/platform-shared/src/api/ConfigApi';
import * as overrideTranslations from '@forgerock/platform-shared/src/utils/overrideTranslations';
import * as sdk from '@forgerock/javascript-sdk';
import { flushPromises } from '@vue/test-utils';
import router from '@/router';

describe('main.js', () => {
  configApi.getUiConfig = jest.fn().mockReturnValue(Promise.resolve({ data: { configuration: { lang: 'en' } } }));
  overrideTranslations.setLocales = jest.fn().mockReturnValue(Promise.resolve({ data: {} }));
  overrideTranslations.overrideTranslations = jest.fn().mockReturnValue(Promise.resolve());

  jest.mock('vue', () => {
    const originalVue = jest.requireActual('vue');
    return {
      ...originalVue,
      createApp: () => ({
        use: jest.fn(),
        mount: jest.fn(),
      }),
    };
  });

  document.body.innerHTML = '<div id="appRoot"></div>';
  require('./main');

  describe('/logout url flow', () => {
    const sdkSpy = jest.spyOn(sdk.SessionManager, 'logout').mockImplementation(() => Promise.resolve());

    it('does not call sdk logout if route is not logout', async () => {
      router.push('/login');

      await flushPromises();

      expect(router.currentRoute.value.path).toBe('/');
      expect(sdkSpy).not.toHaveBeenCalled();
    });

    it('logs out of root when root was logged into', async () => {
      router.push('/logout');

      await flushPromises();

      expect(router.currentRoute.value.path).toBe('/');
      expect(sdkSpy).toHaveBeenCalledWith({ realmPath: 'root' });
    });

    it('logs out of bravo when bravo is specified in logout url query params', async () => {
      router.push('/logout?realm=bravo');

      await flushPromises();

      expect(sdkSpy).toHaveBeenCalledWith({ realmPath: 'bravo' });
    });

    it('logs out of delta when delta was logged into', async () => {
      localStorage.setItem('originalLoginRealm', 'delta');

      router.push('/logout');

      await flushPromises();

      expect(sdkSpy).toHaveBeenCalledWith({ realmPath: 'delta' });
    });
  });
});
