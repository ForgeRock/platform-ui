/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { FRWebAuthn, WebAuthnStepType } from '@forgerock/javascript-sdk';
import WebAuthn from './index';

jest.mock('@forgerock/javascript-sdk', () => ({
  CallbackType: {
    MetadataCallback: 'MetadataCallback',
    ConfirmationCallback: 'ConfirmationCallback',
    HiddenValueCallback: 'HiddenValueCallback',
  },
  WebAuthnStepType: {
    Authentication: 0,
    Registration: 1,
    None: 2,
  },
  WebAuthnOutcomeType: {
    NotSupportedError: 'NotSupportedError',
  },
  FRWebAuthn: {
    isWebAuthnSupported: jest.fn(),
  },
  FRStep: jest.fn(),
}));

describe('WebAuthn.vue', () => {
  let wrapper;
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
    FRWebAuthn.isWebAuthnSupported.mockReturnValue(true);
    setup({ step: manualButtonStep });

    const manualButton = wrapper.find('.fr-button-with-spinner-stub');
    expect(manualButton.exists()).toBe(true);
    // Props are available on the stub component
    expect(wrapper.findComponent({ name: 'FrButtonWithSpinner' }).props('buttonText')).toBe('login.webAuthn.usePasskey');
  });

  it('triggers invokeWebAuthnManual when manual button is clicked', async () => {
    const manualButtonStep = {
      getCallbacksOfType: jest.fn().mockReturnValue([{
        getOutputValue: () => ({
          _action: 'webauthn_authentication',
          mediation: 'conditional',
          manualButtonEnabled: true,
        }),
      }]),
    };
    const webAuthnPromiseFunction = jest.fn().mockReturnValue(Promise.resolve());
    setup({ step: manualButtonStep, webAuthnPromiseFunction });

    const manualButton = wrapper.find('.fr-button-with-spinner-stub');
    // Mock the preventDefault method on the event
    await manualButton.trigger('click', {
      preventDefault: jest.fn(),
    });

    // First call is from mounted(), second call is from manual button click
    expect(webAuthnPromiseFunction).toHaveBeenCalledTimes(2);
    const optionsTransformer = webAuthnPromiseFunction.mock.calls[1][0];
    const transformedOptions = optionsTransformer({ mediation: 'conditional' });
    expect(transformedOptions.mediation).toBe('required');
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
});
