/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createJourneyStep } from '@forgerock/journey-client/_utils';

const makePayload = (overrides = {}) => ({
  authId: 'abc123',
  callbacks: [
    {
      type: 'MetadataCallback',
      output: [
        { name: 'data', value: { relyingPartyId: 'example.com', mediation: 'conditional' } },
        { name: 'extra', value: 'extraValue' },
      ],
      input: [],
    },
    {
      type: 'HiddenValueCallback',
      output: [
        { name: 'id', value: 'webAuthnOutcome' },
        { name: 'value', value: '' },
      ],
      input: [{ name: 'IDToken1', value: '' }],
    },
  ],
  ...overrides,
});

describe('createJourneyStep', () => {
  describe('getOutputValue', () => {
    it('returns value by name (string selector)', () => {
      const step = createJourneyStep(makePayload());
      const metaCb = step.getCallbacksOfType('MetadataCallback')[0];
      expect(metaCb.getOutputValue('data')).toEqual({ relyingPartyId: 'example.com', mediation: 'conditional' });
    });

    it('returns value by index (numeric selector)', () => {
      const step = createJourneyStep(makePayload());
      const metaCb = step.getCallbacksOfType('MetadataCallback')[0];
      expect(metaCb.getOutputValue(0)).toEqual({ relyingPartyId: 'example.com', mediation: 'conditional' });
      expect(metaCb.getOutputValue(1)).toBe('extraValue');
    });

    it('returns value by default index 0 when called with no arguments', () => {
      const step = createJourneyStep(makePayload());
      const metaCb = step.getCallbacksOfType('MetadataCallback')[0];
      expect(metaCb.getOutputValue()).toEqual({ relyingPartyId: 'example.com', mediation: 'conditional' });
    });

    it('throws for unknown name', () => {
      const step = createJourneyStep(makePayload());
      const metaCb = step.getCallbacksOfType('MetadataCallback')[0];
      expect(() => metaCb.getOutputValue('nonexistent')).toThrow();
    });

    it('throws for out-of-bounds index', () => {
      const step = createJourneyStep(makePayload());
      const metaCb = step.getCallbacksOfType('MetadataCallback')[0];
      expect(() => metaCb.getOutputValue(99)).toThrow();
    });
  });

  describe('getOutputByName', () => {
    it('returns value by name', () => {
      const step = createJourneyStep(makePayload());
      const metaCb = step.getCallbacksOfType('MetadataCallback')[0];
      expect(metaCb.getOutputByName('data', null)).toEqual({ relyingPartyId: 'example.com', mediation: 'conditional' });
    });

    it('returns defaultValue when name not found', () => {
      const step = createJourneyStep(makePayload());
      const metaCb = step.getCallbacksOfType('MetadataCallback')[0];
      expect(metaCb.getOutputByName('missing', 'fallback')).toBe('fallback');
    });
  });

  describe('setInputValue / getInputValue', () => {
    it('sets and reads back an input value', () => {
      const step = createJourneyStep(makePayload());
      const hiddenCb = step.getCallbacksOfType('HiddenValueCallback')[0];
      hiddenCb.setInputValue('assertionBase64==');
      expect(hiddenCb.getInputValue()).toBe('assertionBase64==');
    });
  });

  describe('getCallbacksOfType', () => {
    it('returns all callbacks matching the type', () => {
      const step = createJourneyStep(makePayload());
      expect(step.getCallbacksOfType('MetadataCallback')).toHaveLength(1);
      expect(step.getCallbacksOfType('HiddenValueCallback')).toHaveLength(1);
      expect(step.getCallbacksOfType('PasswordCallback')).toHaveLength(0);
    });
  });

  describe('PingOneProtectInitializeCallback', () => {
    const makeProtectPayload = (outputOverrides = []) => ({
      authId: 'abc123',
      callbacks: [
        {
          type: 'PingOneProtectInitializeCallback',
          output: [
            { name: 'envId', value: 'test-env-id' },
            { name: 'consoleLogEnabled', value: false },
            { name: 'deviceAttributesToIgnore', value: [] },
            { name: 'customHost', value: '' },
            { name: 'lazyMetadata', value: false },
            { name: 'behavioralDataCollection', value: true },
            { name: 'deviceKeyRsyncIntervals', value: 14 },
            { name: 'enableTrust', value: false },
            { name: 'disableTags', value: false },
            { name: 'disableHub', value: false },
            ...outputOverrides,
          ],
          input: [{ name: 'IDToken1clientError', value: '' }],
        },
      ],
    });

    it('getConfig() returns signalsInitializationOptions value when present as an object', () => {
      const sio = { envId: 'from-sio', customHost: 'example.com' };
      const payload = makeProtectPayload([{ name: 'signalsInitializationOptions', value: sio }]);
      const step = createJourneyStep(payload);
      const cb = step.getCallbacksOfType('PingOneProtectInitializeCallback')[0];
      // createJourneyStep structuredClones the payload, so reference equality is not guaranteed.
      expect(cb.getConfig()).toEqual(sio);
    });

    it('getConfig() builds config from individual output fields when signalsInitializationOptions is absent', () => {
      const step = createJourneyStep(makeProtectPayload());
      const cb = step.getCallbacksOfType('PingOneProtectInitializeCallback')[0];
      expect(cb.getConfig()).toEqual({
        envId: 'test-env-id',
        consoleLogEnabled: false,
        deviceAttributesToIgnore: [],
        customHost: '',
        lazyMetadata: false,
        behavioralDataCollection: true,
        deviceKeyRsyncIntervals: 14,
        enableTrust: false,
        disableTags: false,
        disableHub: false,
      });
    });

    it('getConfig() builds config from individual fields when signalsInitializationOptions is null', () => {
      const payload = makeProtectPayload([{ name: 'signalsInitializationOptions', value: null }]);
      const step = createJourneyStep(payload);
      const cb = step.getCallbacksOfType('PingOneProtectInitializeCallback')[0];
      expect(cb.getConfig()).toEqual(expect.objectContaining({ envId: 'test-env-id' }));
    });

    it('getConfig() builds config from individual fields when signalsInitializationOptions is an array', () => {
      const payload = makeProtectPayload([{ name: 'signalsInitializationOptions', value: [] }]);
      const step = createJourneyStep(payload);
      const cb = step.getCallbacksOfType('PingOneProtectInitializeCallback')[0];
      expect(cb.getConfig()).toEqual(expect.objectContaining({ envId: 'test-env-id' }));
    });

    it('getConfig() uses SDK defaults when output fields are absent', () => {
      const step = createJourneyStep({
        authId: 'abc',
        callbacks: [{ type: 'PingOneProtectInitializeCallback', output: [], input: [] }],
      });
      const cb = step.getCallbacksOfType('PingOneProtectInitializeCallback')[0];
      expect(cb.getConfig()).toEqual({
        envId: '',
        consoleLogEnabled: false,
        deviceAttributesToIgnore: [],
        customHost: '',
        lazyMetadata: false,
        behavioralDataCollection: true,
        deviceKeyRsyncIntervals: 14,
        enableTrust: false,
        disableTags: false,
        disableHub: false,
      });
    });

    it('setClientError() writes the error message to the clientError input entry', () => {
      const step = createJourneyStep(makeProtectPayload());
      const cb = step.getCallbacksOfType('PingOneProtectInitializeCallback')[0];
      cb.setClientError('something went wrong');
      expect(cb.getInputValue(0)).toBe('something went wrong');
    });

    it('setClientError() throws when no clientError input entry exists', () => {
      const step = createJourneyStep({
        authId: 'abc',
        callbacks: [{ type: 'PingOneProtectInitializeCallback', output: [], input: [] }],
      });
      const cb = step.getCallbacksOfType('PingOneProtectInitializeCallback')[0];
      expect(() => cb.setClientError('oops')).toThrow();
    });

    it('other callback types do not have getConfig or setClientError', () => {
      const step = createJourneyStep(makePayload());
      const metaCb = step.getCallbacksOfType('MetadataCallback')[0];
      expect(metaCb.getConfig).toBeUndefined();
      expect(metaCb.setClientError).toBeUndefined();
    });
  });
});

