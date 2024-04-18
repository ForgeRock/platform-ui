/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import * as SDK from '@forgerock/javascript-sdk';
import ValidatedCreatePasswordCallback from './index';

jest.mock('@forgerock/javascript-sdk', () => ({
  FRAuth: { next: jest.fn() },
  CallbackType: { ValidatedCreatePasswordCallback: 'ValidatedCreatePasswordCallback' },
}));

describe('ValidatedCreatePasswordCallback', () => {
  let wrapper;

  function mountComponent(props) {
    return mount(ValidatedCreatePasswordCallback, {
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
      props,
    });
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('aria-invalid undefined if there is errors and the password field is not touched', async () => {
    jest.spyOn(SDK.FRAuth, 'next').mockImplementation(() => Promise.resolve({
      getCallbackOfType: () => ({
        getFailedPolicies: () => ([
          '{ "policyRequirement": "LENGTH_BASED", "params": { "max-password-length": 0, "min-password-length": 8 } }',
          "{ \"policyRequirement\": \"CHARACTER_SET\", \"params\": { \"allow-unclassified-characters\": true, \"character-set-ranges\": [  ], \"character-sets\": [ \"1:0123456789\", \"1:ABCDEFGHIJKLMNOPQRSTUVWXYZ\", \"1:abcdefghijklmnopqrstuvwxyz\", \"1:~!@#$%^&*()-_=+[]{}|;:,.<>/?\\\"'\\\\`\" ], \"min-character-sets\": 0 } }",
        ]),
        setInputValue: () => {},
      }),
    }));
    wrapper = mountComponent({
      callback: {
        getPrompt: () => 'Password',
        setValidateOnly: (value) => value,
      },
      step: {
        getCallbackOfType: () => ({
          setInputValue: () => true,
        }),
      },
      overrideInitialPolicies: true,
    });

    const input = wrapper.find('input[name="Password"]');

    expect(input.attributes('aria-invalid')).toBeUndefined();
  });

  it('aria-invalid true if there is errors and the password field is touched', async () => {
    jest.spyOn(SDK.FRAuth, 'next').mockImplementation(() => Promise.resolve({
      getCallbackOfType: () => ({
        getFailedPolicies: () => ([
          '{ "policyRequirement": "LENGTH_BASED", "params": { "max-password-length": 0, "min-password-length": 8 } }',
          "{ \"policyRequirement\": \"CHARACTER_SET\", \"params\": { \"allow-unclassified-characters\": true, \"character-set-ranges\": [  ], \"character-sets\": [ \"1:0123456789\", \"1:ABCDEFGHIJKLMNOPQRSTUVWXYZ\", \"1:abcdefghijklmnopqrstuvwxyz\", \"1:~!@#$%^&*()-_=+[]{}|;:,.<>/?\\\"'\\\\`\" ], \"min-character-sets\": 0 } }",
        ]),
        setInputValue: () => {},
      }),
    }));
    wrapper = mountComponent({
      callback: {
        getPrompt: () => 'Password',
        setValidateOnly: (value) => value,
      },
      step: {
        getCallbackOfType: () => ({
          setInputValue: () => true,
        }),
      },
      overrideInitialPolicies: true,
    });

    const input = wrapper.find('input[name="Password"]');
    await input.trigger('blur');

    expect(input.attributes('aria-invalid')).toBe('true');
  });

  it('aria-invalid false if there is no errors and the password field is touched', async () => {
    jest.spyOn(SDK.FRAuth, 'next').mockImplementation(() => Promise.resolve({
      getCallbackOfType: () => ({
        getFailedPolicies: () => ([
          '{ "policyRequirement": "LENGTH_BASED", "params": { "max-password-length": 0, "min-password-length": 8 } }',
          "{ \"policyRequirement\": \"CHARACTER_SET\", \"params\": { \"allow-unclassified-characters\": true, \"character-set-ranges\": [  ], \"character-sets\": [ \"1:0123456789\", \"1:ABCDEFGHIJKLMNOPQRSTUVWXYZ\", \"1:abcdefghijklmnopqrstuvwxyz\", \"1:~!@#$%^&*()-_=+[]{}|;:,.<>/?\\\"'\\\\`\" ], \"min-character-sets\": 0 } }",
        ]),
        setInputValue: () => {},
      }),
    }));
    wrapper = mountComponent({
      callback: {
        getPrompt: () => 'Password',
        setValidateOnly: (value) => value,
        setPassword: (value) => value,
      },
      step: {
        getCallbackOfType: () => ({
          setInputValue: () => true,
        }),
      },
      overrideInitialPolicies: true,
    });

    const input = wrapper.find('input[name="Password"]');
    await input.trigger('blur');

    expect(input.attributes('aria-invalid')).toBe('true');

    jest.spyOn(SDK.FRAuth, 'next').mockImplementation(() => Promise.resolve({
      getCallbackOfType: () => ({
        getFailedPolicies: () => ([]),
        setInputValue: () => {},
      }),
      payload: {
        authId: '1',
      },
    }));

    wrapper.vm.debounceValidatePassword = wrapper.vm.validatePassword;
    await input.setValue('P4$$worD123456');
    await input.trigger('blur');

    expect(input.attributes('aria-invalid')).toBe('false');
  });

  it('aria-invalid false for confirm password field if it is not touched', async () => {
    jest.spyOn(SDK.FRAuth, 'next').mockImplementation(() => Promise.resolve({
      getCallbackOfType: () => ({
        getFailedPolicies: () => ([
          '{ "policyRequirement": "LENGTH_BASED", "params": { "max-password-length": 0, "min-password-length": 8 } }',
          "{ \"policyRequirement\": \"CHARACTER_SET\", \"params\": { \"allow-unclassified-characters\": true, \"character-set-ranges\": [  ], \"character-sets\": [ \"1:0123456789\", \"1:ABCDEFGHIJKLMNOPQRSTUVWXYZ\", \"1:abcdefghijklmnopqrstuvwxyz\", \"1:~!@#$%^&*()-_=+[]{}|;:,.<>/?\\\"'\\\\`\" ], \"min-character-sets\": 0 } }",
        ]),
        setInputValue: () => {},
      }),
    }));
    wrapper = mountComponent({
      callback: {
        getPrompt: () => 'Password',
        setValidateOnly: (value) => value,
        setPassword: (value) => value,
      },
      step: {
        getCallbackOfType: () => ({
          setInputValue: () => true,
        }),
      },
      overrideInitialPolicies: true,
      stage: {
        confirmPassword: true,
      },
    });

    const confirmInput = wrapper.find('input[name="login.password.confirmPassword"]');

    expect(confirmInput.attributes('aria-invalid')).toBeUndefined();
  });

  it('aria-invalid true for confirm password field if it is touched and the validation fails', async () => {
    jest.spyOn(SDK.FRAuth, 'next').mockImplementation(() => Promise.resolve({
      getCallbackOfType: () => ({
        getFailedPolicies: () => ([
          '{ "policyRequirement": "LENGTH_BASED", "params": { "max-password-length": 0, "min-password-length": 8 } }',
          "{ \"policyRequirement\": \"CHARACTER_SET\", \"params\": { \"allow-unclassified-characters\": true, \"character-set-ranges\": [  ], \"character-sets\": [ \"1:0123456789\", \"1:ABCDEFGHIJKLMNOPQRSTUVWXYZ\", \"1:abcdefghijklmnopqrstuvwxyz\", \"1:~!@#$%^&*()-_=+[]{}|;:,.<>/?\\\"'\\\\`\" ], \"min-character-sets\": 0 } }",
        ]),
        setInputValue: () => {},
      }),
    }));
    wrapper = mountComponent({
      callback: {
        getPrompt: () => 'Password',
        setValidateOnly: (value) => value,
        setPassword: (value) => value,
      },
      step: {
        getCallbackOfType: () => ({
          setInputValue: () => true,
        }),
      },
      overrideInitialPolicies: true,
      stage: {
        confirmPassword: true,
      },
    });

    jest.spyOn(SDK.FRAuth, 'next').mockImplementation(() => Promise.resolve({
      getCallbackOfType: () => ({
        getFailedPolicies: () => ([]),
        setInputValue: () => {},
      }),
      payload: {
        authId: '1',
      },
    }));

    wrapper.vm.debounceValidatePassword = wrapper.vm.validatePassword;
    const input = wrapper.find('input[name="Password"]');
    await input.setValue('P4$$worD123456');
    await input.trigger('blur');

    const confirmInput = wrapper.find('input[name="login.password.confirmPassword"]');
    await confirmInput.setValue('error');
    await confirmInput.trigger('blur');

    expect(confirmInput.attributes('aria-invalid')).toBe('true');
  });

  it('aria-invalid false for confirm password field if it is touched and value is correct', async () => {
    jest.spyOn(SDK.FRAuth, 'next').mockImplementation(() => Promise.resolve({
      getCallbackOfType: () => ({
        getFailedPolicies: () => ([
          '{ "policyRequirement": "LENGTH_BASED", "params": { "max-password-length": 0, "min-password-length": 8 } }',
          "{ \"policyRequirement\": \"CHARACTER_SET\", \"params\": { \"allow-unclassified-characters\": true, \"character-set-ranges\": [  ], \"character-sets\": [ \"1:0123456789\", \"1:ABCDEFGHIJKLMNOPQRSTUVWXYZ\", \"1:abcdefghijklmnopqrstuvwxyz\", \"1:~!@#$%^&*()-_=+[]{}|;:,.<>/?\\\"'\\\\`\" ], \"min-character-sets\": 0 } }",
        ]),
        setInputValue: () => {},
      }),
    }));
    wrapper = mountComponent({
      callback: {
        getPrompt: () => 'Password',
        setValidateOnly: (value) => value,
        setPassword: (value) => value,
      },
      step: {
        getCallbackOfType: () => ({
          setInputValue: () => true,
        }),
      },
      overrideInitialPolicies: true,
      stage: {
        confirmPassword: true,
      },
    });

    jest.spyOn(SDK.FRAuth, 'next').mockImplementation(() => Promise.resolve({
      getCallbackOfType: () => ({
        getFailedPolicies: () => ([]),
        setInputValue: () => {},
      }),
      payload: {
        authId: '1',
      },
    }));

    wrapper.vm.debounceValidatePassword = wrapper.vm.validatePassword;
    const input = wrapper.find('input[name="Password"]');
    await input.setValue('P4$$worD123456');
    await input.trigger('blur');

    const confirmInput = wrapper.find('input[name="login.password.confirmPassword"]');
    await confirmInput.setValue('P4$$worD123456');
    await confirmInput.trigger('blur');

    expect(confirmInput.attributes('aria-invalid')).toBe('false');
  });
});
