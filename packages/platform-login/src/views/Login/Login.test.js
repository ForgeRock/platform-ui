/**
 * Copyright (c) 2021-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, shallowMount, flushPromises } from '@vue/test-utils';
import { defineRule } from 'vee-validate';
// eslint-disable-next-line import/no-extraneous-dependencies
import { email, required } from '@vee-validate/rules';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { sanitize } from '@forgerock/platform-shared/src/utils/sanitizerConfig';
import { URLSearchParams } from 'url';
import { createTestingPinia } from '@pinia/testing';
import LoginMixin from '@forgerock/platform-shared/src/mixins/LoginMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import { createJourneyStep as rehydrateStep } from '@forgerock/journey-client/_utils';
// eslint-disable-next-line import/no-extraneous-dependencies
import { stringify } from '@forgerock/sdk-utilities';
import { WebAuthn, WebAuthnStepType } from '@forgerock/journey-client/webauthn';
import i18n from '@/i18n';
import * as urlUtil from '../../utils/urlUtil';
import { getAlternateFieldType } from '../../utils/loginUtils';
import * as authResumptionUtil from '../../utils/authResumptionUtil';
import * as asScriptParserModule from '../../components/display/WebAuthn/asScriptParser';
import Login from './index';

// The SDK is mocked at two surfaces: (a) the shared `journeyClient` store
// (the path every consumer reads via `useJourneyClientStore().client`) and (b)
// the `@forgerock/journey-client` root + subpath imports consumed transitively
// by `LoginMixin` and `Login/index.vue`. Variable names are `mock`-prefixed so
// Jest's hoisted `jest.mock` factories can reference them safely.
const mockNext = jest.fn();
const mockStart = jest.fn();
const mockResume = jest.fn();
const mockRedirect = jest.fn();
const mockTerminate = jest.fn(() => Promise.resolve());

// `mockStoreInstance` is the writable store object returned by
// `useJourneyClientStore()`. Tests that need the null-client path set
// `mockStoreInstance.client = null` directly and restore it in afterEach.
const mockStoreInstance = {
  client: {
    next: mockNext,
    start: mockStart,
    resume: mockResume,
    redirect: mockRedirect,
    terminate: mockTerminate,
  },
};

jest.mock('@forgerock/platform-shared/src/stores/journeyClient', () => ({
  useJourneyClientStore: jest.fn(() => mockStoreInstance),
}));

jest.mock('@forgerock/platform-shared/src/utils/amUrlUtils', () => ({
  buildWellknownUrl: jest.fn(() => 'https://example.com/am/oauth2/realms/root/.well-known/openid-configuration'),
}));

// Mirror the `callbackType` keys consumed by `Login/index.vue` (via
// `this.FrCallbackType.X`, which spreads `callbackType` in `LoginMixin`)
// and the test fixtures below.
jest.mock('@forgerock/journey-client', () => ({
  callbackType: {
    NameCallback: 'NameCallback',
    PasswordCallback: 'PasswordCallback',
    ValidatedCreatePasswordCallback: 'ValidatedCreatePasswordCallback',
    ConfirmationCallback: 'ConfirmationCallback',
    DeviceProfileCallback: 'DeviceProfileCallback',
    HiddenValueCallback: 'HiddenValueCallback',
    MetadataCallback: 'MetadataCallback',
    PingOneProtectInitializeCallback: 'PingOneProtectInitializeCallback',
    PingOneProtectEvaluationCallback: 'PingOneProtectEvaluationCallback',
    PollingWaitCallback: 'PollingWaitCallback',
    SelectIdPCallback: 'SelectIdPCallback',
    TextOutputCallback: 'TextOutputCallback',
  },
  // Shim that attaches the SDK-shape methods consumed by Login/index.vue and
  // LoginMixin onto a raw callback plain-object. Pre-existing methods on the
  // input object win (via the spread order { ...defaults, ...cb }), so tests
  // can pass a callback that already defines a method (e.g. a MetadataCallback
  // with its own `getOutputByName`) without having it overwritten by this shim.
  createCallback: jest.fn((cb) => {
    const output = Array.isArray(cb.output) ? cb.output : [];
    const input = Array.isArray(cb.input) ? cb.input : [];
    const defaults = {
      getType: () => cb.type,
      getOutputByName: (name, defaultValue) => {
        const found = output.find((o) => o.name === name);
        return found ? found.value : defaultValue;
      },
      getOutputValue: (selector = 0) => {
        if (typeof selector === 'string') {
          const found = output.find((o) => o.name === selector);
          return found ? found.value : undefined;
        }
        return output[selector]?.value;
      },
      getInputValue: (index = 0) => input[index]?.value,
      setInputValue: (value, index = 0) => {
        if (!input[index]) {
          input[index] = { name: `IDToken${index + 1}`, value };
        } else {
          input[index].value = value;
        }
      },
      getPrompt: () => {
        const found = output.find((o) => o.name === 'prompt');
        return found ? found.value : undefined;
      },
      getFailedPolicies: () => {
        const found = output.find((o) => o.name === 'failedPolicies');
        return found ? found.value : [];
      },
      getMessageType: () => {
        const found = output.find((o) => o.name === 'messageType');
        return found ? found.value : undefined;
      },
    };
    return { ...defaults, ...cb };
  }),
}));

jest.mock('@forgerock/journey-client/webauthn', () => ({
  WebAuthn: {
    register: jest.fn(),
    authenticate: jest.fn(),
    getWebAuthnStepType: jest.fn(() => 0), // None
  },
  WebAuthnStepType: { None: 0, Authentication: 1, Registration: 2 },
}));

jest.mock('../../components/display/WebAuthn/asScriptParser', () => ({
  authenticateWithAsScript: jest.fn(() => Promise.resolve('asScript-outcome')),
  registerWithAsScript: jest.fn(() => Promise.resolve('asScript-outcome')),
}));

jest.mock('@forgerock/journey-client/recovery-codes', () => ({
  RecoveryCodes: {
    isDisplayStep: jest.fn(() => false),
    getCodes: jest.fn(() => []),
    getDeviceName: jest.fn(() => ''),
  },
}));

defineRule('required', (value) => required(value) || 'required');
defineRule('email', (value) => email(value) || 'email should be valid');

describe('Login.vue', () => {
  let wrapper;
  const $route = {
    params: {
      tree: undefined,
    },
  };
  beforeEach(() => {
    // Reset call history on the SDK doubles between tests so per-test
    // assertions don't bleed across cases. The store's client is a live
    // double by default; tests that need the null-guard path set
    // `mockStoreInstance.client = null` directly (see the
    // 'bootstrap-failed gating' and 'client null guard' suites).
    // Restore the live client double in case a previous test set it to null.
    mockStoreInstance.client = {
      next: mockNext,
      start: mockStart,
      resume: mockResume,
      redirect: mockRedirect,
      terminate: mockTerminate,
    };
    mockNext.mockReset();
    mockStart.mockReset();
    mockResume.mockReset();
    mockRedirect.mockReset();
    mockTerminate.mockReset();
    mockTerminate.mockImplementation(() => Promise.resolve());
    const pinia = createTestingPinia();
    jest.spyOn(LoginMixin.methods, 'getConfigurationInfo').mockImplementation(() => Promise.resolve({ data: { realm: '/' } }));
    wrapper = shallowMount(Login, {
      global: {
        plugins: [pinia],
        stubs: {
          'router-link': true,
        },
        mocks: {
          $route,
          $sanitize: (message, config) => sanitize(message, config),
          $t: () => {},
          $store: {
            state: {
              SharedStore: {
                webStorageAvailable: true,
              },
            },
          },
        },
        mixins: [LoginMixin],
      },
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('Removes undefined and "undefined" tree from stepParams', () => {
    const expectedStepParams = {
      query: {
        suspendedId: 'test',
      },
      realmPath: 'test',
    };
    // test undefined tree
    wrapper.setData({
      realm: 'test',
      suspendedId: 'test',
    });
    expect(wrapper.vm.getStepParams()).toEqual(expectedStepParams);
    // test tree with the string "undefined"
    wrapper.setData({
      realm: 'test',
      suspendedId: 'test',
      treeId: 'undefined',
    });

    expect(wrapper.vm.getStepParams()).toEqual(expectedStepParams);
  });

  it('Detects /am/console as the default path', () => {
    expect(wrapper.vm.isDefaultPath('/am/console')).toEqual(true);
    expect(wrapper.vm.isDefaultPath('/am/fail')).toEqual(false);
  });

  it('Detects /auth/console as the default path', () => {
    expect(wrapper.vm.isDefaultPath('/auth/console')).toEqual(true);
    expect(wrapper.vm.isDefaultPath('/auth/fail')).toEqual(false);
  });

  it('Detects SAML urls', () => {
    const samlUrls = [
      'https://default.iam.example.com/am/Consumer/metaAlias/avsp',
      'https://default.iam.example.com/am/saml2/continue/metaAlias/avidp',
      'https://default.iam.example.com/am/saml2/jsp/idpSSOInit.jsp?metaAlias=/avidp',
    ];
    samlUrls.forEach((url) => {
      expect(wrapper.vm.isSamlURL(url)).toEqual(true);
    });
    expect(wrapper.vm.isSamlURL('https://default.iam.example.com/am/XUI')).toEqual(false);
  });

  it('Redirects SAML goto urls', () => {
    const successURL = '/am/console';
    const realm = '/root';
    const gotoBase = '?goto=';
    const samlUrls = [
      'https://default.iam.example.com/am/Consumer/metaAlias/avsp',
      'https://default.iam.example.com/am/saml2/continue/metaAlias/avidp',
      'https://default.iam.example.com/am/saml2/jsp/idpSSOInit.jsp?metaAlias=/avidp',
    ];

    // Mock gotoURL validation call
    jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => ({ post: () => Promise.resolve({ data: { successURL } }) }));

    // Test verifyGotoUrlAndRedirect
    samlUrls.forEach(async (goto) => {
      // Set up window object with correct goto search params
      Object.defineProperty(global, 'window', {
        value: {
          location: {
            search: `${gotoBase}${goto}`,
          },
        },
        writable: true,
      });

      expect(await wrapper.vm.verifyGotoUrlAndRedirect(successURL, realm)).toEqual(goto);
    });
  });

  describe('validate and set proper page title when', () => {
    afterEach(() => {
      document.title = 'Login';
    });

    it('authIndexType and authIndexValue are present in the journey url hash', () => {
      const windowHashWithAuthIndex = '#/service/ResetPassword';
      wrapper.vm.setPageTitle(windowHashWithAuthIndex);
      expect(document.title).toEqual('ResetPassword');
    });

    it('authIndexType and authIndexValue are present in the journey url query params', () => {
      const windowSearch = '&authIndexType=service&authIndexValue=Registration';
      const URLSearchParamsMock = {
        get: (param) => {
          if (param === 'authIndexType') return 'service';
          if (param === 'authIndexValue') return 'Registration';
          return null;
        },
      };

      wrapper.vm.setPageTitle(windowSearch, URLSearchParamsMock);
      expect(document.title).toEqual('Registration');
    });

    it('authIndexValue contains encoded characters', () => {
      const windowHashEncoded = '#/service/Reset%20Password';
      // Sets title to decoded value if the hash includes encoded characters
      wrapper.vm.setPageTitle(windowHashEncoded);
      expect(document.title).toEqual('Reset Password');
    });

    it('authIndexType and authIndexValue are not present in the journey url', () => {
      const windowHashPlain = '#/';
      // Defaults to title set in index.html if authIndexValue and authIndexType is missing
      wrapper.vm.setPageTitle(windowHashPlain);
      expect(document.title).toEqual('Login');
    });

    it('authIndexType and authIndexValue are present in the journey url hash with query params', () => {
      const windowHashWithParams = '#/service/Login?goto=https%3A%2F%2Fdefault.iam.example.com';
      wrapper.vm.setPageTitle(windowHashWithParams);
      expect(document.title).toEqual('Login');
    });

    it('authIndexValue are present in the journey url hash with malformed encoded characters', () => {
      const windowHashWithMalformedAuthIndexValue = '#/service/Reset%2Password';
      // Fallbacks to undecoded title if malformed percent-encoded sequences are present
      wrapper.vm.setPageTitle(windowHashWithMalformedAuthIndexValue);
      expect(document.title).toEqual(windowHashWithMalformedAuthIndexValue.split('/service/')[1]);
    });

    it('authIndexType and authIndexValue are present in the journey url hash with no authIndexValue', () => {
      const windowHashWithNoAuthIndexValue = '#/service/';
      // Fallbacks to title set in index.html if authIndexValue is missing
      wrapper.vm.setPageTitle(windowHashWithNoAuthIndexValue);
      expect(document.title).toEqual('Login');
    });
  });

  it('keeps params like noSession when is a link from an Email URL', () => {
    jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue('noSession=true&param1=test');

    const expectedStepParams = {
      query: {
        suspendedId: 'test',
        noSession: 'true',
        param1: 'test',
      },
      realmPath: 'test',
    };
    // test undefined tree
    wrapper.setData({
      realm: 'test',
      suspendedId: 'test',
    });

    expect(wrapper.vm.getStepParams()).toEqual(expectedStepParams);
  });

  it('leaves treeId undefined when resuming a magic-link (suspendedId only, no authIndexValue)', () => {
    // Magic-link URLs carry only suspendedId — no authIndexType/authIndexValue, so treeId
    // must stay undefined. The theme resolver then skips the journey-theme lookup and falls
    // back to the default tenant theme, rather than incorrectly applying the Login journey's theme.
    const queryStringSpy = jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue('suspendedId=abc123');
    const replaceUrlParamsSpy = jest.spyOn(urlUtil, 'replaceUrlParams').mockImplementation(() => {});
    jest.spyOn(authResumptionUtil, 'resumingSuspendedTree').mockReturnValue(true);
    jest.spyOn(wrapper.vm, 'setPageTitle').mockImplementation(() => {});

    wrapper.vm.evaluateUrlParams();

    expect(wrapper.vm.treeId).toBeUndefined();
    expect(wrapper.vm).not.toHaveProperty('themeTreeId');

    authResumptionUtil.resumingSuspendedTree.mockRestore();
    replaceUrlParamsSpy.mockRestore();
    queryStringSpy.mockRestore();
    wrapper.setData({ realm: '/', treeId: undefined, suspendedId: undefined });
  });

  it('captures suspendedStartContext when suspended URL carries non-service authIndex', () => {
    // A suspended URL with authIndexType=module must preserve the original auth-index as
    // suspendedStartContext so Start Over can reconstruct the correct URL on session expiry.
    // It must NOT set treeId or authIndex, which would cause the values to be forwarded to
    // the SDK alongside suspendedId.
    const queryStringSpy = jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue(
      'authIndexType=module&authIndexValue=LdapModule&suspendedId=abc123',
    );
    const replaceUrlParamsSpy = jest.spyOn(urlUtil, 'replaceUrlParams').mockImplementation(() => {});
    jest.spyOn(authResumptionUtil, 'resumingSuspendedTree').mockReturnValue(true);
    jest.spyOn(wrapper.vm, 'setPageTitle').mockImplementation(() => {});

    wrapper.vm.evaluateUrlParams();

    expect(wrapper.vm.treeId).toBeUndefined();
    expect(wrapper.vm.authIndex).toBeUndefined();
    expect(wrapper.vm.suspendedStartContext).toEqual({ type: 'module', value: 'LdapModule' });
    expect(wrapper.vm.suspendedId).toBe('abc123');

    authResumptionUtil.resumingSuspendedTree.mockRestore();
    replaceUrlParamsSpy.mockRestore();
    queryStringSpy.mockRestore();
    wrapper.setData({
      realm: '/',
      treeId: undefined,
      suspendedId: undefined,
      suspendedStartContext: undefined,
    });
  });

  it('builds a Start Over link from suspendedStartContext when a non-service suspended session expires', async () => {
    // When a suspended session (non-service authIndex) expires, Start Over must reconstruct
    // the original journey URL, not fall back to the realm root.
    const queryStringSpy = jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue('');
    mockStart.mockImplementation(() => Promise.resolve({
      type: 'LoginFailure',
      payload: {
        code: 401,
        message: 'Session expired',
        reason: 'Unauthorized',
      },
      callbacks: [],
    }));

    wrapper.setData({
      realm: 'alpha',
      treeId: undefined,
      suspendedId: 'expired-suspend-id',
      suspendedStartContext: { type: 'module', value: 'LdapModule' },
      step: null,
      retry: false,
    });

    wrapper.vm.nextStep();
    await flushPromises();

    expect(wrapper.vm.linkToTreeStart).toBe(
      '/am/XUI/?realm=alpha&authIndexType=module&authIndexValue=LdapModule',
    );
    queryStringSpy.mockRestore();
    wrapper.setData({
      realm: '/',
      suspendedId: undefined,
      suspendedStartContext: undefined,
    });
  });

  it('builds a service-type Start Over link from suspendedStartContext when an expired service journey resumes', async () => {
    // A service-type suspended URL (?authIndexType=service&authIndexValue=ResetPassword&suspendedId=x)
    // must produce a journey-scoped Start Over URL via suspendedStartContext, not getLinkToTreeStart,
    // because treeId is no longer set during resume (point 2 fix).
    const queryStringSpy = jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue('');
    mockStart.mockImplementation(() => Promise.resolve({
      type: 'LoginFailure',
      payload: {
        code: 401,
        message: 'Session expired',
        reason: 'Unauthorized',
      },
      callbacks: [],
    }));

    wrapper.setData({
      realm: 'alpha',
      treeId: undefined,
      suspendedId: 'expired-suspend-id',
      suspendedStartContext: { type: 'service', value: 'ResetPassword' },
      step: null,
      retry: false,
    });

    wrapper.vm.nextStep();
    await flushPromises();

    expect(wrapper.vm.linkToTreeStart).toBe(
      '/am/XUI/?realm=alpha&authIndexType=service&authIndexValue=ResetPassword',
    );
    queryStringSpy.mockRestore();
    wrapper.setData({
      realm: '/',
      suspendedId: undefined,
      suspendedStartContext: undefined,
    });
  });

  it('normal non-suspended Login URL still sets treeId from URL and injects it into getStepParams()', () => {
    // Sanity check: the isSuspendedResume guard must not affect normal (non-suspended) journeys.
    // A URL with authIndexType=service and no suspendedId sets treeId via evaluateUrlParams,
    // and getStepParams injects it into the query.
    const queryStringSpy = jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue('');
    wrapper.setData({
      realm: 'alpha',
      treeId: 'Login',
      suspendedId: undefined,
    });

    const stepParams = wrapper.vm.getStepParams();

    expect(stepParams.tree).toBe('Login');
    expect(stepParams.query.authIndexType).toBe('service');
    expect(stepParams.query.authIndexValue).toBe('Login');
    queryStringSpy.mockRestore();
    wrapper.setData({ realm: '/', treeId: undefined });
  });

  it('injects authIndex from treeId (not from URL) so stale URL values cannot reach the SDK (IAM-11758)', () => {
    // Guards the internal-state contract: authIndex is derived from treeId, never copied from
    // the URL. Any stale URL value is discarded before it can trigger an AM journey restart.
    // Setting `step` forces the SDK call down the `.next()` branch, which is the path the
    // internal-state model is designed to protect (journey-client re-derives on `.start()`,
    // but not on `.next()`).
    const queryStringSpy = jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue(
      'realm=/alpha&authIndexType=service&authIndexValue=Login&goto=https%3A%2F%2Ftenant%2Fplatform',
    );
    wrapper.setData({
      realm: 'alpha',
      treeId: 'ForgottenUsername',
      suspendedId: undefined,
      step: { payload: { authId: 'fake' } },
    });

    const stepParams = wrapper.vm.getStepParams();

    expect(stepParams.query.authIndexType).toBe('service');
    expect(stepParams.query.authIndexValue).toBe('ForgottenUsername');
    expect(stepParams.tree).toBe('ForgottenUsername');
    queryStringSpy.mockRestore();
    wrapper.setData({ realm: '/', treeId: undefined });
  });

  it('suppresses authIndex and tree during a suspended resume so AM cannot restart the journey (IAM-11758)', () => {
    // When suspendedId is set, isSuspendedResume=true suppresses both tree and authIndex injection.
    // The resume SDK call must contain only suspendedId — AM rehydrates full context from that.
    const queryStringSpy = jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue('suspendedId=abc123');
    wrapper.setData({
      realm: 'alpha',
      treeId: 'Login',
      suspendedId: 'abc123',
      authIndex: { type: 'module', value: 'LdapModule' },
    });

    const stepParams = wrapper.vm.getStepParams();

    expect(stepParams).not.toHaveProperty('tree');
    expect(stepParams.query.authIndexType).toBeUndefined();
    expect(stepParams.query.authIndexValue).toBeUndefined();
    expect(stepParams.query.suspendedId).toBe('abc123');
    queryStringSpy.mockRestore();
    wrapper.setData({
      realm: '/',
      treeId: undefined,
      suspendedId: undefined,
      authIndex: undefined,
    });
  });

  it('forwards non-service authIndex pairs from state (module/level/user/resource)', () => {
    // Non-service auth-index types are captured in this.authIndex by evaluateUrlParams and
    // forwarded on outgoing SDK calls even when treeId is undefined (treeId is service-only).
    const queryStringSpy = jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue('');
    wrapper.setData({
      realm: 'alpha',
      treeId: undefined,
      authIndex: { type: 'module', value: 'DataStore' },
    });

    const stepParams = wrapper.vm.getStepParams();

    expect(stepParams.query.authIndexType).toBe('module');
    expect(stepParams.query.authIndexValue).toBe('DataStore');
    queryStringSpy.mockRestore();
    wrapper.setData({ realm: '/', authIndex: undefined });
  });

  describe('composite_advice encoding round-trip (SAML policy-driven auth)', () => {
    // AM's policy engine redirects the browser to XUI with authIndexType=composite_advice and
    // authIndexValue=<percent-encoded XML> when a SAML SP-initiated flow requires step-up auth.
    // The XML is a TransactionConditionAdvice document (e.g. carrying a TxId or spEntityID).
    //
    // The encoding contract this UI must honour:
    //   evaluateUrlParams() calls URLSearchParams.get(), which decodes exactly one percent-encoding
    //   layer. Raw XML lands in this.authIndex.value. getStepParams() copies it verbatim into
    //   stepParams.query. journey-client's stringify() (= encodeURIComponent per value) re-encodes
    //   it for the HTTP request. AM receives single-encoded XML — what it originally sent.
    //
    // Two fixtures exercise the critical encoding boundary:
    //
    //   Fixture A — AM canonical (single-encoded, %3D/%2F):
    //     AM sends encodeURIComponent(rawXml). URLSearchParams.get() decodes to rawXml.
    //     stringify() re-encodes to the same single-encoded string. AM receives rawXml. ✓
    //
    //   Fixture B — real IAM-7834 failure path (mixed encoding, %3C outer / %253D %252F inner):
    //     This reproduces the original bug: AM emits XML where outer angle-brackets are %3C/%3E
    //     but attribute = and path / were pre-encoded to %3D/%2F BEFORE the outer encodeURIComponent
    //     was applied, producing %253D/%252F in the URL. URLSearchParams.get() peels one layer,
    //     leaving %3D/%2F inside the XML string. stringify() then re-encodes % → %25, yielding
    //     %253D/%252F in the outgoing request. AM receives malformed XML and rejects the advice.
    //     This fixture documents the broken behavior as a canary — it must fail if someone later
    //     fixes the decoding (the expectations should be updated to assert rawXml at that point).
    //
    // Both fixtures also exercise the two-request scenario (client.start() then client.next()) to
    // confirm authIndexType never flips from composite_advice to service across requests.
    //
    // Boundary: these tests stop at the client.start()/client.next() call arguments. The real
    // HTTP URL is reconstructed from those args via stringify() — the same function journey-client's
    // constructUrl() uses — to show what AM receives on the wire. A live AM/SAML transaction test
    // is not possible in this unit environment and belongs in e2e Cypress.

    // Real TransactionConditionAdvice XML shape used in SAML SP-initiated flows.
    // The attribute name contains = and the closing tag contains / — these are the characters
    // that mixed-encoding corrupts into %253D and %252F.
    const TX_ADVICE_XML = '<Advices><AttributeValuePair>'
      + '<Attribute name="TransactionConditionAdvice"/>'
      + '<Value>TxId=saml-abc-123</Value>'
      + '</AttributeValuePair></Advices>';

    // Mixed-encoded URL value: outer XML brackets are single-encoded (%3C/%3E) but the
    // attribute = and tag-closing / are double-encoded (%253D/%252F). This is the IAM-7834
    // failure shape — pre-encode only = and / then run encodeURIComponent over the whole string.
    const mixedEncodedAdvice = encodeURIComponent(
      TX_ADVICE_XML.replace(/=/g, '%3D').replace(/\//g, '%2F'),
    );

    let replaceUrlParamsSpy;
    let setPageTitleSpy;

    beforeEach(() => {
      replaceUrlParamsSpy = jest.spyOn(urlUtil, 'replaceUrlParams').mockImplementation(() => {});
      setPageTitleSpy = jest.spyOn(wrapper.vm, 'setPageTitle').mockImplementation(() => {});
      mockStart.mockReset();
      mockNext.mockReset();
    });

    afterEach(() => {
      replaceUrlParamsSpy.mockRestore();
      setPageTitleSpy.mockRestore();
      wrapper.setData({
        realm: '/', treeId: undefined, authIndex: undefined, step: null,
      });
    });

    it('Fixture A — canonical single-encoded (%3D/%2F): decodes to raw XML, client.start() and client.next() both carry composite_advice, wire value round-trips to original XML', async () => {
      // Sanity: AM canonical output — encodeURIComponent produces %3D for = and %2F for /
      const singleEncodedAdvice = encodeURIComponent(TX_ADVICE_XML);
      expect(singleEncodedAdvice).toContain('%3D');
      expect(singleEncodedAdvice).toContain('%2F');
      expect(singleEncodedAdvice).not.toContain('%253D');

      const queryStringSpy = jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue(
        `authIndexType=composite_advice&authIndexValue=${singleEncodedAdvice}`,
      );

      wrapper.setData({
        realm: 'alpha', treeId: undefined, authIndex: undefined, step: null,
      });
      wrapper.vm.evaluateUrlParams();

      // evaluateUrlParams() decoded exactly one layer → raw XML in state
      expect(wrapper.vm.authIndex).toEqual({ type: 'composite_advice', value: TX_ADVICE_XML });
      expect(wrapper.vm.treeId).toBeUndefined();

      // --- Request 1: client.start() (this.step is null) ---
      const step1Response = rehydrateStep({ callbacks: [] });
      mockStart.mockResolvedValueOnce(step1Response);
      wrapper.vm.nextStep();
      await flushPromises();

      expect(mockStart).toHaveBeenCalledTimes(1);
      const startArgs = mockStart.mock.calls[0][0];
      // authIndexType must stay composite_advice — never 'service'
      expect(startArgs.query.authIndexType).toBe('composite_advice');
      expect(startArgs.query.authIndexValue).toBe(TX_ADVICE_XML);
      expect(startArgs).not.toHaveProperty('journey');

      // Reconstruct the wire URL using the same stringify() journey-client uses in constructUrl()
      const wireQs1 = stringify(startArgs.query);
      expect(wireQs1).toContain('authIndexType=composite_advice');
      expect(wireQs1).toContain(`authIndexValue=${singleEncodedAdvice}`);
      // No double-encoding: %25 would mean a bare % was re-encoded
      expect(wireQs1).not.toContain('%25');
      // AM decodes the wire value back to the original XML
      expect(new URLSearchParams(wireQs1).get('authIndexValue')).toBe(TX_ADVICE_XML);

      // --- Request 2: client.next() (this.step is now set from step1Response) ---
      const step2Response = rehydrateStep({ callbacks: [] });
      mockNext.mockResolvedValueOnce(step2Response);
      wrapper.vm.nextStep();
      await flushPromises();

      expect(mockNext).toHaveBeenCalledTimes(1);
      const [, nextOptions] = mockNext.mock.calls[0];
      // authIndexType must still be composite_advice on the second request
      expect(nextOptions.query.authIndexType).toBe('composite_advice');
      expect(nextOptions.query.authIndexValue).toBe(TX_ADVICE_XML);

      const wireQs2 = stringify(nextOptions.query);
      expect(wireQs2).toContain(`authIndexValue=${singleEncodedAdvice}`);
      expect(wireQs2).not.toContain('%25');
      expect(new URLSearchParams(wireQs2).get('authIndexValue')).toBe(TX_ADVICE_XML);

      queryStringSpy.mockRestore();
    });

    it('Fixture B — IAM-7834 mixed encoding (%3C outer / %253D %252F inner): documents broken behavior where AM receives malformed XML', async () => {
      // Verify this is the real mixed-encoding shape: outer %3C but inner %253D/%252F
      expect(mixedEncodedAdvice).toContain('%3C');
      expect(mixedEncodedAdvice).toContain('%253D');
      expect(mixedEncodedAdvice).toContain('%252F');

      // What URLSearchParams.get() produces after peeling one layer:
      // outer %3C → <, but %253D → %3D (still percent-encoded =) and %252F → %2F (still encoded /)
      const afterOneDecode = decodeURIComponent(mixedEncodedAdvice);
      expect(afterOneDecode).toContain('%3D'); // inner = still encoded
      expect(afterOneDecode).toContain('%2F'); // inner / still encoded
      expect(afterOneDecode).not.toBe(TX_ADVICE_XML); // NOT the original clean XML

      const queryStringSpy = jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue(
        `authIndexType=composite_advice&authIndexValue=${mixedEncodedAdvice}`,
      );

      wrapper.setData({
        realm: 'alpha', treeId: undefined, authIndex: undefined, step: null,
      });
      wrapper.vm.evaluateUrlParams();

      // evaluateUrlParams() peels one layer — this.authIndex.value still has %3D/%2F inside
      expect(wrapper.vm.authIndex.type).toBe('composite_advice');
      expect(wrapper.vm.authIndex.value).toBe(afterOneDecode); // not rawXml
      expect(wrapper.vm.authIndex.value).not.toBe(TX_ADVICE_XML);
      expect(wrapper.vm.treeId).toBeUndefined();

      // --- Request 1: client.start() ---
      const step1Response = rehydrateStep({ callbacks: [] });
      mockStart.mockResolvedValueOnce(step1Response);
      wrapper.vm.nextStep();
      await flushPromises();

      expect(mockStart).toHaveBeenCalledTimes(1);
      const startArgs = mockStart.mock.calls[0][0];
      // authIndexType stays composite_advice even on broken input — it must never flip to service
      expect(startArgs.query.authIndexType).toBe('composite_advice');
      // authIndexValue carries the partially-decoded (still-malformed) string
      expect(startArgs.query.authIndexValue).toBe(afterOneDecode);

      // The outgoing wire URL re-encodes the remaining %3D/%2F → %253D/%252F (double-encoding)
      const wireQs1 = stringify(startArgs.query);
      expect(wireQs1).toContain('%25'); // double-encoding marker — the bug
      // AM decodes the wire value and receives the partially-decoded string, not rawXml
      const wireValue1 = new URLSearchParams(wireQs1).get('authIndexValue');
      expect(wireValue1).toBe(afterOneDecode);
      expect(wireValue1).not.toBe(TX_ADVICE_XML); // AM will reject this

      // --- Request 2: client.next() ---
      const step2Response = rehydrateStep({ callbacks: [] });
      mockNext.mockResolvedValueOnce(step2Response);
      wrapper.vm.nextStep();
      await flushPromises();

      expect(mockNext).toHaveBeenCalledTimes(1);
      const [, nextOptions] = mockNext.mock.calls[0];
      expect(nextOptions.query.authIndexType).toBe('composite_advice');
      const wireQs2 = stringify(nextOptions.query);
      expect(wireQs2).toContain('%25'); // double-encoding persists on second request too
      expect(new URLSearchParams(wireQs2).get('authIndexValue')).not.toBe(TX_ADVICE_XML);

      queryStringSpy.mockRestore();
    });
  });

  it('IAM-7834 regression: stale treeId + sunamcompositeadvice — composite_advice is not overwritten and legacy param is not double-encoded', async () => {
    // Reproduces the exact XUI/resume scenario from IAM-7834:
    //
    // 1. The user first loads a service journey (e.g. Login). treeId = 'Login' is set.
    // 2. A SAML SP-initiated policy requires step-up auth. AM redirects back to the XUI with:
    //      authIndexType=composite_advice
    //      authIndexValue=<percent-encoded TransactionConditionAdvice XML>
    //      sunamcompositeadvice=<same percent-encoded XML>  (legacy AM parameter)
    //    The URL still carries the previous service journey's state; this.treeId is stale.
    // 3. evaluateUrlParams() must set this.authIndex, and must clear this.treeId so that
    //    getStepParams() does not inject authIndexType=service using the stale journey name.
    // 4. sunamcompositeadvice passes through parseParameters() percent-encoded as-is.
    //    stringify() must not re-encode it (that would triple-encode it). It should be
    //    decoded once before being passed through, matching what URLSearchParams gives.
    //
    // Fix contract (the documented IAM-7834 fix — not setting treeId for non-service types):
    //   - this.treeId must be undefined after evaluateUrlParams() on a composite_advice URL
    //   - this.authIndex must hold { type: 'composite_advice', value: rawXml }
    //   - client.start() query must carry authIndexType=composite_advice, not 'service'
    //   - sunamcompositeadvice in the outgoing wire URL must not contain %25 (no double-encoding)
    //   - AM decodes sunamcompositeadvice wire value back to the original XML

    const rawXml = '<Advices><AttributeValuePair>'
      + '<Attribute name="TransactionConditionAdvice"/>'
      + '<Value>TxId=saml-abc-123</Value>'
      + '</AttributeValuePair></Advices>';
    const encodedXml = encodeURIComponent(rawXml);

    // Stale state: a prior service journey set treeId
    const queryStringSpy = jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue(
      `authIndexType=composite_advice&authIndexValue=${encodedXml}&sunamcompositeadvice=${encodedXml}`,
    );
    const replaceUrlParamsSpy = jest.spyOn(urlUtil, 'replaceUrlParams').mockImplementation(() => {});
    jest.spyOn(wrapper.vm, 'setPageTitle').mockImplementation(() => {});

    wrapper.setData({
      realm: 'alpha',
      treeId: 'Login', // stale service journey — must be cleared by evaluateUrlParams()
      authIndex: undefined,
      step: null,
    });
    wrapper.vm.evaluateUrlParams();

    // treeId must be cleared — the IAM-7834 fix
    expect(wrapper.vm.treeId).toBeUndefined();
    expect(wrapper.vm.authIndex).toEqual({ type: 'composite_advice', value: rawXml });

    // Drive nextStep() → client.start()
    const step1Response = rehydrateStep({ callbacks: [] });
    mockStart.mockReset();
    mockStart.mockResolvedValueOnce(step1Response);
    wrapper.vm.nextStep();
    await flushPromises();

    expect(mockStart).toHaveBeenCalledTimes(1);
    const startArgs = mockStart.mock.calls[0][0];

    // authIndexType must be composite_advice, not the stale 'service'/'Login' pair
    expect(startArgs.query.authIndexType).toBe('composite_advice');
    expect(startArgs.query.authIndexValue).toBe(rawXml);
    expect(startArgs).not.toHaveProperty('journey');

    // Reconstruct the wire URL via stringify() (same as journey-client's constructUrl)
    const wireQs = stringify(startArgs.query);

    // sunamcompositeadvice must be present and must not be double-encoded
    expect(wireQs).toContain('sunamcompositeadvice=');
    expect(wireQs).not.toContain('%25'); // %25 = re-encoded %, the double-encoding marker

    // AM decodes the sunamcompositeadvice wire value back to the original XML
    const wireAdvice = new URLSearchParams(wireQs).get('sunamcompositeadvice');
    expect(wireAdvice).toBe(rawXml);

    replaceUrlParamsSpy.mockRestore();
    queryStringSpy.mockRestore();
    wrapper.setData({
      realm: '/', treeId: undefined, authIndex: undefined, step: null,
    });
  });

  it('treeId wins over non-service authIndex when both are set', () => {
    // If both are populated, the service journey takes precedence — non-service is only used
    // when treeId is absent.
    const queryStringSpy = jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue('');
    wrapper.setData({
      realm: 'alpha',
      treeId: 'Login',
      authIndex: { type: 'module', value: 'DataStore' },
    });

    const stepParams = wrapper.vm.getStepParams();

    expect(stepParams.query.authIndexType).toBe('service');
    expect(stepParams.query.authIndexValue).toBe('Login');
    queryStringSpy.mockRestore();
    wrapper.setData({ realm: '/', treeId: undefined, authIndex: undefined });
  });

  it('falls back to a realm-root Start over link on expired-suspend when treeId is undefined (IAM-11758)', async () => {
    // The expired-suspend branch falls back to the realm root when treeId is unavailable, so
    // the Start Over button always renders even without a journey context.
    const queryStringSpy = jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue('');
    mockStart.mockImplementation(() => Promise.resolve({
      type: 'LoginFailure',
      payload: {
        code: 401,
        message: 'Login failure',
        reason: 'Unauthorized',
      },
      callbacks: [],
    }));

    wrapper.setData({
      realm: 'alpha',
      treeId: undefined,
      suspendedId: 'expired-suspend-id',
      step: null,
      retry: false,
    });

    wrapper.vm.nextStep();
    await flushPromises();

    expect(wrapper.vm.linkToTreeStart).toBe('/am/XUI/?realm=alpha');
    queryStringSpy.mockRestore();
    wrapper.setData({ realm: '/', suspendedId: undefined });
  });

  it('keeps params like noSession after returning from a redirect', () => {
    // Redirect resumption params (code/state/scope) are forwarded via treeResumptionParameters
    // and only appear in stepParams.query when set. Non-resumption params (e.g. noSession) always appear.
    const queryStringSpy = jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue('noSession=true&param1=test');

    const expectedStepParams = {
      query: {
        goto: undefined,
        gotoOnFail: undefined,
        noSession: 'true',
        param1: 'test',
      },
      realmPath: 'test',
    };
    wrapper.setData({
      realm: 'test',
    });

    expect(wrapper.vm.getStepParams()).toEqual(expectedStepParams);
    queryStringSpy.mockRestore();
  });

  it('Sets the correct field data type based on policyRequirements', () => {
    expect(getAlternateFieldType(['VALID_DATE_TIME_FORMAT'])).toEqual('datetime');
    expect(getAlternateFieldType(['VALID_DATE'])).toEqual('date');
    expect(getAlternateFieldType(['VALID_DATE_FORMAT'])).toEqual('date');
    expect(getAlternateFieldType(['VALID_TIME_FORMAT'])).toEqual('time');
  });

  describe('buildTreeForm', () => {
    it('metadata callbacks are not added to the component list', () => {
      jest.spyOn(wrapper.vm, 'isCallbackRequired').mockReturnValue(false);

      const data = {
        loading: true,
        step: rehydrateStep({
          callbacks: [
            {
              type: 'MetadataCallback',
              output: [
                {
                  name: 'data',
                  value: {
                    realm: '/alpha',
                  },
                },
              ],
              _id: 1,
            },
          ],
        }),
      };

      wrapper.setData(data);
      wrapper.vm.buildTreeForm();

      expect(wrapper.vm.componentList.length).toBe(0);
    });

    it('sets ariaLabelledbyId on ConfirmationCallback when preceded by TextOutputCallback', () => {
      const step = rehydrateStep({
        callbacks: [
          {
            type: 'TextOutputCallback',
            output: [
              { name: 'message', value: 'Are you okay?' },
              { name: 'messageType', value: '0' },
            ],
          },
          {
            type: 'ConfirmationCallback',
            output: [
              { name: 'options', value: ['Absolutely', 'I need oxygen'] },
              { name: 'defaultOption', value: 0 },
            ],
            input: [
              { name: 'IDToken2', value: 0 },
            ],
          },
        ],
      });

      wrapper.setData({ step, loading: true });
      wrapper.vm.buildTreeForm();

      const textOutputComponent = wrapper.vm.componentList.find((component) => component.type === 'FrTextOutputCallback');
      const confirmationComponent = wrapper.vm.componentList.find((component) => component.type === 'FrConfirmationCallback');
      expect(textOutputComponent).toBeTruthy();
      expect(textOutputComponent.callbackSpecificProps.hideTextOutput).toBe(false);
      expect(confirmationComponent).toBeTruthy();
      expect(confirmationComponent.callbackSpecificProps.ariaLabelledbyId).toBe(`message-${textOutputComponent.index}`);
    });

    it('does not set ariaLabelledbyId on ConfirmationCallback when preceding TextOutputCallback is SCRIPT', () => {
      const step = rehydrateStep({
        callbacks: [
          {
            type: 'TextOutputCallback',
            output: [
              { name: 'message', value: 'window.loginHelpers.nextStep();' },
              { name: 'messageType', value: '4' },
            ],
          },
          {
            type: 'ConfirmationCallback',
            output: [
              { name: 'options', value: ['Absolutely', 'I need oxygen'] },
              { name: 'defaultOption', value: 0 },
            ],
            input: [
              { name: 'IDToken2', value: 0 },
            ],
          },
        ],
      });

      wrapper.setData({ step, loading: true });
      wrapper.vm.buildTreeForm();

      const confirmationComponent = wrapper.vm.componentList.find((component) => component.type === 'FrConfirmationCallback');
      expect(confirmationComponent).toBeTruthy();
      expect(confirmationComponent.callbackSpecificProps.ariaLabelledbyId).toBeUndefined();
    });

    it('does not set ariaLabelledbyId when preceding TextOutputCallback is not INFORMATION type', () => {
      const step = rehydrateStep({
        callbacks: [
          {
            type: 'TextOutputCallback',
            output: [
              { name: 'message', value: 'Warning message' },
              { name: 'messageType', value: '1' },
            ],
          },
          {
            type: 'ConfirmationCallback',
            output: [
              { name: 'options', value: ['Retry', 'Cancel'] },
              { name: 'defaultOption', value: 0 },
            ],
            input: [
              { name: 'IDToken2', value: 0 },
            ],
          },
        ],
      });

      wrapper.setData({ step, loading: true });
      wrapper.vm.buildTreeForm();

      const confirmationComponent = wrapper.vm.componentList.find((component) => component.type === 'FrConfirmationCallback');
      expect(confirmationComponent).toBeTruthy();
      expect(confirmationComponent.callbackSpecificProps.ariaLabelledbyId).toBeUndefined();
    });

    describe('extractWebAuthnComponents', () => {
      it('extracts WebAuthn components into webAuthnComponentGroup and updates nextButtonVisible', () => {
        const step = rehydrateStep({
          callbacks: [
            {
              type: 'WebAuthnComponent',
              output: [{ name: 'data', value: { mediation: 'conditional' } }],
              input: [],
            },
            {
              type: 'HiddenValueCallback',
              output: [{ name: 'id', value: 'webAuthnOutcome' }],
              input: [{ name: 'IDToken1', value: '' }],
            },
            {
              type: 'NameCallback',
              output: [{ name: 'prompt', value: 'Username' }],
              input: [{ name: 'IDToken2', value: '' }],
            },
          ],
        });

        // Mock extractComponent to simulate component list being updated
        wrapper.setData({ step, nextButtonVisible: true, loading: true });
        wrapper.vm.buildTreeForm();

        expect(wrapper.vm.webAuthnComponentGroup.length).toBe(2);
        expect(wrapper.vm.componentList.length).toBe(1);
        expect(wrapper.vm.componentList[0].type).toBe('FrField');
        // Next button should be visible because of NameCallback
        expect(wrapper.vm.nextButtonVisible).toBe(true);
      });

      it('sets nextButtonVisible to false if all components are extracted', () => {
        const step = rehydrateStep({
          callbacks: [
            {
              type: 'WebAuthnComponent',
              output: [{ name: 'data', value: { mediation: 'conditional' } }],
            },
          ],
        });

        wrapper.setData({ step, nextButtonVisible: true, loading: true });
        wrapper.vm.buildTreeForm();

        expect(wrapper.vm.webAuthnComponentGroup.length).toBe(1);
        expect(wrapper.vm.componentList.length).toBe(0);
        expect(wrapper.vm.nextButtonVisible).toBe(false);
      });
    });

    describe('getComponentPropsAndEvents asScript detection', () => {
      beforeEach(() => {
        asScriptParserModule.authenticateWithAsScript.mockClear();
        asScriptParserModule.registerWithAsScript.mockClear();
      });

      afterEach(() => {
        // Restore the factory default (None) so per-test step-type stubs
        // don't bleed into other suites in this file.
        WebAuthn.getWebAuthnStepType.mockImplementation(() => WebAuthnStepType.None);
      });

      function makeAsScriptStep(message = 'webAuthnOutcome::somedata') {
        return {
          getCallbacksOfType: jest.fn((type) => {
            if (type === 'TextOutputCallback') {
              return [{ getMessage: () => message, getOutputValue: () => message }];
            }
            if (type === 'MetadataCallback') return [];
            return [];
          }),
        };
      }

      function makeModernStep() {
        return {
          getCallbacksOfType: jest.fn((type) => {
            if (type === 'TextOutputCallback') return [];
            if (type === 'MetadataCallback') {
              return [{ getOutputValue: () => ({ pubKeyCredParams: [] }) }];
            }
            return [];
          }),
        };
      }

      it('injects authenticateWithAsScript as webAuthnPromiseFunction for asScript steps', () => {
        const step = makeAsScriptStep();
        const result = wrapper.vm.getComponentPropsAndEvents('WebAuthnComponent', 0, [], null, step, 'root');
        expect(result.callbackSpecificProps.webAuthnPromiseFunction).toBeDefined();
        result.callbackSpecificProps.webAuthnPromiseFunction();
        expect(asScriptParserModule.authenticateWithAsScript).toHaveBeenCalledWith(step);
      });

      it('injects registerWithAsScript as webAuthnPromiseFunction for registration asScript steps', () => {
        // Real registration scripts carry the creation options inline, so the
        // message includes pubKeyCredParams — the same signal journey-client's
        // getWebAuthnStepType keys on (mocked here via mockReturnValue).
        const step = makeAsScriptStep('webAuthnOutcome::registration::script pubKeyCredParams [ {"type": "public-key", "alg": -7} ]');
        WebAuthn.getWebAuthnStepType.mockReturnValue(WebAuthnStepType.Registration);
        const result = wrapper.vm.getComponentPropsAndEvents('WebAuthnComponent', 0, [], null, step, 'root');
        expect(result.callbackSpecificProps.webAuthnPromiseFunction).toBeDefined();
        result.callbackSpecificProps.webAuthnPromiseFunction();
        expect(asScriptParserModule.registerWithAsScript).toHaveBeenCalledTimes(1);
        expect(asScriptParserModule.registerWithAsScript).toHaveBeenCalledWith(step);
        expect(asScriptParserModule.authenticateWithAsScript).not.toHaveBeenCalled();
      });

      it('injects authenticateWithAsScript as webAuthnPromiseFunction for authentication asScript steps', () => {
        const step = makeAsScriptStep();
        WebAuthn.getWebAuthnStepType.mockReturnValue(WebAuthnStepType.Authentication);
        const result = wrapper.vm.getComponentPropsAndEvents('WebAuthnComponent', 0, [], null, step, 'root');
        expect(result.callbackSpecificProps.webAuthnPromiseFunction).toBeDefined();
        result.callbackSpecificProps.webAuthnPromiseFunction();
        expect(asScriptParserModule.authenticateWithAsScript).toHaveBeenCalledWith(step);
        expect(asScriptParserModule.registerWithAsScript).not.toHaveBeenCalled();
      });

      it('injects authenticateWithAsScript as webAuthnPromiseFunction for asScript steps that resolve to no step type', () => {
        // Default (None): the hidden callback is missing, so no ceremony can
        // run — the pre-existing authentication injection produces the
        // correct errorCallbacksNotFound error, so it must stay.
        const step = makeAsScriptStep();
        WebAuthn.getWebAuthnStepType.mockReturnValue(WebAuthnStepType.None);
        const result = wrapper.vm.getComponentPropsAndEvents('WebAuthnComponent', 0, [], null, step, 'root');
        expect(result.callbackSpecificProps.webAuthnPromiseFunction).toBeDefined();
        result.callbackSpecificProps.webAuthnPromiseFunction();
        expect(asScriptParserModule.authenticateWithAsScript).toHaveBeenCalledWith(step);
        expect(asScriptParserModule.registerWithAsScript).not.toHaveBeenCalled();
      });

      it('does not inject authenticateWithAsScript for modern MetadataCallback-based WebAuthn steps', () => {
        const step = makeModernStep();
        const result = wrapper.vm.getComponentPropsAndEvents('WebAuthnComponent', 0, [], null, step, 'root');
        expect(asScriptParserModule.authenticateWithAsScript).not.toHaveBeenCalled();
        // Modern steps keep the shared webAuthnPromiseFunction from LoginMixin,
        // not the asScript override — confirm it exists but is a different function.
        expect(result.callbackSpecificProps?.webAuthnPromiseFunction).toBeDefined();
        result.callbackSpecificProps.webAuthnPromiseFunction();
        expect(asScriptParserModule.authenticateWithAsScript).not.toHaveBeenCalled();
      });

      it('does not inject authenticateWithAsScript for non-WebAuthn component types', () => {
        const step = makeAsScriptStep();
        wrapper.vm.getComponentPropsAndEvents('NameCallback', 0, [], null, step, 'root');
        expect(asScriptParserModule.authenticateWithAsScript).not.toHaveBeenCalled();
      });
    });
  });

  describe('IAM-10071 - error state across auto-submitting and user-initiated nextStep calls', () => {
    // isTrusted is read-only on real Event instances so we use a mock object instead.
    const trustedEvent = { isTrusted: true, preventDefault: jest.fn() };

    beforeEach(() => {
      // When `this.step` is undefined (default), `nextStep()` invokes
      // `start()` rather than `next()`. Mock both so the production path
      // resolves regardless.
      mockNext.mockImplementation(() => Promise.resolve(rehydrateStep({ callbacks: [] })));
      mockStart.mockImplementation(() => Promise.resolve(rehydrateStep({ callbacks: [] })));
    });

    it('preserves error when called without an event (auto-submitting callback)', () => {
      wrapper.setData({ loginFailure: true, errorMessage: 'AUTHN002', linkToTreeStart: '/some/link' });
      wrapper.vm.nextStep(undefined, false);

      expect(wrapper.vm.loginFailure).toBe(true);
      expect(wrapper.vm.errorMessage).toBe('AUTHN002');
      expect(wrapper.vm.linkToTreeStart).toBe('/some/link');
    });

    it('clears error when called with a trusted event (user submit)', () => {
      wrapper.setData({ loginFailure: true, errorMessage: 'AUTHN002', linkToTreeStart: '/some/link' });
      wrapper.vm.nextStep(trustedEvent, false);

      expect(wrapper.vm.loginFailure).toBe(false);
      expect(wrapper.vm.errorMessage).toBe('');
      expect(wrapper.vm.linkToTreeStart).toBe('');
    });

    it('stays clean when called without an event and no prior error', () => {
      wrapper.setData({ loginFailure: false, errorMessage: '', linkToTreeStart: '' });
      wrapper.vm.nextStep(undefined, false);

      expect(wrapper.vm.loginFailure).toBe(false);
      expect(wrapper.vm.errorMessage).toBe('');
    });
  });

  describe('handleIdpComponent', () => {
    describe('given idp component ', () => {
      it('should remove idp component from componentsList to the `idpComponent` field', () => {
        const idpComponent = {
          callback: {
            getOutputByName: jest.fn(),
            payload: {
              type: 'SelectIdPCallback',
            },
            setInputValue: jest.fn(),
          },
        };
        const componentList = [
          {
            callback: {
              payload: {
                type: 'NameCallback',
              },
            },
          },
          idpComponent,
          {
            callback: {
              payload: {
                type: 'PasswordCallback',
              },
            },
          },
        ];

        expect(componentList.length).toBe(3);
        expect(wrapper.vm.idpComponent).toBeUndefined();

        wrapper.vm.handleIdpComponent(componentList, 1);
        expect(componentList.length).toBe(2);
        expect(wrapper.vm.idpComponent).toStrictEqual(idpComponent);
      });
    });

    describe('given non array', () => {
      it('should do nothing', () => {
        wrapper.vm.handleIdpComponent({}, 1);

        expect(wrapper.vm.idpComponent).toBeUndefined();
      });
    });
  });

  describe('redirectToFailure', () => {
    const originalLocation = window.location;

    afterAll(() => {
      delete window.location;
      window.location = originalLocation;
    });

    it('Calls verifyGotoUrlAndRedirect and sets window.location.href without double-encoding', async () => {
      const gotoOnFail = 'https://example.com/failure?error=some%20error';

      delete window.location;
      window.location = {
        search: `?gotoOnFail=${encodeURIComponent(gotoOnFail)}`,
        href: '',
      };

      const verifySpy = jest.spyOn(wrapper.vm, 'verifyGotoUrlAndRedirect').mockResolvedValue(gotoOnFail);

      await wrapper.vm.redirectToFailure({});

      expect(verifySpy).toHaveBeenCalledWith(gotoOnFail, '/', false, true);
      expect(window.location.href).toBe(gotoOnFail);
    });
  });

  describe('decideToRememberUsername', () => {
    let localStorageSetSpy;
    let localStorageRemoveSpy;

    const stepWithNameCallback = rehydrateStep({
      callbacks: [{
        type: 'NameCallback',
        output: [{ name: 'prompt', value: 'Username' }],
        input: [{ name: 'IDToken1', value: 'testuser' }],
      }],
    });

    beforeEach(() => {
      localStorageSetSpy = jest.spyOn(Storage.prototype, 'setItem');
      localStorageRemoveSpy = jest.spyOn(Storage.prototype, 'removeItem');
    });

    afterEach(() => {
      localStorageSetSpy.mockRestore();
      localStorageRemoveSpy.mockRestore();
      localStorage.clear();
    });

    it.skip('saves username to localStorage when rememberMe is checked and NameCallback is present', () => {
      wrapper.setData({
        rememberMeValue: true,
        step: stepWithNameCallback,
      });
      wrapper.vm.decideToRememberUsername();
      expect(localStorageSetSpy).toHaveBeenCalledWith('frUsername', 'testuser');
    });

    it.skip('removes username from localStorage when rememberMe is unchecked', () => {
      wrapper.setData({
        rememberMeValue: false,
        rememberMeVisible: true,
        step: stepWithNameCallback,
      });
      wrapper.vm.decideToRememberUsername();
      expect(localStorageRemoveSpy).toHaveBeenCalledWith('frUsername');
    });
  });

  // Note: NameCallback is used for both username and OTP fields; they cannot be distinguished by type alone.
  // For journeys where OTP also uses a NameCallback, per-step theme configuration (journeyRememberMeEnabled)
  // must be used to control checkbox visibility on the OTP step.
  describe('setRememberedUsername', () => {
    afterEach(() => {
      localStorage.clear();
    });

    it('shows rememberMe checkbox when journeyRememberMeEnabled is true and NameCallback is present', async () => {
      wrapper.setData({ componentList: [{ callback: { getType: () => 'NameCallback' }, callbackSpecificProps: { value: '' } }] });
      await wrapper.setProps({ journeyRememberMeEnabled: true });
      wrapper.vm.setRememberedUsername();
      expect(wrapper.vm.rememberMeVisible).toBe(true);
    });

    it('hides rememberMe checkbox when journeyRememberMeEnabled is true but no NameCallback is present', async () => {
      wrapper.setData({ componentList: [{ callback: { getType: () => 'PasswordCallback' }, callbackSpecificProps: { value: '' } }] });
      await wrapper.setProps({ journeyRememberMeEnabled: true });
      wrapper.vm.setRememberedUsername();
      expect(wrapper.vm.rememberMeVisible).toBe(false);
    });

    it('hides rememberMe checkbox when journeyRememberMeEnabled is false', async () => {
      await wrapper.setProps({ journeyRememberMeEnabled: false });
      wrapper.vm.setRememberedUsername();
      expect(wrapper.vm.rememberMeVisible).toBe(false);
    });

    it('populates username field from localStorage when NameCallback is present', async () => {
      localStorage.setItem('frUsername', 'savedUser');
      const component = { callback: { getType: () => 'NameCallback' }, callbackSpecificProps: { value: '' } };
      wrapper.setData({ componentList: [component] });
      await wrapper.setProps({ journeyRememberMeEnabled: true });
      wrapper.vm.setRememberedUsername();
      expect(component.callbackSpecificProps.value).toBe('savedUser');
    });

    it('does not populate username field when no NameCallback is present', async () => {
      localStorage.setItem('frUsername', 'savedUser');
      const component = { callback: { getType: () => 'PasswordCallback' }, callbackSpecificProps: { value: '' } };
      wrapper.setData({ componentList: [component] });
      await wrapper.setProps({ journeyRememberMeEnabled: true });
      wrapper.vm.setRememberedUsername();
      expect(component.callbackSpecificProps.value).toBe('');
    });
  });

  // When startup fails (e.g. wrong AM server address), the login form still
  // shows. The error only appears when the user tries to log in.
  describe('bootstrap-failed — login form still shows', () => {
    it('Login component renders the main content even when startup failed', () => {
      expect(wrapper.find('#mainContent').exists()).toBe(true);
    });
  });

  // If journey-client bootstrap failed in main.js (e.g. the wellknown fetch could
  // not reach AM), useJourneyClientStore().client is never set. Login must surface
  // the same "trouble connecting" error nextStep() shows for a missing client,
  // and must not go on to call checkNewSession()/nextStep() — checkNewSession()
  // would otherwise throw calling client.terminate() with no client when
  // ?arg=newsession is present.
  describe('bootstrap-failed — client never set', () => {
    afterEach(() => {
      // Put the working client back so other tests are not affected.
      mockStoreInstance.client = {
        next: mockNext,
        start: mockStart,
        resume: mockResume,
        redirect: mockRedirect,
        terminate: mockTerminate,
      };
    });

    it('shows the issueConnecting error and does not call checkNewSession()/nextStep() when the client failed to bootstrap', async () => {
      mockStoreInstance.client = null;
      const pinia = createTestingPinia();
      const failedBootstrapWrapper = shallowMount(Login, {
        global: {
          plugins: [pinia],
          stubs: {
            'router-link': true,
          },
          mocks: {
            $route,
            $sanitize: (message, config) => sanitize(message, config),
            $t: (key) => key,
            $store: {
              state: {
                SharedStore: {
                  webStorageAvailable: true,
                },
              },
            },
          },
          mixins: [LoginMixin],
        },
      });
      const checkNewSessionSpy = jest.spyOn(failedBootstrapWrapper.vm, 'checkNewSession');
      const nextStepSpy = jest.spyOn(failedBootstrapWrapper.vm, 'nextStep');

      await flushPromises();

      expect(checkNewSessionSpy).not.toHaveBeenCalled();
      expect(nextStepSpy).not.toHaveBeenCalled();
      expect(failedBootstrapWrapper.vm.errorMessage).toBe('login.issueConnecting');
      expect(failedBootstrapWrapper.vm.loginFailure).toBe(true);
      expect(failedBootstrapWrapper.vm.loading).toBe(false);

      failedBootstrapWrapper.unmount();
    });
  });

  describe('loading guard in nextStep', () => {
    it('does nothing when a trusted user event fires while an SDK call is already in flight (double-submit race prevention)', () => {
      // Let the first call set this.submitting = true and hang on the SDK call.
      mockStart.mockReturnValue(new Promise(() => {}));
      const trustedEvent = { isTrusted: true, preventDefault: jest.fn() };
      wrapper.vm.nextStep(trustedEvent);
      expect(mockStart).toHaveBeenCalledTimes(1);
      // Second click while the first SDK call is still in flight — must be swallowed.
      wrapper.vm.nextStep(trustedEvent);
      expect(mockStart).toHaveBeenCalledTimes(1);
    });
  });

  // When the startup failed (client is null) and the user clicks submit,
  // they should see a "trouble connecting" error — not a silent nothing.
  describe('client null guard', () => {
    afterEach(() => {
      // Put the working client back so other tests are not affected.
      mockStoreInstance.client = {
        next: mockNext,
        start: mockStart,
        resume: mockResume,
        redirect: mockRedirect,
        terminate: mockTerminate,
      };
    });

    it('nextStep sets an error message and does not call start/next when startup failed', async () => {
      mockStoreInstance.client = null;

      // errorMessage starts empty; after nextStep it should be set to something
      // (the $t mock in this suite returns undefined, so we just check it changed)
      wrapper.vm.errorMessage = '';
      wrapper.vm.nextStep(undefined, false);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockStart).not.toHaveBeenCalled();
      // errorMessage was assigned (not left as empty string)
      expect(wrapper.vm.errorMessage).not.toBe('');
      expect(wrapper.vm.loading).toBe(false);
    });

    it('getNewAuthId calls client.start() with journey/query and resolves with the authId from the step payload', async () => {
      mockStart.mockResolvedValueOnce({ payload: { authId: 'new-auth-id-123' } });

      const authId = await wrapper.vm.getNewAuthId({ tree: 'Login', query: { ForceAuth: 'true' } });

      expect(mockStart).toHaveBeenCalledWith({ journey: 'Login', query: { ForceAuth: 'true' } });
      expect(authId).toBe('new-auth-id-123');
    });
  });

  describe('handleRedirectCallback — outbound redirect', () => {
    const makeRedirectCallback = ({
      redirectUrl = 'https://idp.example.com/authorize',
      redirectMethod = 'GET',
      trackingCookie = true,
      redirectData = {},
    } = {}) => ({
      getOutputByName: (name) => {
        if (name === 'redirectUrl') return redirectUrl;
        if (name === 'redirectMethod') return redirectMethod;
        if (name === 'trackingCookie') return trackingCookie;
        if (name === 'redirectData') return redirectData;
        return undefined;
      },
    });

    it('saves step to localStorage and redirects via window.location.href when expectToReturnFromRedirect is true', () => {
      const fakeStep = { type: 'Step', payload: { authId: 'test-auth-id', callbacks: [] } };
      wrapper.vm.step = fakeStep;

      const addStorageSpy = jest.spyOn(authResumptionUtil, 'addTreeResumeDataToStorage').mockImplementation(() => {});
      const originalLocation = window.location;
      delete window.location;
      window.location = { href: '' };

      const callback = makeRedirectCallback({ trackingCookie: true, redirectMethod: 'GET', redirectUrl: 'https://idp.example.com/authorize' });
      wrapper.vm.handleRedirectCallback(callback);

      expect(addStorageSpy).toHaveBeenCalledWith(fakeStep, wrapper.vm.realm);
      expect(window.location.href).toBe('https://idp.example.com/authorize');

      window.location = originalLocation;
      addStorageSpy.mockRestore();
    });

    it('does not save to localStorage when trackingCookie is false', () => {
      const addStorageSpy = jest.spyOn(authResumptionUtil, 'addTreeResumeDataToStorage').mockImplementation(() => {});
      const originalLocation = window.location;
      delete window.location;
      window.location = { href: '' };

      const callback = makeRedirectCallback({ trackingCookie: false, redirectMethod: 'GET' });
      wrapper.vm.handleRedirectCallback(callback);

      expect(addStorageSpy).not.toHaveBeenCalled();

      window.location = originalLocation;
      addStorageSpy.mockRestore();
    });
  });

  // After the IAM-10906 SDK migration, client.next()/client.start() resolves
  // (not rejects) with a GenericError object on transport failures. The guard
  // inserted before the sessionStorage write and this.step assignment must
  // detect this shape and route it to the error-display path without calling
  // buildTreeForm() or writing to sessionStorage.
  describe('GenericError guard in nextStep .then() handler', () => {
    const genericError = {
      error: 'request_failed',
      message: 'Request failed: fetch error',
      type: 'unknown_error',
    };

    let guardWrapper;

    beforeEach(() => {
      // Use $t: (key) => key so errorMessage assertions can check the i18n key string.
      // The top-level beforeEach uses $t: () => {} (returns undefined), which would
      // make the errorMessage assertion trivially pass undefined === undefined.
      const pinia = createTestingPinia();
      guardWrapper = shallowMount(Login, {
        global: {
          plugins: [pinia],
          stubs: { 'router-link': true },
          mocks: {
            $route,
            $sanitize: (message, config) => sanitize(message, config),
            $t: (key) => key,
            $store: {
              state: {
                SharedStore: {
                  webStorageAvailable: true,
                },
              },
            },
          },
          mixins: [LoginMixin],
        },
      });

      mockNext.mockImplementation(() => Promise.resolve(genericError));
      mockStart.mockImplementation(() => Promise.resolve(genericError));
    });

    it('on step 1 (no previousStep): sets issueConnecting error, clears loading, does not overwrite this.step, sets loginFailure so the banner renders, does not call buildTreeForm, does not write initialStep to sessionStorage', async () => {
      const buildTreeFormSpy = jest.spyOn(guardWrapper.vm, 'buildTreeForm');
      const sessionStorageSetSpy = jest.spyOn(Storage.prototype, 'setItem');
      // Leave guardWrapper.vm.step as undefined (default) so previousStep is falsy (step 1).
      // The guard must return before this.step = step runs, so this.step stays undefined.

      guardWrapper.vm.nextStep(undefined, false);
      await flushPromises();

      expect(guardWrapper.vm.errorMessage).toBe('login.issueConnecting');
      expect(guardWrapper.vm.loading).toBe(false);
      // Guard returned early — this.step must not have been set to the error object
      expect(guardWrapper.vm.step).toBeUndefined();
      // Banner renders only when loginFailure && errorMessage are both set — the card
      // must not be empty (IAM-11941: CDN 403 with HTML body arrives as unknown_error).
      expect(guardWrapper.vm.loginFailure).toBe(true);
      expect(buildTreeFormSpy).not.toHaveBeenCalled();
      expect(sessionStorageSetSpy).not.toHaveBeenCalledWith('initialStep', expect.anything());

      sessionStorageSetSpy.mockRestore();
    });

    it('on step 2+ (previousStep exists) with initialStep in sessionStorage: restores initial step, shows loginFailure banner, sets loginFailure and isFirstStep', async () => {
      const fakeInitialCallbacks = [{ getType: () => 'NameCallback' }];
      const fakeInitialPayload = { authId: 'initial-auth-id', callbacks: [] };
      const fakeInitialStep = { type: 'Step', payload: fakeInitialPayload, callbacks: fakeInitialCallbacks };
      const fakePreviousStep = { type: 'Step', payload: { authId: 'step2-auth-id' }, callbacks: [] };
      const buildTreeFormSpy = jest.spyOn(guardWrapper.vm, 'buildTreeForm');
      // allowListingsEnabled calls decodeJwt which throws on non-JWT strings. Stub it to return
      // false (non-whitelist-state journey) so the else branch runs synchronously.
      jest.spyOn(guardWrapper.vm, 'allowListingsEnabled').mockReturnValue(false);

      // Stub getStepParams so the realmAndTreeKey is deterministic, then seed sessionStorage.
      const fakeStepParams = { realmPath: 'alpha', tree: 'Login', query: {} };
      jest.spyOn(guardWrapper.vm, 'getStepParams').mockReturnValue(fakeStepParams);
      sessionStorage.setItem('initialStep', JSON.stringify({
        key: 'alpha/Login',
        step: fakeInitialStep,
      }));

      // Seed the component with a previous step so previousStep is truthy.
      guardWrapper.vm.step = fakePreviousStep;

      guardWrapper.vm.nextStep(undefined, false);
      await flushPromises();

      expect(guardWrapper.vm.errorMessage).toBe('login.loginFailure');
      expect(guardWrapper.vm.loginFailure).toBe(true);
      expect(guardWrapper.vm.loading).toBe(false);
      expect(guardWrapper.vm.isFirstStep).toBe(true);
      expect(guardWrapper.vm.retry).toBe(true);
      expect(buildTreeFormSpy).toHaveBeenCalled();

      sessionStorage.clear();
    });

    it('on step 2+ of a whitelist-state journey: restores initialStep and rearms the authId on the restored step (matches LoginLegacy LoginFailure branch)', async () => {
      const fakeInitialCallbacks = [{ getType: () => 'NameCallback' }];
      const fakeInitialPayload = { authId: 'initial-whitelist-authid', callbacks: [] };
      const fakeInitialStep = { type: 'Step', payload: fakeInitialPayload, callbacks: fakeInitialCallbacks };
      const fakePreviousStep = { type: 'Step', payload: { authId: 'burned-whitelist-authid' }, callbacks: [] };
      const buildTreeFormSpy = jest.spyOn(guardWrapper.vm, 'buildTreeForm');
      // allowListingsEnabled decodes a JWT via window.atob (not available in jsdom), so spy on
      // it directly rather than constructing a real whitelist-state JWT.
      jest.spyOn(guardWrapper.vm, 'allowListingsEnabled').mockReturnValue(true);

      // Deterministic realmAndTreeKey so the seeded initialStep is picked up on the .then.
      const fakeStepParams = { realmPath: 'alpha', tree: 'Login', query: {} };
      jest.spyOn(guardWrapper.vm, 'getStepParams').mockReturnValue(fakeStepParams);
      sessionStorage.setItem('initialStep', JSON.stringify({
        key: 'alpha/Login',
        step: fakeInitialStep,
      }));

      // finaliseLoginFailure calls getNewAuthId, which calls client.start under the hood.
      // Return a step with a fresh authId so the rearm assignment can be verified.
      const rearmedStep = { type: 'Step', payload: { authId: 'fresh-authid' }, callbacks: [] };
      mockStart.mockResolvedValueOnce(rearmedStep);

      guardWrapper.vm.step = fakePreviousStep;

      guardWrapper.vm.nextStep(undefined, false);
      await flushPromises();

      expect(guardWrapper.vm.errorMessage).toBe('login.loginFailure');
      expect(guardWrapper.vm.loginFailure).toBe(true);
      expect(guardWrapper.vm.loading).toBe(false);
      expect(guardWrapper.vm.isFirstStep).toBe(true);
      expect(guardWrapper.vm.retry).toBe(true);
      // Form is rebuilt for the restored initialStep — user sees the start of the journey.
      expect(buildTreeFormSpy).toHaveBeenCalled();
      // authId is rearmed IN-PLACE on the restored initialStep by finaliseLoginFailure.
      expect(guardWrapper.vm.step.payload.authId).toBe('fresh-authid');

      sessionStorage.clear();
    });

    it('on step 2+ of a whitelist-state journey: clears loading if getNewAuthId fails so the spinner does not get stuck', async () => {
      // The .catch inside finaliseLoginFailure must clear loading even if the rearm call
      // (client.start via getNewAuthId) rejects — otherwise the user sees a stuck spinner.
      const fakeInitialPayload = { authId: 'initial-whitelist-authid', callbacks: [] };
      const fakeInitialStep = { type: 'Step', payload: fakeInitialPayload, callbacks: [] };
      const fakePreviousStep = { type: 'Step', payload: { authId: 'burned-whitelist-authid' }, callbacks: [] };
      jest.spyOn(guardWrapper.vm, 'allowListingsEnabled').mockReturnValue(true);

      const fakeStepParams = { realmPath: 'alpha', tree: 'Login', query: {} };
      jest.spyOn(guardWrapper.vm, 'getStepParams').mockReturnValue(fakeStepParams);
      sessionStorage.setItem('initialStep', JSON.stringify({
        key: 'alpha/Login',
        step: fakeInitialStep,
      }));

      // Simulate a transport failure in the rearm call.
      mockStart.mockRejectedValueOnce(new Error('network'));

      guardWrapper.vm.step = fakePreviousStep;

      guardWrapper.vm.nextStep(undefined, false);
      await flushPromises();

      expect(guardWrapper.vm.loading).toBe(false);

      sessionStorage.clear();
    });

    it('on step 2+ of a whitelist-state journey: rearm failure still shows the failure banner so the card is not empty (IAM-11941)', async () => {
      // When the rearm call (client.start via getNewAuthId) rejects — e.g. a 403 Forbidden
      // from /am/json/authenticate — the .catch inside finaliseLoginFailure must not only
      // clear loading but also set loginFailure and the fallback errorMessage. Otherwise the
      // restored initialStep renders with no banner: an empty card (IAM-11941).
      const fakeInitialPayload = { authId: 'initial-whitelist-authid', callbacks: [] };
      const fakeInitialStep = { type: 'Step', payload: fakeInitialPayload, callbacks: [] };
      const fakePreviousStep = { type: 'Step', payload: { authId: 'burned-whitelist-authid' }, callbacks: [] };
      jest.spyOn(guardWrapper.vm, 'allowListingsEnabled').mockReturnValue(true);

      const fakeStepParams = { realmPath: 'alpha', tree: 'Login', query: {} };
      jest.spyOn(guardWrapper.vm, 'getStepParams').mockReturnValue(fakeStepParams);
      sessionStorage.setItem('initialStep', JSON.stringify({
        key: 'alpha/Login',
        step: fakeInitialStep,
      }));

      // Simulate the rearm call failing with 403 Forbidden on the fresh journey start.
      mockStart.mockRejectedValueOnce(new Error('403'));

      guardWrapper.vm.step = fakePreviousStep;

      guardWrapper.vm.nextStep(undefined, false);
      await flushPromises();

      expect(guardWrapper.vm.loading).toBe(false);
      expect(guardWrapper.vm.loginFailure).toBe(true);
      expect(guardWrapper.vm.errorMessage).toBe('login.loginFailure');

      sessionStorage.clear();
    });

    it('on step 2+ with ?gotoOnFail= in the URL: redirects the browser to the gotoOnFail URL (matches LoginLegacy LoginFailure branch)', async () => {
      // Old SDK LoginFailure branch wrapped the recovery in redirectToFailure(step).then(...).
      // redirectToFailure honours a ?gotoOnFail= URL param by navigating the browser there
      // before doing any restore-to-start work. New SDK step-2+ unknown_error branch must
      // preserve this so a customer who set ?gotoOnFail=<url> keeps the same failure UX.
      const originalLocation = window.location;
      const gotoOnFailUrl = 'https://mycompany.example/login-failed';
      Object.defineProperty(window, 'location', {
        value: {
          search: `?gotoOnFail=${encodeURIComponent(gotoOnFailUrl)}`,
          href: '',
        },
        writable: true,
      });

      const verifySpy = jest.spyOn(guardWrapper.vm, 'verifyGotoUrlAndRedirect').mockResolvedValue(gotoOnFailUrl);
      const fakePreviousStep = { type: 'Step', payload: { authId: 'step2-auth-id' }, callbacks: [] };
      guardWrapper.vm.step = fakePreviousStep;

      guardWrapper.vm.nextStep(undefined, false);
      await flushPromises();

      expect(verifySpy).toHaveBeenCalledWith(gotoOnFailUrl, '/', false, true);
      expect(window.location.href).toBe(gotoOnFailUrl);

      Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
    });

    it('on step 2+ with no initialStep in sessionStorage: shows loginFailure banner but step becomes undefined and buildTreeForm is NOT called (IAM-11759)', async () => {
      const fakePreviousStep = { type: 'Step', payload: { authId: 'step2-auth-id' }, callbacks: [] };
      const buildTreeFormSpy = jest.spyOn(guardWrapper.vm, 'buildTreeForm');
      // Non-whitelist journey — stub so the guard falls through to the IAM-11759 restore-initialStep branch.
      jest.spyOn(guardWrapper.vm, 'allowListingsEnabled').mockReturnValue(false);
      sessionStorage.clear();

      guardWrapper.vm.step = fakePreviousStep;

      guardWrapper.vm.nextStep(undefined, false);
      await flushPromises();

      expect(guardWrapper.vm.errorMessage).toBe('login.loginFailure');
      expect(guardWrapper.vm.loginFailure).toBe(true);
      expect(guardWrapper.vm.loading).toBe(false);
      expect(guardWrapper.vm.step).toBeUndefined();
      expect(buildTreeFormSpy).not.toHaveBeenCalled();
    });
  });

  describe('checkNewSession()', () => {
    beforeEach(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    it('resolves immediately when arg=newsession is not present', async () => {
      jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue('realm=alpha');
      await expect(wrapper.vm.checkNewSession()).resolves.toBeUndefined();
      expect(mockTerminate).not.toHaveBeenCalled();
    });

    it('calls terminate() and resolves when arg=newsession is present and terminate succeeds', async () => {
      jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue('arg=newsession&realm=alpha');
      mockTerminate.mockResolvedValueOnce(undefined);

      await expect(wrapper.vm.checkNewSession()).resolves.toBeUndefined();
      expect(mockTerminate).toHaveBeenCalledTimes(1);
    });

    it('resolves and continues when terminate returns a GenericError no active session is harmless)', async () => {
      jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue('arg=newsession');
      mockTerminate.mockResolvedValueOnce({ error: 'terminate_failed', message: 'Failed to terminate session: 503', type: 'unknown_error' });
      mockTerminate.mockClear();

      await expect(wrapper.vm.checkNewSession()).resolves.toBeUndefined();
      expect(mockTerminate).toHaveBeenCalledTimes(1);
      // No blocking error state is set — the journey always loads.
      expect(wrapper.vm.errorMessage).toBeFalsy();
      expect(wrapper.vm.loginFailure).toBe(false);
    });

    it('resolves and continues when terminate rejects (fail-open)', async () => {
      jest.spyOn(urlUtil, 'getCurrentQueryString').mockReturnValue('arg=newsession');
      mockTerminate.mockRejectedValueOnce(new Error('Server configuration is missing.'));
      mockTerminate.mockClear();

      await expect(wrapper.vm.checkNewSession()).resolves.toBeUndefined();
      expect(mockTerminate).toHaveBeenCalledTimes(1);
      // No blocking error state is set — the journey always loads.
      expect(wrapper.vm.errorMessage).toBeFalsy();
      expect(wrapper.vm.loginFailure).toBe(false);
    });
  });
});

describe('Component Test', () => {
  const stepPayload = {
    authId: 'eyxQ',
    callbacks: [
      {
        type: 'NameCallback',
        output: [
          {
            name: 'prompt',
            value: 'User Name',
          },
        ],
        input: [
          {
            name: 'IDToken1',
            value: '',
          },
        ],
        _id: 0,
      },
      {
        type: 'PasswordCallback',
        output: [
          {
            name: 'prompt',
            value: 'Password',
          },
          {
            name: 'policies',
            value: {
              policyRequirements: [
                'VALID_TYPE',
              ],
              fallbackPolicies: null,
              name: 'password',
              policies: [
                {
                  policyRequirements: [
                    'VALID_TYPE',
                  ],
                  policyId: 'valid-type',
                  params: {
                    types: [
                      'string',
                    ],
                  },
                },
              ],
              conditionalPolicies: null,
            },
          },
          {
            name: 'failedPolicies',
            value: [
              '{ "policyRequirement": "LENGTH_BASED", "params": { "max-password-length": 0, "min-password-length": 8 } }',
              "{ \"policyRequirement\": \"CHARACTER_SET\", \"params\": { \"allow-unclassified-characters\": true, \"character-set-ranges\": [  ], \"character-sets\": [ \"1:0123456789\", \"1:ABCDEFGHIJKLMNOPQRSTUVWXYZ\", \"1:abcdefghijklmnopqrstuvwxyz\", \"1:~!@#$%^&*()-_=+[]{}|;:,.<>/?\\\"'\\\\`\" ], \"min-character-sets\": 0 } }",
            ],
          },
        ],
        input: [
          {
            name: 'IDToken2',
            value: '',
          },
        ],
        _id: 1,
      },
    ],
    header: 'Sign In',
    description: 'New here? <a href="#/service/Registration">Create an account</a><br><a href="#/service/ForgottenUsername">Forgot username?</a><a href="#/service/ResetPassword"> Forgot password?</a>',
  };

  const mountLogin = async (overrideData = {}, props = {}) => {
    const wrapper = mount(Login, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          'router-link': true,
          FrField: true,
          FrPasswordCallback: true,
        },
        mocks: {
          $route: {
            params: {
              tree: undefined,
            },
          },
          $t: (t) => t,
          $store: {
            state: {
              SharedStore: {
                webStorageAvailable: true,
              },
            },
          },
          $sanitize: (message, config) => sanitize(message, config),
        },
      },
      mixins: [LoginMixin],
      props,
    });
    await flushPromises();

    await wrapper.setData(overrideData);
    return wrapper;
  };

  describe('Loads login callback components with extra query parameters in the URL', () => {
    const originalWindow = window;
    global.URLSearchParams = URLSearchParams;

    const setUrl = (url) => {
      delete window.location;
      window.location = new URL(url);
    };

    let replaceState;

    beforeAll(() => {
      jest.restoreAllMocks();
    });

    beforeEach(() => {
      jest.spyOn(LoginMixin.methods, 'getConfigurationInfo').mockImplementation(() => Promise.resolve({ data: { realm: '/' } }));
      replaceState = jest.fn();
      Object.defineProperty(global, 'window', {
        writable: true,
        value: {
          location: {},
          history: {
            replaceState,
          },
        },
      });
    });

    afterAll(() => {
      // eslint-disable-next-line no-global-assign
      window = originalWindow;
    });

    it('Removes tree resumption query parameters when returning from a redirect', async () => {
      setUrl('https://forgerock.io/login/?realm=/&code=aCode');

      // Simulate the pre-redirect step having been saved to localStorage by addTreeResumeDataToStorage
      // (done by handleRedirectCallback on the outbound leg). resumingTreeFollowingRedirect checks
      // for this key to detect that we're returning from an OAuth redirect.
      const resumeStep = rehydrateStep({ callbacks: [] });
      jest.spyOn(authResumptionUtil, 'resumingTreeFollowingRedirect').mockReturnValue(true);
      const getStepSpy = jest.spyOn(authResumptionUtil, 'getResumeDataFromStorageAndClear').mockReturnValue({ realmAtRedirect: '/', step: resumeStep });
      mockNext.mockImplementation(() => Promise.resolve(rehydrateStep({ callbacks: [] })));

      const wrapper = await mountLogin();

      expect(replaceState).toBeCalledWith(null, null, '?realm=/');
      expect(findByTestId(wrapper, 'callbacks_panel').exists()).toBeTruthy();

      getStepSpy.mockRestore();
      authResumptionUtil.resumingTreeFollowingRedirect.mockRestore();
    });

    it('calls client.next() with the pre-redirect step and OAuth params in query when resuming after redirect', async () => {
      setUrl('https://forgerock.io/login/?realm=/&code=aCode&state=aState');

      const resumeStep = rehydrateStep({ callbacks: [] });
      jest.spyOn(authResumptionUtil, 'resumingTreeFollowingRedirect').mockReturnValue(true);
      const getStepSpy = jest.spyOn(authResumptionUtil, 'getResumeDataFromStorageAndClear').mockReturnValue({ realmAtRedirect: '/', step: resumeStep });
      mockNext.mockImplementation(() => Promise.resolve(rehydrateStep({ callbacks: [] })));
      mockStart.mockReset();

      await mountLogin();

      // client.next() is called with the rehydrated step and the OAuth params forwarded in query
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ payload: resumeStep.payload }),
        expect.objectContaining({ query: expect.objectContaining({ code: 'aCode', state: 'aState' }) }),
      );
      expect(mockStart).not.toHaveBeenCalled();

      getStepSpy.mockRestore();
      authResumptionUtil.resumingTreeFollowingRedirect.mockRestore();
    });

    it('Leaves tree resumption query parameters in place when not returning from a redirect', async () => {
      setUrl('https://forgerock.io/login/?realm=/&code=aCode&notRemoved=here');

      // resumingTreeFollowingRedirect returns false (no treeResumeData in localStorage),
      // so the component falls through to the normal branch, leaving code/other params in the URL.
      jest.spyOn(authResumptionUtil, 'resumingTreeFollowingRedirect').mockReturnValue(false);

      const wrapper = await mountLogin();

      expect(replaceState).toBeCalledWith(null, null, '?realm=/&code=aCode&notRemoved=here');
      expect(findByTestId(wrapper, 'callbacks_panel').exists()).toBeTruthy();

      authResumptionUtil.resumingTreeFollowingRedirect.mockRestore();
    });

    it('add validation immediate to component if it has failed policies', async () => {
      const data = {
        loading: true,
        step: rehydrateStep(stepPayload),
      };

      const wrapper = await mountLogin(data);

      wrapper.vm.buildTreeForm();
      await flushPromises();

      expect(wrapper.vm.componentList[0].callbackSpecificProps.validationImmediate).toBe(false);
      expect(wrapper.vm.componentList[1].callbackSpecificProps.validationImmediate).toBe(true);
    });

    it('sets isRequired to true for NameCallback and PasswordCallback', async () => {
      const data = {
        loading: true,
        step: rehydrateStep(stepPayload),
      };

      const wrapper = await mountLogin(data);

      wrapper.vm.buildTreeForm();
      await flushPromises();

      const nameComponent = wrapper.vm.componentList.find((c) => c.callback.getType() === 'NameCallback');
      const passwordComponent = wrapper.vm.componentList.find((c) => c.callback.getType() === 'PasswordCallback');

      expect(nameComponent.isRequired).toBe(true);
      expect(passwordComponent.isRequired).toBe(true);
    });

    it('does not set isRequired for other callback types without a required output', async () => {
      const step = rehydrateStep({
        authId: 'eyxQ',
        callbacks: [
          {
            type: 'StringAttributeInputCallback',
            output: [
              { name: 'name', value: 'givenName' },
              { name: 'prompt', value: 'First Name' },
              { name: 'required', value: false },
              { name: 'policies', value: { policyRequirements: [], policies: [] } },
              { name: 'failedPolicies', value: [] },
              { name: 'validateOnly', value: false },
              { name: 'value', value: '' },
            ],
            input: [{ name: 'IDToken1', value: '' }],
          },
        ],
      });

      const wrapper = await mountLogin({ loading: true, step });

      wrapper.vm.buildTreeForm();
      await flushPromises();

      expect(wrapper.vm.componentList[0].isRequired).toBe(false);
    });
  });

  describe('journeyShowAsteriskForRequiredFields', () => {
    const asteriskMarkup = '<span class="text-danger" aria-hidden="true">*</span>';
    const mixedStepPayload = {
      authId: 'eyxQ',
      callbacks: [
        {
          type: 'NameCallback',
          output: [{ name: 'prompt', value: 'User Name' }],
          input: [{ name: 'IDToken1', value: '' }],
          _id: 0,
        },
        {
          type: 'PasswordCallback',
          output: [{ name: 'prompt', value: 'Password' }],
          input: [{ name: 'IDToken2', value: '' }],
          _id: 1,
        },
        {
          type: 'StringAttributeInputCallback',
          output: [
            { name: 'name', value: 'givenName' },
            { name: 'prompt', value: 'First Name' },
            { name: 'required', value: false },
            { name: 'policies', value: { policyRequirements: [], policies: [] } },
            { name: 'failedPolicies', value: [] },
            { name: 'validateOnly', value: false },
            { name: 'value', value: '' },
          ],
          input: [{ name: 'IDToken3', value: '' }],
          _id: 2,
        },
      ],
      header: 'Sign In',
    };

    const getComponent = (wrapper, type) => wrapper.vm.componentList.find((component) => component.callback.getType() === type);

    it('derives asterisk display props when the setting is already true during navigation', async () => {
      const wrapper = await mountLogin(
        { loading: true, step: rehydrateStep(mixedStepPayload) },
        { journeyShowAsteriskForRequiredFields: true },
      );

      wrapper.vm.buildTreeForm();
      await flushPromises();

      const nameComponent = getComponent(wrapper, 'NameCallback');
      const passwordComponent = getComponent(wrapper, 'PasswordCallback');
      const firstNameComponent = getComponent(wrapper, 'StringAttributeInputCallback');

      expect(wrapper.vm.buildCallbackDisplayProps(nameComponent).label).toBe(`User Name${asteriskMarkup}`);
      expect(wrapper.vm.buildCallbackDisplayProps(passwordComponent).label).toBe(`Password${asteriskMarkup}`);
      expect(nameComponent.callbackSpecificProps.label).toBe('User Name');
      expect(nameComponent.callbackSpecificProps.isHtml).toBeUndefined();
      expect(firstNameComponent.callbackSpecificProps.label).toBe('First Name');
      expect(wrapper.vm.buildCallbackDisplayProps(firstNameComponent)).toEqual(firstNameComponent.callbackSpecificProps);
    });

    it('derives props without mutating the source or duplicating the indicator', async () => {
      const wrapper = await mountLogin(
        { loading: true, step: rehydrateStep(mixedStepPayload) },
        { journeyShowAsteriskForRequiredFields: true },
      );

      wrapper.vm.buildTreeForm();
      await flushPromises();

      const nameComponent = getComponent(wrapper, 'NameCallback');
      const sourceProps = { ...nameComponent.callbackSpecificProps };
      const firstDisplayProps = wrapper.vm.buildCallbackDisplayProps(nameComponent);
      const secondDisplayProps = wrapper.vm.buildCallbackDisplayProps(nameComponent);

      expect(firstDisplayProps.label).toBe(`User Name${asteriskMarkup}`);
      expect(secondDisplayProps.label).toBe(`User Name${asteriskMarkup}`);
      expect(nameComponent.callbackSpecificProps).toEqual(sourceProps);
      // The returned props must be structurally different — a new spread alone would
      // satisfy not.toBe(), so assert the augmented label contents instead.
      expect(firstDisplayProps).not.toEqual(nameComponent.callbackSpecificProps);
    });

    it('reflects theme changes without resetting existing HTML state', async () => {
      const wrapper = await mountLogin(
        { loading: true, step: rehydrateStep(mixedStepPayload) },
        { journeyShowAsteriskForRequiredFields: true },
      );

      wrapper.vm.buildTreeForm();
      await flushPromises();

      const nameComponent = getComponent(wrapper, 'NameCallback');
      nameComponent.callbackSpecificProps.isHtml = true;
      const sourceProps = { ...nameComponent.callbackSpecificProps };

      await wrapper.setProps({ journeyShowAsteriskForRequiredFields: false });
      expect(wrapper.vm.buildCallbackDisplayProps(nameComponent)).toEqual(sourceProps);

      await wrapper.setProps({ journeyShowAsteriskForRequiredFields: true });
      expect(wrapper.vm.buildCallbackDisplayProps(nameComponent).label).toBe(`User Name${asteriskMarkup}`);
      expect(nameComponent.callbackSpecificProps).toEqual(sourceProps);
    });

    it('translates the raw label before adding the required indicator', async () => {
      const wrapper = await mountLogin(
        { loading: true, step: rehydrateStep(mixedStepPayload) },
        { journeyShowAsteriskForRequiredFields: true },
      );

      wrapper.vm.buildTreeForm();
      await flushPromises();

      const nameComponent = getComponent(wrapper, 'NameCallback');
      const translationSpy = jest.spyOn(wrapper.vm, 'getTranslation').mockReturnValue('Nom d’utilisateur');

      expect(wrapper.vm.buildCallbackDisplayProps(nameComponent).label).toBe(`Nom d’utilisateur${asteriskMarkup}`);
      expect(translationSpy).toHaveBeenCalledWith('User Name');
      translationSpy.mockRestore();
    });
  });

  describe('Theming and callbacks', () => {
    function setup(props) {
      return mount(Login, {
        global: {
          plugins: [i18n, createTestingPinia()],
          stubs: {
            'router-link': true,
          },
          mocks: {
            $route: {
              params: {
                tree: undefined,
              },
            },
            $sanitize: () => {},
            $store: {
              state: {
                SharedStore: {
                  webStorageAvailable: true,
                },
              },
            },
          },
        },
        attachTo: document.body,
        mixins: [LoginMixin, RestMixin],
        props: {
          ...props,
        },
      });
    }

    const authData = {
      authId: '',
      callbacks: [{
        type: 'NameCallback', output: [{ name: 'prompt', value: 'User Name' }], input: [{ name: 'IDToken1', value: '' }],
      }, {
        type: 'PasswordCallback', output: [{ name: 'prompt', value: 'Password' }], input: [{ name: 'IDToken2', value: '' }],
      }],
      header: 'Sign In',
      description: '',
    };

    beforeEach(() => {
      jest.useRealTimers();
      jest.spyOn(LoginMixin.methods, 'getConfigurationInfo').mockImplementation(() => Promise.resolve({ data: { realm: '/' } }));
      // Mock `start` and `next` together so journey-start (`this.step`
      // undefined) and journey-advance both resolve.
      mockNext.mockImplementation(() => Promise.resolve(rehydrateStep(authData)));
      mockStart.mockImplementation(() => Promise.resolve(rehydrateStep(authData)));
    });

    describe('@renders', () => {
      it.each([
        ['card', { journeyLayout: 'card', journeyTheaterMode: false }],
        ['theater', { journeyLayout: 'justified-left', journeyTheaterMode: true }],
      ])('hides the fallback error heading and alert for an empty message in %s layout', async (_layout, layoutProps) => {
        const renderWrapper = setup(layoutProps);
        await flushPromises();

        await renderWrapper.setData({
          loading: false,
          themeLoading: false,
          header: '',
          loginFailure: true,
          errorMessage: '',
        });

        const failureAlert = renderWrapper.findAllComponents({ name: 'Alert' })[0];
        expect(renderWrapper.find('h1.h2').exists()).toBe(false);
        expect(failureAlert.props('show')).toBe(false);

        await renderWrapper.setData({ errorMessage: 'AUTHN002' });

        expect(renderWrapper.find('h1.h2').exists()).toBe(true);
        expect(failureAlert.props('show')).toBe(true);
        renderWrapper.unmount();
      });

      it.skip('Displays remember my login checkbox if its enabled in the theme', async () => {
        jest.useFakeTimers();
        const wrapperOff = setup({ journeyRememberMeEnabled: false });
        await flushPromises();
        wrapperOff.vm.setRememberedUsername();
        await wrapperOff.vm.$nextTick();
        expect(wrapperOff.find('input[name="rememberMe"]').exists()).toBeFalsy();
        wrapperOff.unmount();

        const wrapper = setup({ journeyRememberMeEnabled: true });
        await flushPromises();
        wrapper.vm.setRememberedUsername();
        await wrapper.vm.$nextTick();

        const rememberMe = wrapper.find('input[name="rememberMe"]');
        expect(rememberMe.exists()).toBeTruthy();

        let rememberMeLabel = wrapper.find('#rememberMe label');
        expect(rememberMeLabel.text()).toBe('Remember Me');

        await wrapper.setProps({ journeyRememberMeLabel: 'test' });
        await flushPromises();
        rememberMeLabel = wrapper.find('#rememberMe label');
        expect(rememberMeLabel.text()).toBe('test');
        wrapper.unmount();
      });
    });

    describe('@actions', () => {
      let localStorageSetSpy;
      let localStorageRemoveSpy;
      let wrapper;

      beforeEach(() => {
        localStorageSetSpy = jest.spyOn(Storage.prototype, 'setItem');
        localStorageRemoveSpy = jest.spyOn(Storage.prototype, 'removeItem');
      });

      afterEach(() => {
        if (wrapper) {
          wrapper.unmount();
          wrapper = null;
        }
        localStorageSetSpy.mockRestore();
        localStorageRemoveSpy.mockRestore();
        localStorage.clear();
      });

      it.skip('Saves username to localstorage if rememberMe is enabled', async () => {
        wrapper = setup({ journeyRememberMeEnabled: true, themeLoading: true });
        await flushPromises();
        await wrapper.setProps({ themeLoading: false });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        const usernameInput = wrapper.find('div[label="User Name"] input');
        const rememberMe = wrapper.find('input[name="rememberMe"]');
        const nextBtn = wrapper.find('button[type="submit"]');

        await usernameInput.setValue('test');
        await rememberMe.setChecked();
        await nextBtn.trigger('click');
        await wrapper.vm.$nextTick();

        expect(localStorageSetSpy).toHaveBeenCalledWith('frUsername', 'test');
      });

      it.skip('Removes username from localStorage if rememberMe is disabled', async () => {
        wrapper = setup({ journeyRememberMeEnabled: true, themeLoading: true });
        await flushPromises();
        await wrapper.setProps({ themeLoading: false });
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        const usernameInput = wrapper.find('div[label="User Name"] input');
        const rememberMe = wrapper.find('input[name="rememberMe"]');
        const nextBtn = wrapper.find('button[type="submit"]');

        await usernameInput.setValue('test');
        await rememberMe.setChecked(false);

        await nextBtn.trigger('click');
        await wrapper.vm.$nextTick();
        expect(localStorageRemoveSpy).toHaveBeenCalled();
      });
    });
    describe('callbacks', () => {
      let callbacksWrapper;

      afterEach(() => {
        if (callbacksWrapper) {
          callbacksWrapper.unmount();
          callbacksWrapper = null;
        }
      });

      it('ensures that the username field is populated with the defaultText value if a defaultText output object is present', async () => {
        const authDataWithDefaultText = {
          authId: '',
          callbacks: [{
            type: 'NameCallback',
            output: [
              { name: 'prompt', value: 'User Name' },
              { name: 'defaultText', value: 'User Name default value text' },
            ],
            input: [{ name: 'IDToken1', value: '' }],
          }],
          header: 'Sign In',
          description: '',
        };
        mockNext.mockImplementation(() => Promise.resolve(rehydrateStep(authDataWithDefaultText)));
        mockStart.mockImplementation(() => Promise.resolve(rehydrateStep(authDataWithDefaultText)));

        callbacksWrapper = setup();
        jest.spyOn(callbacksWrapper.vm, 'getRequestService').mockImplementation(() => ({ post: () => Promise.resolve({ data: { successURL: '/am/console' } }) }));
        await flushPromises();

        const usernameInput = callbacksWrapper.find('div[label="User Name"] input');
        expect(usernameInput.element.value).toBe('User Name default value text');
      });

      it('Sets validation attributes when valid email address and required policies are present', async () => {
        const stepValidationPayload = {
          authId: 'eyxQ',
          callbacks: [
            {
              type: 'NameCallback',
              output: [
                { name: 'prompt', value: 'Email' },
                { name: 'policies', value: { policyRequirements: ['VALID_EMAIL_ADDRESS_FORMAT', 'REQUIRED'] } },
              ],
              input: [
                { name: 'IDToken1', value: '' },
              ],
              _id: 0,
            },
          ],
          description: '',
        };

        mockNext.mockImplementation(() => Promise.resolve(rehydrateStep(stepValidationPayload)));
        mockStart.mockImplementation(() => Promise.resolve(rehydrateStep(stepValidationPayload)));
        const data = { loading: true, step: rehydrateStep(stepValidationPayload) };
        callbacksWrapper = setup(data);

        await flushPromises();
        callbacksWrapper.vm.buildTreeForm();
        await flushPromises();

        const frField = callbacksWrapper.find('.callback-component');
        // Check the validation attribute
        expect(frField.attributes('validation')).toBe('email|required');
      });

      it('Sets autocomplete attribute when autocompleteValues output is present', async () => {
        const authDataWithAutocomplete = {
          authId: '',
          callbacks: [{
            type: 'NameCallback',
            output: [
              { name: 'prompt', value: 'User Name' },
              { name: 'autocompleteValues', value: ['webauthn', 'email'] },
            ],
            input: [{ name: 'IDToken1', value: '' }],
          }],
          header: 'Sign In',
          description: '',
        };
        mockNext.mockImplementation(() => Promise.resolve(rehydrateStep(authDataWithAutocomplete)));
        mockStart.mockImplementation(() => Promise.resolve(rehydrateStep(authDataWithAutocomplete)));

        callbacksWrapper = setup();
        jest.spyOn(callbacksWrapper.vm, 'getRequestService').mockImplementation(() => ({ post: () => Promise.resolve({ data: { successURL: '/am/console' } }) }));
        await flushPromises();

        const frField = callbacksWrapper.find('.callback-component');
        // Check the autocomplete attribute
        expect(frField.attributes('autocomplete')).toBe('webauthn email');
      });

      it('Falls back to label lookup when autocompleteValues output is missing', async () => {
        const authDataMissingAutocomplete = {
          authId: '',
          callbacks: [{
            type: 'NameCallback',
            output: [
              { name: 'prompt', value: 'User Name' },
            ],
            input: [{ name: 'IDToken1', value: '' }],
          }],
          header: 'Sign In',
          description: '',
        };
        mockNext.mockImplementation(() => Promise.resolve(rehydrateStep(authDataMissingAutocomplete)));
        mockStart.mockImplementation(() => Promise.resolve(rehydrateStep(authDataMissingAutocomplete)));

        callbacksWrapper = setup();
        jest.spyOn(callbacksWrapper.vm, 'getRequestService').mockImplementation(() => ({ post: () => Promise.resolve({ data: { successURL: '/am/console' } }) }));
        await flushPromises();

        const frField = callbacksWrapper.find('.callback-component');
        // 'User Name' maps to 'username' in loginUtils.js
        expect(frField.attributes('autocomplete')).toBe('username');
      });

      it('Falls back to label lookup when autocompleteValues output is empty', async () => {
        const authDataEmptyAutocomplete = {
          authId: '',
          callbacks: [{
            type: 'NameCallback',
            output: [
              { name: 'prompt', value: 'User Name' },
              { name: 'autocompleteValues', value: [] },
            ],
            input: [{ name: 'IDToken1', value: '' }],
          }],
          header: 'Sign In',
          description: '',
        };
        mockNext.mockImplementation(() => Promise.resolve(rehydrateStep(authDataEmptyAutocomplete)));
        mockStart.mockImplementation(() => Promise.resolve(rehydrateStep(authDataEmptyAutocomplete)));

        callbacksWrapper = setup();
        jest.spyOn(callbacksWrapper.vm, 'getRequestService').mockImplementation(() => ({ post: () => Promise.resolve({ data: { successURL: '/am/console' } }) }));
        await flushPromises();

        const frField = callbacksWrapper.find('.callback-component');
        // 'User Name' maps to 'username'
        expect(frField.attributes('autocomplete')).toBe('username');
      });
    });
  });

  describe('Focus Management', () => {
    let wrapper;

    const createWrapper = (props = {}) => mount(Login, {
      global: {
        stubs: {
          'router-link': true,
          FrField: true,
          FrPasswordCallback: true,
        },
        mocks: {
          $route: {
            params: {
              tree: undefined,
            },
          },
          $t: (t) => t,
          $sanitize: (message) => message,
          $store: {
            state: {
              SharedStore: {
                webStorageAvailable: true,
              },
            },
          },
        },
      },
      attachTo: document.body,
      mixins: [LoginMixin, RestMixin],
      props,
    });

    beforeEach(() => {
      jest.useFakeTimers({ doNotFake: ['setImmediate'] });
    });

    afterEach(() => {
      if (wrapper) {
        wrapper.unmount();
      }
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    describe('handleFocus() - Focus Element Determination', () => {
      it('focuses on top level container by default when no special config are met', async () => {
        wrapper = createWrapper({
          journeyFocusElement: '',
        });
        await flushPromises();

        const focusSpy = jest.fn();
        wrapper.vm.$refs.container.focus = focusSpy;

        wrapper.vm.handleFocus();
        jest.advanceTimersByTime(200);

        expect(focusSpy).toHaveBeenCalled();
      });

      it('focuses on main element when journeyFocusElement is set to "content"', async () => {
        wrapper = createWrapper({
          journeyFocusElement: 'content',
        });
        await flushPromises();

        const focusSpy = jest.fn();
        wrapper.vm.$refs.main.focus = focusSpy;

        wrapper.vm.handleFocus();
        jest.advanceTimersByTime(200);

        expect(focusSpy).toHaveBeenCalled();
      });

      it('focuses on main element when journeyFocusElement is "headerFirstStep" and NOT on first step', async () => {
        wrapper = createWrapper({
          journeyFocusElement: 'headerFirstStep',
        });
        await flushPromises();

        wrapper.vm.isFirstStep = false;

        const focusSpy = jest.fn();
        wrapper.vm.$refs.main.focus = focusSpy;

        wrapper.vm.handleFocus();
        jest.advanceTimersByTime(200);

        expect(focusSpy).toHaveBeenCalled();
      });

      it('focuses on header container when journeyFocusElement is "headerFirstStep" and on first step', async () => {
        wrapper = createWrapper({
          journeyHeaderEnabled: true,
          journeyHeader: 'Test Header',
          journeyLayout: 'card',
          journeyFocusElement: 'headerFirstStep',
        });
        await flushPromises();

        wrapper.vm.isFirstStep = true;

        const focusSpy = jest.fn();
        if (wrapper.vm.$refs.callbackAppHeaderContainer) {
          wrapper.vm.$refs.callbackAppHeaderContainer.focus = focusSpy;
          wrapper.vm.handleFocus();
          jest.advanceTimersByTime(200);
          expect(focusSpy).toHaveBeenCalled();
        } else {
          const containerFocusSpy = jest.fn();
          wrapper.vm.$refs.container.focus = containerFocusSpy;
          wrapper.vm.handleFocus();
          jest.advanceTimersByTime(200);
          expect(containerFocusSpy).toHaveBeenCalled();
        }
      });

      it('focuses on main element when journeyFocusFirstFocusableItemEnabled is true and NOT on first step', async () => {
        wrapper = createWrapper({
          journeyFocusFirstFocusableItemEnabled: true,
        });
        await flushPromises();

        wrapper.vm.isFirstStep = false;

        const focusSpy = jest.fn();
        wrapper.vm.$refs.main.focus = focusSpy;

        wrapper.vm.handleFocus();
        jest.advanceTimersByTime(200);

        expect(focusSpy).toHaveBeenCalled();
      });

      it('focuses on container when journeyFocusFirstFocusableItemEnabled is true but on first step', async () => {
        wrapper = createWrapper({
          journeyFocusFirstFocusableItemEnabled: true,
        });
        await flushPromises();

        wrapper.vm.isFirstStep = true;

        const focusSpy = jest.fn();
        wrapper.vm.$refs.container.focus = focusSpy;

        wrapper.vm.handleFocus();
        jest.advanceTimersByTime(200);

        expect(focusSpy).toHaveBeenCalled();
      });
    });

    describe('handleFocus() - CSS Class Management', () => {
      it('adds "auto-focused" class to focused element', async () => {
        wrapper = createWrapper();
        await flushPromises();

        const focusedElement = wrapper.vm.$refs.container;
        wrapper.vm.handleFocus();
        jest.advanceTimersByTime(200);

        expect(focusedElement.classList.contains('auto-focused')).toBe(true);
      });

      it('removes previous auto-focused class before re-adding it', async () => {
        wrapper = createWrapper();
        await flushPromises();

        const focusedElement = wrapper.vm.$refs.container;
        focusedElement.classList.add('auto-focused');

        await wrapper.vm.handleFocus();

        expect(focusedElement.classList.contains('auto-focused')).toBe(true);
      });

      it('removes "auto-focused" class when element loses focus', async () => {
        wrapper = createWrapper();
        await flushPromises();

        const focusedElement = wrapper.vm.$refs.container;

        wrapper.vm.handleFocus();
        jest.advanceTimersByTime(200);
        expect(focusedElement.classList.contains('auto-focused')).toBe(true);

        focusedElement.dispatchEvent(new Event('blur'));

        expect(focusedElement.classList.contains('auto-focused')).toBe(false);
      });
    });

    describe('handleFocus() - Event Listener Management', () => {
      it('registers blur event listener on focused element', async () => {
        wrapper = createWrapper();
        await flushPromises();

        const focusedElement = wrapper.vm.$refs.container;
        const addEventListenerSpy = jest.spyOn(focusedElement, 'addEventListener');

        wrapper.vm.handleFocus();
        jest.advanceTimersByTime(200);

        expect(addEventListenerSpy).toHaveBeenCalledWith('blur', expect.any(Function), { once: true });
        addEventListenerSpy.mockRestore();
      });

      it('stores cleanup reference for future cleanup', async () => {
        wrapper = createWrapper();
        await flushPromises();

        expect(wrapper.vm.autoFocusCleanup).toBeNull();

        wrapper.vm.handleFocus();
        jest.advanceTimersByTime(200);

        expect(wrapper.vm.autoFocusCleanup).not.toBeNull();
        expect(wrapper.vm.autoFocusCleanup.element).toBe(wrapper.vm.$refs.container);
        expect(wrapper.vm.autoFocusCleanup.handler).toBeDefined();
      });

      it('removes previous blur event listener before adding new one', async () => {
        wrapper = createWrapper();
        await flushPromises();

        const focusedElement = wrapper.vm.$refs.container;
        const removeEventListenerSpy = jest.spyOn(focusedElement, 'removeEventListener');

        wrapper.vm.handleFocus();
        jest.advanceTimersByTime(200);
        const firstHandler = wrapper.vm.autoFocusCleanup.handler;

        wrapper.vm.handleFocus();
        jest.advanceTimersByTime(200);

        expect(removeEventListenerSpy).toHaveBeenCalledWith('blur', firstHandler);
        removeEventListenerSpy.mockRestore();
      });

      it('clears cleanup reference when blur event is fired and it matches current element', async () => {
        wrapper = createWrapper();
        await flushPromises();

        const focusedElement = wrapper.vm.$refs.container;

        wrapper.vm.handleFocus();
        jest.advanceTimersByTime(200);

        focusedElement.dispatchEvent(new Event('blur'));

        expect(wrapper.vm.autoFocusCleanup).toBeNull();
      });
    });

    describe('handleFocus() - Focus Invocation', () => {
      it('focuses element after 200ms deferral when called', async () => {
        wrapper = createWrapper();
        await flushPromises();

        const focusedElement = wrapper.vm.$refs.container;
        const focusSpy = jest.spyOn(focusedElement, 'focus');

        wrapper.vm.handleFocus();
        jest.advanceTimersByTime(200);

        expect(focusSpy).toHaveBeenCalledTimes(1);
        focusSpy.mockRestore();
      });
    });

    describe('themeLoading Watcher', () => {
      it('calls handleFocus when themeLoading changes from true to false', async () => {
        wrapper = createWrapper({
          themeLoading: true,
        });
        await flushPromises();

        const handleFocusSpy = jest.spyOn(wrapper.vm, 'handleFocus');

        // Change themeLoading from true to false
        await wrapper.setProps({ themeLoading: false });
        await wrapper.vm.$nextTick();

        expect(handleFocusSpy).toHaveBeenCalled();
        handleFocusSpy.mockRestore();
      });

      it('does not call handleFocus when themeLoading changes from false to true', async () => {
        wrapper = createWrapper({
          themeLoading: false,
        });
        await flushPromises();

        const handleFocusSpy = jest.spyOn(wrapper.vm, 'handleFocus');

        // Change themeLoading from false to true
        await wrapper.setProps({ themeLoading: true });
        await wrapper.vm.$nextTick();

        expect(handleFocusSpy).not.toHaveBeenCalled();
        handleFocusSpy.mockRestore();
      });

      it('does not call handleFocus when themeLoading changes between false values', async () => {
        wrapper = createWrapper({
          themeLoading: false,
        });
        await flushPromises();

        const handleFocusSpy = jest.spyOn(wrapper.vm, 'handleFocus');

        // Change from false to false (no change)
        await wrapper.setProps({ themeLoading: false });
        await wrapper.vm.$nextTick();

        expect(handleFocusSpy).not.toHaveBeenCalled();
        handleFocusSpy.mockRestore();
      });
    });

    describe('Theater Mode focus', () => {
      it('focuses callbackMain when journeyFocusElement is "content" in Theater Mode', async () => {
        wrapper = createWrapper({
          journeyTheaterMode: true,
          journeyLayout: 'justified-left',
          journeyFocusElement: 'content',
        });
        await flushPromises();

        const focusSpy = jest.fn();
        wrapper.vm.$refs.callbackMain.focus = focusSpy;

        wrapper.vm.handleFocus();
        jest.advanceTimersByTime(200);

        expect(focusSpy).toHaveBeenCalled();
      });

      it('focuses callbackMain when journeyFocusElement is "headerFirstStep" and NOT on first step in Theater Mode', async () => {
        wrapper = createWrapper({
          journeyTheaterMode: true,
          journeyLayout: 'justified-left',
          journeyFocusElement: 'headerFirstStep',
        });
        await flushPromises();

        wrapper.vm.isFirstStep = false;

        const focusSpy = jest.fn();
        wrapper.vm.$refs.callbackMain.focus = focusSpy;

        wrapper.vm.handleFocus();
        jest.advanceTimersByTime(200);

        expect(focusSpy).toHaveBeenCalled();
      });

      it('does not focus the header container when journeyFocusElement is "content" even when header is rendered (IAM-9023 / IAM-9434 regression guard)', async () => {
        wrapper = createWrapper({
          journeyTheaterMode: false,
          journeyLayout: 'card',
          journeyFocusElement: 'content',
          journeyHeaderEnabled: true,
          journeyHeader: '<a href="#">Header link</a>',
        });
        await flushPromises();

        wrapper.vm.isFirstStep = false;

        expect(wrapper.vm.$refs.callbackAppHeaderContainer).toBeTruthy();

        const headerFocusSpy = jest.fn();
        const mainFocusSpy = jest.fn();
        wrapper.vm.$refs.callbackAppHeaderContainer.focus = headerFocusSpy;
        wrapper.vm.$refs.main.focus = mainFocusSpy;

        wrapper.vm.handleFocus();
        jest.advanceTimersByTime(200);

        expect(headerFocusSpy).not.toHaveBeenCalled();
        expect(mainFocusSpy).toHaveBeenCalled();
      });
    });

    describe('themeLoading Watcher — first-step focus targets', () => {
      // All tests in this block exercise the real focus path end-to-end via the
      // themeLoading watcher rather than calling handleFocus() directly.
      // Sequence:
      //   1. Mount with themeLoading: true so the watcher does not fire on setup.
      //   2. Confirm isFirstStep is true (the data() default — not overridden).
      //   3. Install focus spies on the expected target ref.
      //   4. setProps({ themeLoading: false }) → triggers watcher.
      //   5. await $nextTick() → flushes the $nextTick deferral inside the watcher.
      //   6. jest.advanceTimersByTime(200) → fires the setTimeout inside handleFocus().
      //   7. Assert the correct ref received focus.

      it('first step, card layout, journeyFocusElement "content" — focuses $refs.main via watcher', async () => {
        wrapper = createWrapper({
          themeLoading: true,
          journeyFocusElement: 'content',
        });
        await flushPromises();

        expect(wrapper.vm.isFirstStep).toBe(true);

        const focusSpy = jest.fn();
        wrapper.vm.$refs.main.focus = focusSpy;

        await wrapper.setProps({ themeLoading: false });
        await wrapper.vm.$nextTick();
        jest.advanceTimersByTime(200);

        expect(focusSpy).toHaveBeenCalled();
      });

      it('first step, card layout, journeyFocusElement "" — focuses header/container ref via watcher', async () => {
        wrapper = createWrapper({
          themeLoading: true,
          journeyFocusElement: '',
        });
        await flushPromises();

        expect(wrapper.vm.isFirstStep).toBe(true);

        const focusSpy = jest.fn();
        if (wrapper.vm.$refs.callbackAppHeaderContainer) {
          wrapper.vm.$refs.callbackAppHeaderContainer.focus = focusSpy;
        } else {
          wrapper.vm.$refs.container.focus = focusSpy;
        }

        await wrapper.setProps({ themeLoading: false });
        await wrapper.vm.$nextTick();
        jest.advanceTimersByTime(200);

        expect(focusSpy).toHaveBeenCalled();
      });

      it('first step, card layout, journeyFocusElement "headerFirstStep" — isFirstStep true — focuses header/container ref via watcher', async () => {
        wrapper = createWrapper({
          themeLoading: true,
          journeyFocusElement: 'headerFirstStep',
        });
        await flushPromises();

        // Confirm isFirstStep is true (the data() default) — not explicitly overridden
        expect(wrapper.vm.isFirstStep).toBe(true);

        const focusSpy = jest.fn();
        if (wrapper.vm.$refs.callbackAppHeaderContainer) {
          wrapper.vm.$refs.callbackAppHeaderContainer.focus = focusSpy;
        } else {
          wrapper.vm.$refs.container.focus = focusSpy;
        }

        await wrapper.setProps({ themeLoading: false });
        await wrapper.vm.$nextTick();
        jest.advanceTimersByTime(200);

        expect(focusSpy).toHaveBeenCalled();
      });

      it('first step, Theater Mode, journeyFocusElement "content" — focuses $refs.callbackMain via watcher', async () => {
        wrapper = createWrapper({
          themeLoading: true,
          journeyTheaterMode: true,
          journeyLayout: 'justified-left',
          journeyFocusElement: 'content',
        });
        await flushPromises();

        expect(wrapper.vm.isFirstStep).toBe(true);

        const focusSpy = jest.fn();
        wrapper.vm.$refs.callbackMain.focus = focusSpy;

        await wrapper.setProps({ themeLoading: false });
        await wrapper.vm.$nextTick();
        jest.advanceTimersByTime(200);

        expect(focusSpy).toHaveBeenCalled();
      });

      it('first step, Theater Mode, journeyFocusElement "" — focuses header/container ref via watcher', async () => {
        wrapper = createWrapper({
          themeLoading: true,
          journeyTheaterMode: true,
          journeyLayout: 'justified-left',
          journeyFocusElement: '',
        });
        await flushPromises();

        expect(wrapper.vm.isFirstStep).toBe(true);

        const focusSpy = jest.fn();
        if (wrapper.vm.$refs.callbackAppHeaderContainer) {
          wrapper.vm.$refs.callbackAppHeaderContainer.focus = focusSpy;
        } else {
          wrapper.vm.$refs.container.focus = focusSpy;
        }

        await wrapper.setProps({ themeLoading: false });
        await wrapper.vm.$nextTick();
        jest.advanceTimersByTime(200);

        expect(focusSpy).toHaveBeenCalled();
      });

      it('first step, Theater Mode, journeyFocusElement "headerFirstStep" — isFirstStep true — focuses header/container ref via watcher', async () => {
        wrapper = createWrapper({
          themeLoading: true,
          journeyTheaterMode: true,
          journeyLayout: 'justified-left',
          journeyFocusElement: 'headerFirstStep',
        });
        await flushPromises();

        // Confirm isFirstStep is true (the data() default) — not explicitly overridden
        expect(wrapper.vm.isFirstStep).toBe(true);

        const focusSpy = jest.fn();
        if (wrapper.vm.$refs.callbackAppHeaderContainer) {
          wrapper.vm.$refs.callbackAppHeaderContainer.focus = focusSpy;
        } else {
          wrapper.vm.$refs.container.focus = focusSpy;
        }

        await wrapper.setProps({ themeLoading: false });
        await wrapper.vm.$nextTick();
        jest.advanceTimersByTime(200);

        expect(focusSpy).toHaveBeenCalled();
      });
    });

    describe('focusFirstInputAfterLoginFailure()', () => {
      it('returns the first visible input via fallback selector when no named component exists', async () => {
        wrapper = createWrapper();
        await flushPromises();
        await wrapper.setData({ componentList: [] });

        const mockInput = { focus: jest.fn() };
        const querySelectorSpy = jest.spyOn(wrapper.vm.$el, 'querySelector').mockReturnValue(mockInput);

        const result = await wrapper.vm.focusFirstInputAfterLoginFailure();

        expect(querySelectorSpy).toHaveBeenCalledWith(
          '#wrapper input:not([type="hidden"]):not([hidden]):not([disabled]):not([readonly])',
        );
        expect(result).toBe(mockInput);
        querySelectorSpy.mockRestore();
      });

      it('returns input by component name so describedbyId and focus target are always the same element', async () => {
        wrapper = createWrapper();
        await flushPromises();

        await wrapper.setData({
          componentList: [
            { type: 'FrField', callbackSpecificProps: { label: 'Username', name: 'callback_0' } },
          ],
        });

        const mockInput = { focus: jest.fn() };
        const querySelectorSpy = jest.spyOn(wrapper.vm.$el, 'querySelector').mockReturnValue(mockInput);

        const result = await wrapper.vm.focusFirstInputAfterLoginFailure();

        expect(querySelectorSpy).toHaveBeenCalledWith('[name="callback_0"]');
        expect(result).toBe(mockInput);
        querySelectorSpy.mockRestore();
      });

      it('does not throw when no input is found in the form', async () => {
        wrapper = createWrapper();
        await flushPromises();

        const querySelectorSpy = jest.spyOn(wrapper.vm.$el, 'querySelector').mockReturnValue(null);

        expect(() => {
          wrapper.vm.focusFirstInputAfterLoginFailure();
        }).not.toThrow();
        querySelectorSpy.mockRestore();
      });

      it('sets describedbyId on the first FrField component to link it to the error alert', async () => {
        wrapper = createWrapper();
        await flushPromises();

        await wrapper.setData({
          componentList: [
            { type: 'FrField', callbackSpecificProps: { label: 'Username', name: 'username' } },
            { type: 'FrPasswordCallback', callbackSpecificProps: { label: 'Password', name: 'password' } },
          ],
        });

        const querySelectorSpy = jest.spyOn(wrapper.vm.$el, 'querySelector').mockReturnValue({ focus: jest.fn() });

        wrapper.vm.focusFirstInputAfterLoginFailure();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.componentList[0].callbackSpecificProps.describedbyId).toBe('loginFailureAlert');
        expect(wrapper.vm.componentList[1].callbackSpecificProps.describedbyId).toBeUndefined();
        querySelectorSpy.mockRestore();
      });

      it('sets describedbyId on the first FrPasswordCallback when it appears before FrField', async () => {
        wrapper = createWrapper();
        await flushPromises();

        await wrapper.setData({
          componentList: [
            { type: 'FrPasswordCallback', callbackSpecificProps: { label: 'Password', name: 'password' } },
          ],
        });

        const querySelectorSpy = jest.spyOn(wrapper.vm.$el, 'querySelector').mockReturnValue({ focus: jest.fn() });

        wrapper.vm.focusFirstInputAfterLoginFailure();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.componentList[0].callbackSpecificProps.describedbyId).toBe('loginFailureAlert');
        querySelectorSpy.mockRestore();
      });

      it('does not set describedbyId when componentList has no text input callbacks', async () => {
        wrapper = createWrapper();
        await flushPromises();

        await wrapper.setData({ componentList: [] });

        const querySelectorSpy = jest.spyOn(wrapper.vm.$el, 'querySelector').mockReturnValue(null);

        wrapper.vm.focusFirstInputAfterLoginFailure();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.componentList).toHaveLength(0);
        querySelectorSpy.mockRestore();
      });

      it('preserves existing callbackSpecificProps when setting describedbyId', async () => {
        wrapper = createWrapper();
        await flushPromises();

        await wrapper.setData({
          componentList: [
            { type: 'FrField', callbackSpecificProps: { label: 'Username', name: 'username', value: 'testuser' } },
          ],
        });

        const querySelectorSpy = jest.spyOn(wrapper.vm.$el, 'querySelector').mockReturnValue({ focus: jest.fn() });

        wrapper.vm.focusFirstInputAfterLoginFailure();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.componentList[0].callbackSpecificProps).toEqual({
          label: 'Username',
          name: 'username',
          value: 'testuser',
          describedbyId: 'loginFailureAlert',
        });
        querySelectorSpy.mockRestore();
      });
    });

    describe('focusFirstInvalidField()', () => {
      it('does nothing when no component has errors', async () => {
        wrapper = createWrapper();
        await flushPromises();

        await wrapper.setData({
          componentList: [
            { type: 'FrField', callbackSpecificProps: { name: 'callback_0', errors: [] } },
          ],
        });

        const querySelectorSpy = jest.spyOn(wrapper.vm.$el, 'querySelector');

        wrapper.vm.focusFirstInvalidField();
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(querySelectorSpy).not.toHaveBeenCalled();
        querySelectorSpy.mockRestore();
      });

      it('returns the input matched by the error component name', async () => {
        wrapper = createWrapper();
        await flushPromises();

        await wrapper.setData({
          componentList: [
            { type: 'FrField', callbackSpecificProps: { name: 'callback_2', errors: ['Has to match pattern'] } },
          ],
        });

        const mockInput = { focus: jest.fn() };
        const querySelectorSpy = jest.spyOn(wrapper.vm.$el, 'querySelector').mockReturnValue(mockInput);

        const result = await wrapper.vm.focusFirstInvalidField();

        expect(querySelectorSpy).toHaveBeenCalledWith('[name="callback_2"]');
        expect(result).toBe(mockInput);
        querySelectorSpy.mockRestore();
      });

      it('falls back to aria-invalid selector when name-based query returns null', async () => {
        wrapper = createWrapper();
        await flushPromises();

        await wrapper.setData({
          componentList: [
            { type: 'FrField', callbackSpecificProps: { name: 'callback_2', errors: ['error'] } },
          ],
        });

        const mockInput = { focus: jest.fn() };
        const querySelectorSpy = jest.spyOn(wrapper.vm.$el, 'querySelector')
          .mockImplementation((selector) => {
            if (selector === '[name="callback_2"]') return null;
            return mockInput;
          });

        const result = await wrapper.vm.focusFirstInvalidField();

        expect(querySelectorSpy).toHaveBeenCalledWith('#wrapper input[aria-invalid="true"]:not([type="hidden"]):not([disabled]):not([readonly])');
        expect(result).toBe(mockInput);
        querySelectorSpy.mockRestore();
      });

      it('does not throw when both selectors return null', async () => {
        wrapper = createWrapper();
        await flushPromises();

        await wrapper.setData({
          componentList: [
            { type: 'FrField', callbackSpecificProps: { name: 'callback_2', errors: ['error'] } },
          ],
        });

        const querySelectorSpy = jest.spyOn(wrapper.vm.$el, 'querySelector').mockReturnValue(null);

        try {
          wrapper.vm.focusFirstInvalidField();
          await wrapper.vm.$nextTick();
          await wrapper.vm.$nextTick();
        } finally {
          querySelectorSpy.mockRestore();
        }
      });
    });

    describe('handleFocus() - inline error and loginFailure guards', () => {
      it('calls focusFirstInvalidField instead of container focus when componentList has errors', async () => {
        wrapper = createWrapper();
        await flushPromises();

        await wrapper.setData({
          componentList: [
            { type: 'FrField', callbackSpecificProps: { name: 'callback_2', errors: ['Has to match pattern'] } },
          ],
        });

        const focusFirstInvalidFieldSpy = jest.spyOn(wrapper.vm, 'focusFirstInvalidField').mockImplementation(() => {});
        const containerFocusSpy = jest.spyOn(wrapper.vm.$refs.container, 'focus');

        wrapper.vm.handleFocus();

        expect(focusFirstInvalidFieldSpy).toHaveBeenCalled();
        expect(containerFocusSpy).not.toHaveBeenCalled();
        focusFirstInvalidFieldSpy.mockRestore();
        containerFocusSpy.mockRestore();
      });

      it('calls focusFirstInputAfterLoginFailure instead of container focus for a non-empty login failure', async () => {
        wrapper = createWrapper();
        await flushPromises();

        await wrapper.setData({ loginFailure: true, errorMessage: 'AUTHN002' });

        const focusFirstInputSpy = jest.spyOn(wrapper.vm, 'focusFirstInputAfterLoginFailure').mockImplementation(() => {});
        const containerFocusSpy = jest.spyOn(wrapper.vm.$refs.container, 'focus');

        wrapper.vm.handleFocus();

        expect(focusFirstInputSpy).toHaveBeenCalled();
        expect(containerFocusSpy).not.toHaveBeenCalled();
        focusFirstInputSpy.mockRestore();
        containerFocusSpy.mockRestore();
      });

      it('uses normal container focus without an ARIA error reference when loginFailure has no message', async () => {
        wrapper = createWrapper();
        await flushPromises();

        await wrapper.setData({
          loginFailure: true,
          errorMessage: '',
          componentList: [
            { type: 'FrField', callbackSpecificProps: { name: 'callback_0' } },
          ],
        });

        const focusFirstInputSpy = jest.spyOn(wrapper.vm, 'focusFirstInputAfterLoginFailure');
        const containerFocusSpy = jest.spyOn(wrapper.vm.$refs.container, 'focus');

        wrapper.vm.handleFocus();
        jest.advanceTimersByTime(200);
        await wrapper.vm.$nextTick();

        expect(focusFirstInputSpy).not.toHaveBeenCalled();
        expect(containerFocusSpy).toHaveBeenCalled();
        expect(document.activeElement).toBe(wrapper.vm.$refs.container);
        expect(wrapper.vm.componentList[0].callbackSpecificProps.describedbyId).toBeUndefined();
        focusFirstInputSpy.mockRestore();
        containerFocusSpy.mockRestore();
      });

      it('focuses container normally when there are no errors and no loginFailure', async () => {
        wrapper = createWrapper();
        await flushPromises();

        await wrapper.setData({ loginFailure: false, componentList: [] });

        const containerFocusSpy = jest.spyOn(wrapper.vm.$refs.container, 'focus');

        wrapper.vm.handleFocus();
        jest.advanceTimersByTime(200);

        expect(containerFocusSpy).toHaveBeenCalled();
        containerFocusSpy.mockRestore();
      });

      it('falls back to container focus after 200ms when focusFirstInvalidField returns null', async () => {
        wrapper = createWrapper();
        await flushPromises();

        await wrapper.setData({
          componentList: [
            { type: 'FrField', callbackSpecificProps: { name: 'callback_2', errors: ['error'] } },
          ],
        });

        const focusFirstInvalidFieldSpy = jest.spyOn(wrapper.vm, 'focusFirstInvalidField').mockResolvedValue(null);
        const containerFocusSpy = jest.spyOn(wrapper.vm.$refs.container, 'focus');

        wrapper.vm.handleFocus();
        await wrapper.vm.$nextTick();
        jest.advanceTimersByTime(200);

        expect(focusFirstInvalidFieldSpy).toHaveBeenCalled();
        expect(containerFocusSpy).toHaveBeenCalled();
        focusFirstInvalidFieldSpy.mockRestore();
        containerFocusSpy.mockRestore();
      });

      it('falls back to container focus after 200ms when focusFirstInputAfterLoginFailure returns null', async () => {
        wrapper = createWrapper();
        await flushPromises();

        await wrapper.setData({ loginFailure: true, errorMessage: 'AUTHN002' });

        const focusFirstInputSpy = jest.spyOn(wrapper.vm, 'focusFirstInputAfterLoginFailure').mockResolvedValue(null);
        const containerFocusSpy = jest.spyOn(wrapper.vm.$refs.container, 'focus');

        wrapper.vm.handleFocus();
        await wrapper.vm.$nextTick();
        jest.advanceTimersByTime(200);

        expect(focusFirstInputSpy).toHaveBeenCalled();
        expect(containerFocusSpy).toHaveBeenCalled();
        focusFirstInputSpy.mockRestore();
        containerFocusSpy.mockRestore();
      });

      it('cancels a pending normal-path timer when a subsequent error-path handleFocus fires', async () => {
        // Simulates the race: themeLoading watcher fires handleFocus() before
        // loginFailure is set (schedules setTimeout 200ms), then loginFailure
        // handleFocus() fires and focuses the username field. The 200ms timer
        // must not override that focus when it eventually fires.
        wrapper = createWrapper({ journeyFocusElement: '' });
        await flushPromises();

        // First call: normal path (loginFailure still false) — schedules timer
        wrapper.vm.handleFocus();

        // Second call: loginFailure is now true — should cancel the timer and focus username
        const mockInput = document.createElement('input');
        const inputFocusSpy = jest.spyOn(mockInput, 'focus');
        await wrapper.setData({ loginFailure: true, errorMessage: 'AUTHN002' });
        const focusFirstInputSpy = jest.spyOn(wrapper.vm, 'focusFirstInputAfterLoginFailure').mockResolvedValue(mockInput);
        const containerFocusSpy = jest.spyOn(wrapper.vm.$refs.container, 'focus');

        await wrapper.vm.handleFocus();

        // Advance past the 200ms timer — container must not receive focus
        jest.advanceTimersByTime(200);

        expect(inputFocusSpy).toHaveBeenCalled();
        expect(containerFocusSpy).not.toHaveBeenCalled();
        focusFirstInputSpy.mockRestore();
        containerFocusSpy.mockRestore();
      });
    });
  });
});
