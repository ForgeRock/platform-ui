/**
 * Copyright (c) 2021-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount, shallowMount } from '@vue/test-utils';
import ReCaptchaCallback from '@/components/callbacks/ReCaptchaCallback';
import i18n from '@/i18n';

describe('ReCaptchaCallback.vue', () => {
  const createWrapper = (apiUrl, isV3) => shallowMount(ReCaptchaCallback, {
    global: {
      plugin: [i18n],
      stubs: {
        'router-link': true,
        FriendlyCaptchaV2: true,
        ReCaptchaV2: true,
        ReCaptchaV3: true,
      },
    },
    props: {
      callback: {
        getOutputByName: jest.fn((name) => {
          switch (name) {
            case 'captchaApiUri':
              return apiUrl;
            case 'reCaptchaV3':
              return isV3;
            default:
              return undefined;
          }
        }),
      },
    },
  });

  it('Sets data for ReCaptchaV3', () => {
    const wrapper = createWrapper('https://www.google.com/recaptcha/api.js', true);
    expect(wrapper.vm.$props.callback.getOutputByName).toHaveBeenCalled();
    expect(wrapper.vm.$data.reCaptchaComponentVersion).toBe('ReCaptchaV3');
  });

  it('Sets data for ReCaptchaV2', () => {
    const wrapper = createWrapper('https://www.google.com/recaptcha/api.js', false);
    expect(wrapper.vm.$props.callback.getOutputByName).toHaveBeenCalled();
    expect(wrapper.vm.$data.reCaptchaComponentVersion).toBe('ReCaptchaV2');
  });

  it('Sets data for HCaptchaV1', () => {
    const wrapper = createWrapper('https://hcaptcha.com/1/api.js', false);
    expect(wrapper.vm.$props.callback.getOutputByName).toHaveBeenCalled();
    expect(wrapper.vm.$data.reCaptchaComponentVersion).toBe('HCaptchaV1');
  });

  it('Sets data for FriendlyCaptchaV2 when the api uri is the FriendlyCaptcha SDK module', () => {
    const wrapper = createWrapper('https://cdn.jsdelivr.net/npm/@friendlycaptcha/sdk@1.0.1/site.min.js', false);
    expect(wrapper.vm.$props.callback.getOutputByName).toHaveBeenCalled();
    expect(wrapper.vm.$data.reCaptchaComponentVersion).toBe('FriendlyCaptchaV2');
  });

  it('Does not select FriendlyCaptchaV2 when the package marker is on an untrusted host', () => {
    const wrapper = createWrapper('https://evil.example.com/@friendlycaptcha/sdk/exploit.js', false);
    expect(wrapper.vm.$data.reCaptchaComponentVersion).toBeUndefined();
  });

  it('Selects no component when the api uri is missing', () => {
    const wrapper = createWrapper('', false);
    expect(wrapper.vm.$data.reCaptchaComponentVersion).toBeUndefined();
  });

  it('Selects no component and does not throw when the api uri is malformed', () => {
    expect(() => {
      const wrapper = createWrapper('recaptcha/api.js', false);
      expect(wrapper.vm.$data.reCaptchaComponentVersion).toBeUndefined();
    }).not.toThrow();
  });

  describe('resolves the selected captcha component', () => {
    // These cases fully mount (rather than shallow-mount) and flush the async component imports so the
    // dynamically-imported child component for each provider is actually resolved and rendered.
    let querySelectorSpy;
    let appendChildSpy;

    beforeEach(() => {
      // The child components inject the provider SDK <script> on creation; stub it out so the DOM work
      // does not run during these tests.
      querySelectorSpy = jest.spyOn(document, 'querySelector').mockReturnValue(null);
      appendChildSpy = jest.spyOn(document.head, 'appendChild').mockImplementation();
    });

    afterEach(() => {
      // Restore only our own spies; a blanket restoreAllMocks() would clobber global test-setup spies.
      querySelectorSpy.mockRestore();
      appendChildSpy.mockRestore();
    });

    const mountWrapper = (apiUrl, isV3) => mount(ReCaptchaCallback, {
      global: {
        plugins: [i18n],
        stubs: { 'router-link': true },
        mocks: {
          // Provided by the vue-recaptcha plugin in the app; stubbed so the reCAPTCHA v3 child renders.
          $loadVueRecaptcha: jest.fn(),
          $recaptchaLoaded: () => Promise.resolve(),
          $recaptcha: () => Promise.resolve('token'),
        },
      },
      props: {
        callback: {
          getSiteKey: jest.fn(() => 'siteKey'),
          getOutputByName: jest.fn((name, fallback) => {
            switch (name) {
              case 'captchaApiUri':
                return apiUrl;
              case 'reCaptchaV3':
                return isV3;
              default:
                return fallback;
            }
          }),
          setInputValue: jest.fn(),
        },
        index: 5,
      },
    });

    it.each([
      ['FriendlyCaptchaV2', 'https://cdn.jsdelivr.net/npm/@friendlycaptcha/sdk@1.0.1/site.min.js', false],
      ['HCaptchaV1', 'https://hcaptcha.com/1/api.js', false],
      ['ReCaptchaV2', 'https://www.google.com/recaptcha/api.js', false],
      ['ReCaptchaV3', 'https://www.google.com/recaptcha/api.js', true],
    ])('resolves and renders the %s component', async (expectedComponent, apiUrl, isV3) => {
      const wrapper = mountWrapper(apiUrl, isV3);
      await flushPromises();
      expect(wrapper.vm.$data.reCaptchaComponentVersion).toBe(expectedComponent);
      expect(wrapper.findComponent({ name: expectedComponent }).exists()).toBe(true);
    });
  });
});
