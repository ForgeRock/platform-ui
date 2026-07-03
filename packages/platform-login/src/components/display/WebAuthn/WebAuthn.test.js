/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { WebAuthnStepType } from '@forgerock/journey-client/webauthn';
import WebAuthn from './index';

jest.mock('@forgerock/journey-client', () => ({
  callbackType: {
    MetadataCallback: 'MetadataCallback',
    ConfirmationCallback: 'ConfirmationCallback',
    HiddenValueCallback: 'HiddenValueCallback',
  },
}));

jest.mock('@forgerock/journey-client/webauthn', () => ({
  WebAuthnStepType: {
    None: 0,
    Authentication: 1,
    Registration: 2,
  },
  WebAuthn: {
    register: jest.fn(),
    authenticate: jest.fn(),
    getWebAuthnStepType: jest.fn(),
    getMetadataCallback: jest.fn(),
    getOutcomeCallback: jest.fn(),
    createAuthenticationPublicKey: jest.fn().mockReturnValue({}),
    getAuthenticationCredential: jest.fn().mockResolvedValue({
      id: 'mock-credential-id',
      authenticatorAttachment: 'platform',
      response: {},
    }),
    getAuthenticationOutcome: jest.fn().mockReturnValue('outcome::data::sig::id'),
  },
}));

