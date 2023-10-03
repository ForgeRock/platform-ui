/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable global-require */
import * as configApi from '@forgerock/platform-shared/src/api/ConfigApi';
import * as overrideTranslations from '@forgerock/platform-shared/src/utils/overrideTranslations';
import * as axios from 'axios';
import * as sdk from '@forgerock/javascript-sdk';
import router from '@/router';

describe('main.js', () => {
  axios.create.mockImplementation(() => ({
    get: jest.fn().mockImplementation(() => Promise.resolve({ data: {} })),
  }));
  configApi.getUiConfig = jest.fn().mockReturnValue(Promise.resolve({ data: { configuration: { lang: 'en' } } }));
  overrideTranslations.getTranslationOverridesForLocale = jest.fn().mockReturnValue(Promise.resolve({ data: {} }));

  describe('/logout url flow', () => {
    const sdkSpy = jest.spyOn(sdk.SessionManager, 'logout').mockImplementation(() => Promise.resolve());

    it('does not call sdk logout if route is not logout', () => {
      document.body.innerHTML = '<div id="app"></div>';
      require('./main');

      router.push('/login');
      expect(router.history.current.path).toBe('/');
      expect(sdkSpy).not.toHaveBeenCalled();
    });

    it('logs out of root when root was logged into', () => {
      document.body.innerHTML = '<div id="app"></div>';
      require('./main');

      router.push('/logout');
      expect(router.history.current.path).toBe('/');
      expect(sdkSpy).toHaveBeenCalledWith({ realmPath: 'root' });
    });

    it('logs out of bravo when bravo is specified in logout url query params', () => {
      document.body.innerHTML = '<div id="app"></div>';
      require('./main');

      router.push('/logout?realm=bravo');
      expect(sdkSpy).toHaveBeenCalledWith({ realmPath: 'bravo' });
    });

    it('logs out of delta when delta was logged into', () => {
      document.body.innerHTML = '<div id="app"></div>';
      localStorage.setItem('originalLoginRealm', 'delta');
      require('./main');

      router.push('/logout');
      expect(sdkSpy).toHaveBeenCalledWith({ realmPath: 'delta' });
    });
  });
});
