/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable global-require */
import * as configApi from '@forgerock/platform-shared/src/api/ConfigApi';
import * as overrideTranslations from '@forgerock/platform-shared/src/utils/overrideTranslations';
import { flushPromises } from '@vue/test-utils';
import { sdkTimeoutMiddleware } from '@forgerock/platform-shared/src/utils/sdkTimeoutMiddleware';
import store from '@/store';
import router from '@/router';

jest.mock('@forgerock/platform-shared/src/api/UilocaleApi');

const uilocaleApi = require('@forgerock/platform-shared/src/api/UilocaleApi');

// Module-scoped jest mocks. Names are `mock`-prefixed so Jest's hoisting
// allows them to be referenced inside `jest.mock` factories.
const mockTerminate = jest.fn(() => Promise.resolve());
const mockJourney = jest.fn(() => Promise.resolve({ terminate: mockTerminate }));
// Mock client held by the store on the happy path (pre-bootstrapped client).
const mockPreBootstrappedClient = { terminate: mockTerminate };
// Shared store instance returned by useJourneyClientStore() — writable so
// tests can control the client value directly.
const mockStoreInstance = { client: mockPreBootstrappedClient };

jest.mock('@forgerock/journey-client', () => ({
  journey: (...args) => mockJourney(...args),
}));

jest.mock('@forgerock/platform-shared/src/utils/amUrlUtils', () => ({
  // Mocked deterministically so test assertions match a stable URL shape
  // independent of the test's `process.env.VUE_APP_AM_URL` value. The real
  // helper's URL-canonicalisation behaviour is tested directly in
  // `journeyClient.test.js`.
  buildWellknownUrl: jest.fn((realm) => `https://example.com/am/oauth2/realms/${realm}/.well-known/openid-configuration`),
  buildAmBaseUrl: jest.fn(() => 'https://example.com/am'),
  normalizeRealm: jest.fn((realm) => (realm || 'root').replace(/^\/+/, '') || 'root'),
}));

// Mock the Pinia store so useJourneyClientStore(pinia) returns mockStoreInstance.
// The returned object's `client` property is writable — tests control the
// simulated bootstrapped/unbootstrapped state by assigning to mockStoreInstance.client.
jest.mock('@forgerock/platform-shared/src/stores/journeyClient', () => ({
  useJourneyClientStore: jest.fn(() => mockStoreInstance),
}));