describe('WebAuthn.vue', () => {
  let wrapper;
  const { WebAuthn: WebAuthnMock } = jest.requireMock('@forgerock/journey-client/webauthn');
  const mockStep = {
    getCallbacksOfType: jest.fn().mockReturnValue([]),
  };

  const setup = (props) => {
    wrapper = shallowMount(WebAuthn, {
      global: {
        stubs: {
          FrSpinner: true,
          FrButtonWithSpinner: {
            name: 'FrButtonWithSpinner',
            template: '<button class="fr-button-with-spinner-stub" @click="$emit(\'click\', $event)"></button>',
            props: ['buttonText'],
          },
          FrHorizontalRule: true,
        },
        mocks: {
          $t: (key) => key,
        },
      },
      props: {
        step: mockStep,
        webAuthnPromiseFunction: jest.fn().mockReturnValue(Promise.resolve()),
        webAuthnType: WebAuthnStepType.Authentication,
        hasDivider: false,
        ...props,
      },
    });
  };

  it('renders spinner and header when not in conditional mediation', () => {
    setup();
    expect(wrapper.find('fr-spinner-stub').exists()).toBe(true);
    expect(wrapper.find('h5').text()).toBe('login.webAuthn.authenticate');
  });

  it('hides spinner and header when in conditional mediation', () => {
    const conditionalStep = {
      getCallbacksOfType: jest.fn().mockReturnValue([{
        getOutputValue: () => ({ _action: 'webauthn_authentication', mediation: 'conditional' }),
      }]),
    };
    setup({ step: conditionalStep });
    expect(wrapper.find('fr-spinner-stub').exists()).toBe(false);
    expect(wrapper.find('h5').exists()).toBe(false);
  });

  it('renders manual button when enabled in conditional mediation', () => {
    const manualButtonStep = {
      getCallbacksOfType: jest.fn().mockReturnValue([{
        getOutputValue: () => ({
          _action: 'webauthn_authentication',
          mediation: 'conditional',
          manualButtonEnabled: true,
        }),
      }]),
    };
    // Production code performs an inline browser-feature check
    // (`!!window.PublicKeyCredential`), so stub the global directly.
    Object.defineProperty(window, 'PublicKeyCredential', {
      configurable: true,
      value: function PublicKeyCredentialStub() {},
    });
    setup({ step: manualButtonStep });

    const manualButton = wrapper.find('.fr-button-with-spinner-stub');
    expect(manualButton.exists()).toBe(true);
    // Props are available on the stub component
    expect(wrapper.findComponent({ name: 'FrButtonWithSpinner' }).props('buttonText')).toBe('login.webAuthn.usePasskey');
  });

  it('uses lower-level WebAuthn methods with mediation required when manual button is clicked', async () => {
    const mockMetadata = {
      _action: 'webauthn_authentication',
      mediation: 'conditional',
      manualButtonEnabled: true,
      supportsJsonResponse: false,
    };
    const mockSetInputValue = jest.fn();
    WebAuthnMock.getMetadataCallback.mockReturnValue({
      getOutputValue: () => mockMetadata,
    });
    WebAuthnMock.getOutcomeCallback.mockReturnValue({ setInputValue: mockSetInputValue });

    const manualButtonStep = {
      getCallbacksOfType: jest.fn().mockReturnValue([{
        getOutputValue: () => mockMetadata,
      }]),
    };
    setup({ step: manualButtonStep });

    const manualButton = wrapper.find('.fr-button-with-spinner-stub');
    await manualButton.trigger('click', { preventDefault: jest.fn() });
    await Promise.resolve();
    await Promise.resolve();

    expect(WebAuthnMock.createAuthenticationPublicKey).toHaveBeenCalledWith(mockMetadata);
    expect(WebAuthnMock.getAuthenticationCredential).toHaveBeenCalledWith({}, 'required');
    expect(mockSetInputValue).toHaveBeenCalledWith('outcome::data::sig::id');
    expect(wrapper.emitted('next-step')).toBeTruthy();
  });

  it('uses JSON outcome format when supportsJsonResponse is true', async () => {
    const mockMetadata = {
      _action: 'webauthn_authentication',
      mediation: 'conditional',
      manualButtonEnabled: true,
      supportsJsonResponse: true,
    };
    const mockSetInputValue = jest.fn();
    WebAuthnMock.getMetadataCallback.mockReturnValue({
      getOutputValue: () => mockMetadata,
    });
    WebAuthnMock.getOutcomeCallback.mockReturnValue({ setInputValue: mockSetInputValue });

    const manualButtonStep = {
      getCallbacksOfType: jest.fn().mockReturnValue([{
        getOutputValue: () => mockMetadata,
      }]),
    };
    setup({ step: manualButtonStep });

    const manualButton = wrapper.find('.fr-button-with-spinner-stub');
    await manualButton.trigger('click', { preventDefault: jest.fn() });
    await Promise.resolve();
    await Promise.resolve();

    expect(mockSetInputValue).toHaveBeenCalledWith(JSON.stringify({
      authenticatorAttachment: 'platform',
      legacyData: 'outcome::data::sig::id',
    }));
    expect(wrapper.emitted('next-step')).toBeTruthy();
  });

  it('renders divider when hasDivider is true and manual button is shown', () => {
    const manualButtonStep = {
      getCallbacksOfType: jest.fn().mockReturnValue([{
        getOutputValue: () => ({
          _action: 'webauthn_authentication',
          mediation: 'conditional',
          manualButtonEnabled: true,
        }),
      }]),
    };
    setup({ step: manualButtonStep, hasDivider: true });
    expect(wrapper.find('fr-horizontal-rule-stub').exists()).toBe(true);
  });

  it('emits next-step after asScript webAuthnPromiseFunction resolves', async () => {
    // Simulate an asScript step: a webAuthnPromiseFunction that resolves
    // (as authenticateWithAsScript would).
    const asScriptPromiseFunction = jest.fn().mockReturnValue(Promise.resolve());
    setup({
      step: mockStep,
      webAuthnPromiseFunction: asScriptPromiseFunction,
      webAuthnType: WebAuthnStepType.Authentication,
    });

    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(asScriptPromiseFunction).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted('next-step')).toBeTruthy();
    expect(wrapper.emitted('next-step')).toHaveLength(1);
  });

  it('emits next-step when asScript webAuthnPromiseFunction rejects with no ConfirmationCallback', async () => {
    // Simulate an asScript credential failure: promise rejects.
    // mockStep.getCallbacksOfType returns [] by default (no ConfirmationCallback),
    // so the catch block should emit next-step.
    const asScriptErrorFunction = jest.fn().mockReturnValue(Promise.reject(new Error('NotAllowedError: operation failed')));
    setup({
      step: mockStep,
      webAuthnPromiseFunction: asScriptErrorFunction,
      webAuthnType: WebAuthnStepType.Authentication,
    });

    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(asScriptErrorFunction).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted('next-step')).toBeTruthy();
    expect(wrapper.emitted('next-step')).toHaveLength(1);
  });
});
