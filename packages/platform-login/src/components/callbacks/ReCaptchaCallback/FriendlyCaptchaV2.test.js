/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { mockNotification } from '@forgerock/platform-shared/src/testing/utils/mockNotification';
import FriendlyCaptchaV2 from '@/components/callbacks/ReCaptchaCallback/FriendlyCaptchaV2';
import i18n from '@/i18n';

const API_URI = 'https://cdn.jsdelivr.net/npm/@friendlycaptcha/sdk@1.0.1/site.min.js';

describe('FriendlyCaptchaV2.vue', () => {
  let wrapper;
  let notifications;

  const setInputValue = jest.fn();

  const createWrapper = (outputs = {}) => mount(FriendlyCaptchaV2, {
    global: {
      plugins: [i18n],
    },
    props: {
      callback: {
        getSiteKey: jest.fn(() => 'siteKey'),
        getOutputByName: jest.fn((name, fallback) => {
          switch (name) {
            case 'captchaApiUri':
              return 'captchaApiUri' in outputs ? outputs.captchaApiUri : API_URI;
            case 'captchaDivClass':
              return outputs.captchaDivClass ?? fallback;
            default:
              return fallback;
          }
        }),
        setInputValue,
      },
      index: 5,
    },
  });

  beforeEach(() => {
    notifications = mockNotification();
    jest.spyOn(document, 'querySelector').mockReturnValue(null);
    jest.spyOn(document.head, 'appendChild').mockImplementation();
  });

  afterEach(() => {
    document.querySelector.mockRestore();
    document.head.appendChild.mockRestore();
    jest.clearAllMocks();
  });

  it('injects the FriendlyCaptcha SDK as an ES module script', () => {
    wrapper = createWrapper();
    const appendedScript = document.head.appendChild.mock.calls[0][0];
    expect(appendedScript.getAttribute('type')).toBe('module');
    expect(appendedScript.getAttribute('src')).toBe(API_URI);
  });

  it('does not inject the SDK script twice', () => {
    document.querySelector.mockReturnValue(document.createElement('script'));
    wrapper = createWrapper();
    expect(document.head.appendChild).not.toHaveBeenCalled();
  });

  it('does not inject a script and shows an error when the api uri is missing', () => {
    wrapper = createWrapper({ captchaApiUri: '' });
    expect(document.head.appendChild).not.toHaveBeenCalled();
    expect(wrapper.emitted('disable-next-button').at(-1)).toEqual([true]);
    expect(notifications.showErrorMessage).toHaveBeenCalled();
  });

  it('does not inject a script when the api uri is served from an untrusted origin', () => {
    wrapper = createWrapper({ captchaApiUri: 'https://evil.example.com/@friendlycaptcha/sdk/exploit.js' });
    expect(document.head.appendChild).not.toHaveBeenCalled();
  });

  it('removes the DOM event listeners when injection fails', () => {
    const removeSpy = jest.spyOn(document, 'removeEventListener');
    wrapper = createWrapper({ captchaApiUri: 'https://evil.example.com/@friendlycaptcha/sdk/exploit.js' });
    expect(removeSpy).toHaveBeenCalledWith('frc:widget.complete', wrapper.vm.handleCaptchaCallback, true);
    removeSpy.mockRestore();
  });

  it('uses the configured div class when provided, otherwise the default', () => {
    wrapper = createWrapper({ captchaDivClass: 'custom-frc' });
    expect(wrapper.vm.divClass).toBe('custom-frc');

    const defaultWrapper = createWrapper();
    expect(defaultWrapper.vm.divClass).toBe('frc-captcha');
  });

  it('disables the next button on creation', () => {
    wrapper = createWrapper();
    expect(wrapper.emitted('disable-next-button')[0]).toEqual([true]);
  });

  it('sets the callback response and enables the next button when the widget completes', () => {
    wrapper = createWrapper();
    wrapper.vm.handleCaptchaCallback({ detail: { response: 'a-solution' } });
    expect(setInputValue).toHaveBeenCalledWith('a-solution');
    expect(wrapper.emitted('disable-next-button').at(-1)).toEqual([false]);
  });

  it('shows an error and does not enable the next button when the complete event has no response', () => {
    wrapper = createWrapper();
    // A malformed event (missing detail/response) must not throw or enable the button
    expect(() => wrapper.vm.handleCaptchaCallback({})).not.toThrow();
    expect(setInputValue).not.toHaveBeenCalledWith('a-solution');
    expect(wrapper.emitted('disable-next-button').at(-1)).toEqual([true]);
    expect(notifications.showErrorMessage).toHaveBeenCalled();
  });

  it('clears the response and re-disables the next button when the widget expires', () => {
    wrapper = createWrapper();
    wrapper.vm.handleCaptchaExpired();
    expect(setInputValue).toHaveBeenCalledWith('');
    expect(wrapper.emitted('disable-next-button').at(-1)).toEqual([true]);
    expect(notifications.showErrorMessage).toHaveBeenCalled();
  });

  it('clears the response and re-disables the next button when the widget errors', () => {
    wrapper = createWrapper();
    wrapper.vm.handleCaptchaError();
    expect(setInputValue).toHaveBeenCalledWith('');
    expect(wrapper.emitted('disable-next-button').at(-1)).toEqual([true]);
    expect(notifications.showErrorMessage).toHaveBeenCalled();
  });

  it('clears the response and re-disables the next button when the widget is reset after completing', () => {
    wrapper = createWrapper();
    // Simulate the user completing the puzzle...
    wrapper.vm.handleCaptchaCallback({ detail: { response: 'a-solution' } });
    expect(wrapper.emitted('disable-next-button').at(-1)).toEqual([false]);

    // ...then pressing reset in the widget menu, which emits a statechange rather than expire/error.
    wrapper.vm.handleCaptchaStateChange({ detail: { state: 'reset' } });
    expect(setInputValue).toHaveBeenLastCalledWith('');
    expect(wrapper.emitted('disable-next-button').at(-1)).toEqual([true]);
  });

  it('does not reset when the widget transitions into the completed state', () => {
    wrapper = createWrapper();
    setInputValue.mockClear();
    wrapper.vm.handleCaptchaStateChange({ detail: { state: 'completed' } });
    expect(setInputValue).not.toHaveBeenCalled();
  });

  it('registers and removes the FriendlyCaptcha DOM event listeners', () => {
    const addSpy = jest.spyOn(document, 'addEventListener');
    const removeSpy = jest.spyOn(document, 'removeEventListener');
    wrapper = createWrapper();
    expect(addSpy).toHaveBeenCalledWith('frc:widget.complete', wrapper.vm.handleCaptchaCallback, true);
    expect(addSpy).toHaveBeenCalledWith('frc:widget.expire', wrapper.vm.handleCaptchaExpired, true);
    expect(addSpy).toHaveBeenCalledWith('frc:widget.error', wrapper.vm.handleCaptchaError, true);
    expect(addSpy).toHaveBeenCalledWith('frc:widget.statechange', wrapper.vm.handleCaptchaStateChange, true);

    wrapper.unmount();
    expect(removeSpy).toHaveBeenCalledWith('frc:widget.complete', wrapper.vm.handleCaptchaCallback, true);
    expect(removeSpy).toHaveBeenCalledWith('frc:widget.expire', wrapper.vm.handleCaptchaExpired, true);
    expect(removeSpy).toHaveBeenCalledWith('frc:widget.error', wrapper.vm.handleCaptchaError, true);
    expect(removeSpy).toHaveBeenCalledWith('frc:widget.statechange', wrapper.vm.handleCaptchaStateChange, true);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