describe('main.js', () => {
  uilocaleApi.getDefaultLocale = jest.fn().mockResolvedValue({ data: { defaultLocale: 'en' } });
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
  // The main.js branching now selects between wellknown (AIC/cloud) and
  // baseUrl + realmPath (ForgeOps) based on VUE_APP_FRAAS. Existing tests
  // assert the wellknown path; set FRAAS=true before requiring main.js so
  // startApp() takes that branch.
  process.env.VUE_APP_FRAAS = 'true';
  const { checkIfOpenedByIngressEnv } = require('./main');

  describe('bootstrap', () => {
    it('calls journey() with a wellknown URL and writes the client to the store', async () => {
      // The module-scope `require('./main')` above triggers startApp() which
      // awaits journey(). Flush microtasks so the bootstrap settles.
      await flushPromises();

      expect(mockJourney).toHaveBeenCalledWith(expect.objectContaining({
        config: expect.objectContaining({
          serverConfig: expect.objectContaining({
            wellknown: expect.stringMatching(/\/oauth2\/realms\/root\/\.well-known\/openid-configuration$/),
          }),
        }),
        // journey-client ignores `serverConfig.timeout`; the 60s timeout is
        // enforced by sdkTimeoutMiddleware in the middleware array.
        requestMiddleware: expect.arrayContaining([sdkTimeoutMiddleware]),
      }));
      // After bootstrap, useJourneyClientStore(pinia).client is assigned the
      // journey() result — the store instance's client property holds it.
      expect(mockStoreInstance.client).toEqual(expect.objectContaining({ terminate: expect.any(Function) }));
    });

    it('bootstraps with a non-root realm when ?realm=alpha is in the URL', async () => {
      // Save and override window.location.search so startApp() picks up the
      // realm query param when the isolated module runs.
      const originalSearch = window.location.search;
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...window.location, search: '?realm=alpha' },
      });

      jest.isolateModules(() => {
        // eslint-disable-next-line global-require
        const isolatedConfigApi = require('@forgerock/platform-shared/src/api/ConfigApi');
        isolatedConfigApi.getUiConfig = jest.fn().mockReturnValue(Promise.resolve({ data: { configuration: { lang: 'en' } } }));
        // eslint-disable-next-line global-require
        const isolatedOverrideTranslations = require('@forgerock/platform-shared/src/utils/overrideTranslations');
        isolatedOverrideTranslations.setLocales = jest.fn().mockReturnValue(Promise.resolve({ data: {} }));
        isolatedOverrideTranslations.overrideTranslations = jest.fn().mockReturnValue(Promise.resolve());
        // eslint-disable-next-line global-require
        require('./main');
      });
      await flushPromises();

      expect(mockJourney).toHaveBeenCalledWith(expect.objectContaining({
        config: expect.objectContaining({
          serverConfig: expect.objectContaining({
            wellknown: expect.stringMatching(/\/oauth2\/realms\/alpha\//),
          }),
        }),
      }));

      Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...window.location, search: originalSearch },
      });
    });
  });

  describe('/logout url flow', () => {
    beforeEach(() => {
      mockJourney.mockClear();
      mockTerminate.mockClear();
      // Restore the default: the store's client is the pre-bootstrapped client
      // so happy-path tests exercise the reuse path (FR-3 / AC-5).
      mockStoreInstance.client = mockPreBootstrappedClient;
    });

    it('does not call sdk logout if route is not logout', async () => {
      router.push('/login');

      await flushPromises();

      expect(router.currentRoute.value.path).toBe('/');
      expect(mockTerminate).not.toHaveBeenCalled();
    });

    it('calls terminate() on the pre-bootstrapped client and does not call journey() (happy path)', async () => {
      router.push('/logout');

      await flushPromises();

      expect(router.currentRoute.value.path).toBe('/');
      // The pre-bootstrapped client is reused — no new wellknown GET (FR-3 / AC-5).
      expect(mockJourney).not.toHaveBeenCalled();
      expect(mockTerminate).toHaveBeenCalledTimes(1);
    });

    it('still redirects when terminate() resolves with a GenericError object (pre-bootstrapped client)', async () => {
      mockTerminate.mockResolvedValueOnce({ error: 'session_not_found', message: 'No active session' });
      router.push('/logout');

      await flushPromises();

      expect(mockJourney).not.toHaveBeenCalled();
      expect(mockTerminate).toHaveBeenCalled();
      expect(router.currentRoute.value.path).toBe('/');
    });

    it('still redirects when terminate() throws (pre-bootstrapped client)', async () => {
      mockTerminate.mockRejectedValueOnce(new Error('Network error'));
      router.push('/logout');

      await flushPromises();

      expect(mockJourney).not.toHaveBeenCalled();
      expect(mockTerminate).toHaveBeenCalled();
      expect(router.currentRoute.value.path).toBe('/');
    });

    describe('when the store client is null (fallback)', () => {
      beforeEach(() => {
        // Override the default: simulate bootstrap failure so the logout guard
        // falls back to await journey({ wellknown }) (FR-4 / AC-6).
        mockStoreInstance.client = null;
      });

      it('logs out of root when root was logged into', async () => {
        router.push('/logout');

        await flushPromises();

        expect(router.currentRoute.value.path).toBe('/');
        expect(mockJourney).toHaveBeenCalledWith(expect.objectContaining({
          config: expect.objectContaining({
            serverConfig: expect.objectContaining({
              wellknown: expect.stringMatching(/\/oauth2\/realms\/root\/\.well-known\/openid-configuration$/),
            }),
          }),
          requestMiddleware: expect.arrayContaining([expect.any(Function)]),
        }));
        expect(mockTerminate).toHaveBeenCalled();
      });

      it('logs out of bravo when bravo is specified in logout url query params', async () => {
        router.push('/logout?realm=bravo');

        await flushPromises();

        expect(mockJourney).toHaveBeenCalledWith(expect.objectContaining({
          config: expect.objectContaining({
            serverConfig: expect.objectContaining({
              wellknown: expect.stringMatching(/\/oauth2\/realms\/bravo\/\.well-known\/openid-configuration$/),
            }),
          }),
        }));
        expect(mockTerminate).toHaveBeenCalled();
      });

      it('logs out of delta when delta was logged into', async () => {
        localStorage.setItem('originalLoginRealm', 'delta');

        router.push('/logout');

        await flushPromises();

        expect(mockJourney).toHaveBeenCalledWith(expect.objectContaining({
          config: expect.objectContaining({
            serverConfig: expect.objectContaining({
              wellknown: expect.stringMatching(/\/oauth2\/realms\/delta\/\.well-known\/openid-configuration$/),
            }),
          }),
        }));
        expect(mockTerminate).toHaveBeenCalled();
      });

      it('still redirects when terminate() resolves with a GenericError object', async () => {
        mockTerminate.mockResolvedValueOnce({ error: 'session_not_found', message: 'No active session' });
        router.push('/logout');

        await flushPromises();

        expect(mockTerminate).toHaveBeenCalled();
        expect(router.currentRoute.value.path).toBe('/');
      });

      it('still redirects when terminate() throws', async () => {
        mockTerminate.mockRejectedValueOnce(new Error('Network error'));
        router.push('/logout');

        await flushPromises();

        expect(mockTerminate).toHaveBeenCalled();
        expect(router.currentRoute.value.path).toBe('/');
      });
    });
  });

  describe('checkIfOpenedByIngressEnv', () => {
    beforeEach(() => {
      sessionStorage.clear();
    });

    it('defaults to fraasPromotionIngressUrl in shared state if fraasPromotionAllowableIngressUrls not present', () => {
      store.state.SharedStore.fraasPromotionIngressUrl = 'https://openam-test-dev.forgeblocks.com';
      checkIfOpenedByIngressEnv('https://openam-test-dev.forgeblocks.com', true);
      expect(sessionStorage.getItem('parentIsPromotionIngressEnvironment')).toBe('true');
      expect(sessionStorage.getItem('fraasPromotionIngressUrl')).toBe('https://openam-test-dev.forgeblocks.com');
    });

    it('selects matching origin url from fraasPromotionAllowableIngressUrls if present', () => {
      store.state.SharedStore.fraasPromotionAllowableIngressUrls = 'https://openam-test-dev.forgeblocks.com,https://openam-test-dev2.forgeblocks.com';
      store.state.SharedStore.fraasPromotionIngressUrl = 'https://openam-test-dev3.forgeblocks.com';
      checkIfOpenedByIngressEnv('https://openam-test-dev.forgeblocks.com', true);
      expect(sessionStorage.getItem('parentIsPromotionIngressEnvironment')).toBe('true');
      expect(sessionStorage.getItem('fraasPromotionIngressUrl')).toBe('https://openam-test-dev.forgeblocks.com');
    });

    it('sets variables if fraasPromotionAllowableIngressUrls has only a single value', () => {
      store.state.SharedStore.fraasPromotionAllowableIngressUrls = 'https://openam-test-dev.forgeblocks.com';
      store.state.SharedStore.fraasPromotionIngressUrl = 'https://openam-test-dev3.forgeblocks.com';
      checkIfOpenedByIngressEnv('https://openam-test-dev.forgeblocks.com', true);
      expect(sessionStorage.getItem('parentIsPromotionIngressEnvironment')).toBe('true');
      expect(sessionStorage.getItem('fraasPromotionIngressUrl')).toBe('https://openam-test-dev.forgeblocks.com');
    });

    it('sets no session variables if ingress urls present but not matched', () => {
      store.state.SharedStore.fraasPromotionAllowableIngressUrls = 'https://openam-test-dev.forgeblocks.com,https://openam-test-dev2.forgeblocks.com';
      store.state.SharedStore.fraasPromotionIngressUrl = 'https://openam-test-dev3.forgeblocks.com';
      checkIfOpenedByIngressEnv('https://openam-test-dev1234.forgeblocks.com', true);
      expect(sessionStorage.getItem('parentIsPromotionIngressEnvironment')).toBe(null);
      expect(sessionStorage.getItem('fraasPromotionIngressUrl')).toBe(null);
    });
  });
});