describe('createJourneyStep round-trip (sessionStorage simulation)', () => {
  it('produces SDK class instances with all type-specific methods callable after JSON round-trip', () => {
    const rawPayload = {
      authId: 'abc123',
      callbacks: [
        {
          type: 'ValidatedCreatePasswordCallback',
          output: [
            { name: 'policies', value: {} },
            { name: 'failedPolicies', value: [] },
            { name: 'prompt', value: 'Password' },
          ],
          input: [
            { name: 'IDToken1', value: '' },
            { name: 'IDToken1validateOnly', value: false },
          ],
        },
        {
          type: 'ConfirmationCallback',
          output: [
            { name: 'options', value: ['Yes', 'No'] },
            { name: 'defaultOption', value: 0 },
            { name: 'messageType', value: 0 },
            { name: 'prompt', value: '' },
          ],
          input: [
            { name: 'IDToken1', value: 0 },
          ],
        },
      ],
    };

    const rehydratedPayload = JSON.parse(JSON.stringify(rawPayload));
    const step = createJourneyStep(rehydratedPayload);

    const cb = step.getCallbacksOfType('ValidatedCreatePasswordCallback')[0];
    const confirmationCb = step.getCallbacksOfType('ConfirmationCallback')[0];

    expect(() => cb.setValidateOnly(true)).not.toThrow();
    expect(() => cb.getPolicies()).not.toThrow();
    expect(() => cb.setPassword('x')).not.toThrow();
    expect(() => cb.getFailedPolicies()).not.toThrow();
    expect(() => confirmationCb.getOptions()).not.toThrow();
  });
});
