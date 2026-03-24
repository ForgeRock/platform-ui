/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
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
    // Checking for initial validation error by returning a failed policy and
    // ensuring the aria-invalid attribute is set correctly.
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

    // Checking that the validation has been cleared by returning an empty array of failed policies
    // and setting a value on the password field.
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

    // Clears the password field and returns the same failed policies and
    // ensures that the aria-invalid attribute is set to true.
    jest.spyOn(SDK.FRAuth, 'next').mockImplementation(() => Promise.resolve({
      getCallbackOfType: () => ({
        getFailedPolicies: () => ([
          '{ "policyRequirement": "LENGTH_BASED", "params": { "max-password-length": 0, "min-password-length": 8 } }',
          "{ \"policyRequirement\": \"CHARACTER_SET\", \"params\": { \"allow-unclassified-characters\": true, \"character-set-ranges\": [  ], \"character-sets\": [ \"1:0123456789\", \"1:ABCDEFGHIJKLMNOPQRSTUVWXYZ\", \"1:abcdefghijklmnopqrstuvwxyz\", \"1:~!@#$%^&*()-_=+[]{}|;:,.<>/?\\\"'\\\\`\" ], \"min-character-sets\": 0 } }",
        ]),
        setInputValue: () => {},
      }),
    }));
    await input.setValue('');
    await input.trigger('blur');

    expect(input.attributes('aria-invalid')).toBe('true');

    // We want to check that when setting the password value to the same previous value,
    // that the validation runs again and sets the aria-invalid attribute back to false.
    jest.spyOn(SDK.FRAuth, 'next').mockImplementation(() => Promise.resolve({
      getCallbackOfType: () => ({
        getFailedPolicies: () => ([]),
        setInputValue: () => {},
      }),
      payload: {
        authId: '1',
      },
    }));

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

  it('next-step-callback promise should resolve only after validation is fully complete with updated authId', async () => {
    jest.useFakeTimers();
    // Setup a controlled promise for the SDK call so we can decide when it "finishes"
    let resolveNext;
    const nextPromise = new Promise((resolve) => {
      resolveNext = resolve;
    });

    const step = {
      payload: {
        authId: 'old-auth-id',
      },
      getCallbackOfType: () => ({
        getFailedPolicies: () => ([]),
        setInputValue: () => ({}),
        getPolicies: () => ({ policies: [] }),
      }),
    };

    // Mock the SDK to return our controlled promise
    jest.spyOn(SDK.FRAuth, 'next').mockImplementation(() => nextPromise.then(() => ({
      getCallbackOfType: () => ({
        getFailedPolicies: () => ([]),
        setInputValue: () => ({}),
        getPolicies: () => ({ policies: [] }),
      }),
      payload: {
        authId: 'new-auth-id',
      },
    })));

    wrapper = mountComponent({
      callback: {
        getPrompt: () => 'Password',
        setValidateOnly: jest.fn(),
        setPassword: jest.fn(),
        getPolicies: () => ({ policies: [] }),
        getFailedPolicies: () => [],
      },
      step,
      realm: 'alpha',
    });

    // Trigger a password validation. This starts an asynchronous background request.
    wrapper.vm.updateCallback('newPassword123');
    wrapper.vm.debounceValidatePassword.flush();
    expect(wrapper.vm.isValidating).toBe(true);

    // Capture the "Gatekeeper" callback that Login/index.vue uses to wait for us.
    const nextStepEvent = wrapper.emitted('next-step-callback');
    const nextStepCallback = nextStepEvent[0][0];

    // Simulate Login/index.vue calling this gatekeeper.
    // It should return a promise that stays pending.
    let resolved = false;
    nextStepCallback().then(() => {
      resolved = true;
    });

    // Advance timers but the SDK call is still pending
    jest.advanceTimersByTime(100);
    await Promise.resolve(); // flush microtasks
    expect(resolved).toBe(false);
    expect(step.payload.authId).toBe('old-auth-id');

    // Finally resolve the SDK call (simulating a successful network response).
    resolveNext();

    // Run all pending timers and their associated microtasks (promises)
    // until the recursion terminates naturally.
    await jest.runAllTimersAsync();

    // Verify that the gatekeeper promise has finally resolved and the authId
    // on the step object has been updated via direct mutation.
    expect(resolved).toBe(true);
    expect(step.payload.authId).toBe('new-auth-id');
    jest.useRealTimers();
  });
});
