/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import i18n from '@/i18n';
import {
  authenticateWithAsScript,
  parseOptionsFromScript,
  formatRegistrationOutcome,
  parseRegistrationScript,
  registerWithAsScript,
} from './asScriptParser';

// ---------------------------------------------------------------------------
// Fixture strings from @forgerock/journey-client/dist/src/lib/webauthn/script-text.mock.data.js
// Inlined here because the deep dist path is not exported by the package manifest.
// ---------------------------------------------------------------------------

const authenticateInputWithRpidAndAllowCredentials = `
if (!window.PublicKeyCredential) {
   document.getElementById('webAuthnOutcome').value = "unsupported";
   document.getElementById("loginButton_0").click();
}

var options = {
   rpId: "example.com",
   challenge: new Int8Array([14, 126, -110, -74, 64, -66, 20, -56, -40, -28, 116, -61, -128, -20, 72, 24, 42, 79, -105, 94, -84, -12, -17, -97, 105, -31, -30, 92, 55, 67, -83, 65]).buffer,
   timeout: 60000,
   allowCredentials: [{ type: "public-key", id: new Int8Array([-107, 93, 68, -67, -5, 107, 18, 16, -25, -30, 80, 103, -75, -53, -2, -95, 102, 42, 47, 126, -1, 85, 93, 45, -85, 8, -108, 107, 47, -25, 66, 12, -96, 81, 104, -127, 26, -59, -69, -23, 75, 89, 58, 124, -93, 4, 28, -128, 121, 35, 39, 103, -86, -86, 123, -67, -7, -4, 79, -49, 127, -19, 7, 4]).buffer }]
};

navigator.credentials.get({ "publicKey" : options })
   .then(function (assertion) {
       var clientData = String.fromCharCode.apply(null, new Uint8Array(assertion.response.clientDataJSON));
       document.getElementById('webAuthnOutcome').value = clientData;
       document.getElementById("loginButton_0").click();
   }).catch(function (err) {
       document.getElementById('webAuthnOutcome').value = "ERROR" + "::" + err;
       document.getElementById("loginButton_0").click();
   });`;

const authenticateInputWithRpidAllowCredentialsAndQuotes = `
if (!window.PublicKeyCredential) {
   document.getElementById('webAuthnOutcome').value = "unsupported";
   document.getElementById("loginButton_0").click();
}

var options = {
   "rpId": "example.com",
   "challenge": new Int8Array([14, 126, -110, -74, 64, -66, 20, -56, -40, -28, 116, -61, -128, -20, 72, 24, 42, 79, -105, 94, -84, -12, -17, -97, 105, -31, -30, 92, 55, 67, -83, 65]).buffer,
   "timeout": 60000,
   "allowCredentials": [{ "type": "public-key", "id": new Int8Array([-107, 93, 68, -67, -5, 107, 18, 16, -25, -30, 80, 103, -75, -53, -2, -95, 102, 42, 47, 126, -1, 85, 93, 45, -85, 8, -108, 107, 47, -25, 66, 12, -96, 81, 104, -127, 26, -59, -69, -23, 75, 89, 58, 124, -93, 4, 28, -128, 121, 35, 39, 103, -86, -86, 123, -67, -7, -4, 79, -49, 127, -19, 7, 4]).buffer }]
};

navigator.credentials.get({ "publicKey" : options })
   .then(function (assertion) {
       var clientData = String.fromCharCode.apply(null, new Uint8Array(assertion.response.clientDataJSON));
       document.getElementById('webAuthnOutcome').value = clientData;
       document.getElementById("loginButton_0").click();
   }).catch(function (err) {
       document.getElementById('webAuthnOutcome').value = "ERROR" + "::" + err;
       document.getElementById("loginButton_0").click();
   });`;

const authenticateInputWithoutRpidAndAllowCredentials = `
if (!window.PublicKeyCredential) {
   document.getElementById('webAuthnOutcome').value = "unsupported";
   document.getElementById("loginButton_0").click();
}

var options = {
   challenge: new Int8Array([14, 126, -110, -74, 64, -66, 20, -56, -40, -28, 116, -61, -128, -20, 72, 24, 42, 79, -105, 94, -84, -12, -17, -97, 105, -31, -30, 92, 55, 67, -83, 65]).buffer,
   timeout: 60000,
};

navigator.credentials.get({ "publicKey" : options })
   .then(function (assertion) {
       var clientData = String.fromCharCode.apply(null, new Uint8Array(assertion.response.clientDataJSON));
       document.getElementById('webAuthnOutcome').value = clientData;
       document.getElementById("loginButton_0").click();
   }).catch(function (err) {
       document.getElementById('webAuthnOutcome').value = "ERROR" + "::" + err;
       document.getElementById("loginButton_0").click();
   });`;

/** Build a minimal fake step with the given callbacks keyed by type. */
function buildStep({ textMessage, hiddenId = 'webAuthnOutcome', messageType = '4' }) {
  const hiddenCallback = {
    getOutputValue: jest.fn((key) => (key === 'id' ? hiddenId : undefined)),
    setInputValue: jest.fn(),
  };

  const textCallback = {
    getOutputValue: jest.fn((key) => (key === 'message' ? textMessage : undefined)),
    getMessageType: jest.fn(() => messageType),
  };

  return {
    step: {
      getCallbacksOfType: jest.fn((type) => {
        if (type === 'TextOutputCallback') return [textCallback];
        if (type === 'HiddenValueCallback') return [hiddenCallback];
        return [];
      }),
    },
    hiddenCallback,
    textCallback,
  };
}

/** Build a fake credential returned by navigator.credentials.get(). */
function buildFakeCredential({ userHandle } = {}) {
  const encoder = new TextEncoder();
  const clientDataJSON = encoder.encode('{"type":"webauthn.get"}');
  const authenticatorData = new Int8Array([1, 2, 3]).buffer;
  const signature = new Int8Array([4, 5, 6]).buffer;

  return {
    id: 'fake-raw-id-base64url',
    response: {
      clientDataJSON,
      authenticatorData,
      signature,
      userHandle: userHandle !== undefined ? userHandle : null,
    },
  };
}

describe('parseOptionsFromScript', () => {
  describe('variant 1: with rpId + allowCredentials (unquoted keys)', () => {
    let options;
    beforeEach(() => {
      options = parseOptionsFromScript(authenticateInputWithRpidAndAllowCredentials);
    });

    it('extracts rpId', () => {
      expect(options.rpId).toBe('example.com');
    });

    it('extracts timeout', () => {
      expect(options.timeout).toBe(60000);
    });

    it('extracts challenge as ArrayBuffer', () => {
      expect(options.challenge).toBeInstanceOf(ArrayBuffer);
      const arr = new Int8Array(options.challenge);
      expect(arr[0]).toBe(14);
      expect(arr[1]).toBe(126);
    });

    it('extracts allowCredentials with correct type and id ArrayBuffer', () => {
      expect(Array.isArray(options.allowCredentials)).toBe(true);
      expect(options.allowCredentials).toHaveLength(1);
      expect(options.allowCredentials[0].type).toBe('public-key');
      expect(options.allowCredentials[0].id).toBeInstanceOf(ArrayBuffer);
      expect(new Int8Array(options.allowCredentials[0].id)[0]).toBe(-107);
    });

    it('does not include userVerification', () => {
      expect(options.userVerification).toBeUndefined();
    });
  });

  describe('variant 2: with rpId + allowCredentials (quoted keys)', () => {
    let options;
    beforeEach(() => {
      options = parseOptionsFromScript(authenticateInputWithRpidAllowCredentialsAndQuotes);
    });

    it('extracts rpId', () => {
      expect(options.rpId).toBe('example.com');
    });

    it('extracts timeout', () => {
      expect(options.timeout).toBe(60000);
    });

    it('extracts challenge as ArrayBuffer', () => {
      expect(options.challenge).toBeInstanceOf(ArrayBuffer);
      expect(new Int8Array(options.challenge)[0]).toBe(14);
    });

    it('extracts allowCredentials', () => {
      expect(Array.isArray(options.allowCredentials)).toBe(true);
      expect(options.allowCredentials).toHaveLength(1);
      expect(options.allowCredentials[0].type).toBe('public-key');
      expect(options.allowCredentials[0].id).toBeInstanceOf(ArrayBuffer);
      expect(new Int8Array(options.allowCredentials[0].id)[0]).toBe(-107);
    });

    it('produces identical options to variant 1 (unquoted)', () => {
      const v1 = parseOptionsFromScript(authenticateInputWithRpidAndAllowCredentials);
      expect(options.rpId).toBe(v1.rpId);
      expect(options.timeout).toBe(v1.timeout);
      expect(new Int8Array(options.challenge).toString())
        .toBe(new Int8Array(v1.challenge).toString());
      expect(new Int8Array(options.allowCredentials[0].id).toString())
        .toBe(new Int8Array(v1.allowCredentials[0].id).toString());
    });
  });

  describe('missing challenge', () => {
    it('throws with the translated error message when challenge is absent', () => {
      expect(() => parseOptionsFromScript('var options = { timeout: 60000 };'))
        .toThrow(i18n.global.t('login.webAuthn.errorParseScript'));
    });
  });

  describe('variant 3: without rpId, no allowCredentials', () => {
    let options;
    beforeEach(() => {
      options = parseOptionsFromScript(authenticateInputWithoutRpidAndAllowCredentials);
    });

    it('does not include rpId', () => {
      expect(options.rpId).toBeUndefined();
    });

    it('extracts timeout', () => {
      expect(options.timeout).toBe(60000);
    });

    it('extracts challenge', () => {
      expect(options.challenge).toBeInstanceOf(ArrayBuffer);
    });

    it('does not include allowCredentials', () => {
      expect(options.allowCredentials).toBeUndefined();
    });
  });
});

describe('authenticateWithAsScript', () => {
  let originalPublicKeyCredential;
  let originalCredentials;

  beforeEach(() => {
    originalPublicKeyCredential = window.PublicKeyCredential;
    originalCredentials = navigator.credentials;

    Object.defineProperty(window, 'PublicKeyCredential', {
      configurable: true,
      value: function PublicKeyCredentialStub() {},
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'PublicKeyCredential', {
      configurable: true,
      value: originalPublicKeyCredential,
    });
    Object.defineProperty(navigator, 'credentials', {
      configurable: true,
      value: originalCredentials,
    });
  });

  function mockCredentialsGet(implementation) {
    Object.defineProperty(navigator, 'credentials', {
      configurable: true,
      value: { get: implementation },
    });
  }

  describe('success path — all four variants', () => {
    const variants = [
      ['variant 1: rpId + allowCredentials', authenticateInputWithRpidAndAllowCredentials],
      ['variant 2: rpId + allowCredentials (quoted)', authenticateInputWithRpidAllowCredentialsAndQuotes],
      ['variant 3: no rpId, no allowCredentials', authenticateInputWithoutRpidAndAllowCredentials],
    ];

    test.each(variants)(
      '%s — calls navigator.credentials.get with publicKey options and returns step',
      async (name, scriptText) => {
        const fakeCredential = buildFakeCredential();
        const credentialsGetMock = jest.fn().mockResolvedValue(fakeCredential);
        mockCredentialsGet(credentialsGetMock);

        const { step, hiddenCallback } = buildStep({ textMessage: scriptText });

        const result = await authenticateWithAsScript(step);

        expect(credentialsGetMock).toHaveBeenCalledTimes(1);
        const callArg = credentialsGetMock.mock.calls[0][0];
        expect(callArg).toHaveProperty('publicKey');
        expect(callArg.publicKey.challenge).toBeInstanceOf(ArrayBuffer);
        expect(callArg.publicKey.timeout).toBe(60000);

        expect(result).toBe(step);

        expect(hiddenCallback.setInputValue).toHaveBeenCalledTimes(1);
        const outcomeValue = hiddenCallback.setInputValue.mock.calls[0][0];
        expect(outcomeValue).not.toMatch(/^ERROR/);
        expect(outcomeValue).toContain('::');
      },
    );

    it('includes rpId in publicKey options for variant 1', async () => {
      const credentialsGetMock = jest.fn().mockResolvedValue(buildFakeCredential());
      mockCredentialsGet(credentialsGetMock);

      const { step } = buildStep({ textMessage: authenticateInputWithRpidAndAllowCredentials });

      await authenticateWithAsScript(step);

      const callArg = credentialsGetMock.mock.calls[0][0];
      expect(callArg.publicKey.rpId).toBe('example.com');
    });

    it('omits rpId from publicKey options for variant 3', async () => {
      const credentialsGetMock = jest.fn().mockResolvedValue(buildFakeCredential());
      mockCredentialsGet(credentialsGetMock);

      const { step } = buildStep({ textMessage: authenticateInputWithoutRpidAndAllowCredentials });

      await authenticateWithAsScript(step);

      const callArg = credentialsGetMock.mock.calls[0][0];
      expect(callArg.publicKey.rpId).toBeUndefined();
    });
  });

  describe('messageType 5 (NO_JS_SCRIPT) — AM sends same WebAuthn script via type 5', () => {
    it('finds and processes the TextOutputCallback when messageType is 5', async () => {
      const fakeCredential = buildFakeCredential();
      mockCredentialsGet(jest.fn().mockResolvedValue(fakeCredential));

      const { step, hiddenCallback } = buildStep({
        textMessage: authenticateInputWithRpidAndAllowCredentials,
        messageType: '5',
      });

      const result = await authenticateWithAsScript(step);

      expect(result).toBe(step);
      expect(hiddenCallback.setInputValue).toHaveBeenCalledTimes(1);
      expect(hiddenCallback.setInputValue.mock.calls[0][0]).not.toMatch(/^ERROR/);
    });

    it('returns null and throws when only messageType 5 callback exists and is unrecognised', async () => {
      mockCredentialsGet(jest.fn());

      const { step } = buildStep({
        textMessage: authenticateInputWithRpidAndAllowCredentials,
        messageType: '99',
      });

      await expect(authenticateWithAsScript(step)).rejects.toThrow(i18n.global.t('login.webAuthn.errorCallbacksNotFound'));
    });
  });

  describe('outcome string formatting', () => {
    it('formats outcome without userHandle when userHandle is null', async () => {
      mockCredentialsGet(jest.fn().mockResolvedValue(buildFakeCredential({ userHandle: null })));

      const { step, hiddenCallback } = buildStep({
        textMessage: authenticateInputWithoutRpidAndAllowCredentials,
      });

      await authenticateWithAsScript(step);

      const outcome = hiddenCallback.setInputValue.mock.calls[0][0];
      const parts = outcome.split('::');
      expect(parts).toHaveLength(4);
      expect(parts[3]).toBe('fake-raw-id-base64url');
    });

    it('appends userHandle when credential.response.userHandle is non-empty', async () => {
      const encoder = new TextEncoder();
      const userHandleBuffer = encoder.encode('user@example.com');
      mockCredentialsGet(jest.fn().mockResolvedValue(buildFakeCredential({ userHandle: userHandleBuffer })));

      const { step, hiddenCallback } = buildStep({
        textMessage: authenticateInputWithoutRpidAndAllowCredentials,
      });

      await authenticateWithAsScript(step);

      const outcome = hiddenCallback.setInputValue.mock.calls[0][0];
      const parts = outcome.split('::');
      expect(parts).toHaveLength(5);
      expect(parts[4]).toBe('user@example.com');
    });

    it('omits userHandle when credential.response.userHandle is falsy', async () => {
      mockCredentialsGet(jest.fn().mockResolvedValue(buildFakeCredential({ userHandle: undefined })));

      const { step, hiddenCallback } = buildStep({
        textMessage: authenticateInputWithoutRpidAndAllowCredentials,
      });

      await authenticateWithAsScript(step);

      const outcome = hiddenCallback.setInputValue.mock.calls[0][0];
      expect(outcome.split('::')).toHaveLength(4);
    });

    it('formats clientDataJSON using TextDecoder', async () => {
      const encoder = new TextEncoder();
      const expectedJson = '{"type":"webauthn.get","challenge":"abc"}';
      const fakeCredential = {
        id: 'some-id',
        response: {
          clientDataJSON: encoder.encode(expectedJson),
          authenticatorData: new Int8Array([10, 20]).buffer,
          signature: new Int8Array([30, 40]).buffer,
          userHandle: null,
        },
      };
      mockCredentialsGet(jest.fn().mockResolvedValue(fakeCredential));

      const { step, hiddenCallback } = buildStep({
        textMessage: authenticateInputWithoutRpidAndAllowCredentials,
      });

      await authenticateWithAsScript(step);

      const outcome = hiddenCallback.setInputValue.mock.calls[0][0];
      expect(outcome.startsWith(expectedJson)).toBe(true);
    });
  });

  describe('error path: navigator.credentials.get rejects', () => {
    it('stamps ERROR::{name}:{message} on hidden callback and re-throws', async () => {
      const authError = new Error('User cancelled');
      authError.name = 'NotAllowedError';
      mockCredentialsGet(jest.fn().mockRejectedValue(authError));

      const { step, hiddenCallback } = buildStep({
        textMessage: authenticateInputWithRpidAndAllowCredentials,
      });

      await expect(authenticateWithAsScript(step)).rejects.toThrow(authError);

      expect(hiddenCallback.setInputValue).toHaveBeenCalledWith(
        'ERROR::NotAllowedError:User cancelled',
      );
    });

    it('does not stamp a success outcome when get() rejects', async () => {
      const authError = new Error('Aborted');
      authError.name = 'AbortError';
      mockCredentialsGet(jest.fn().mockRejectedValue(authError));

      const { step, hiddenCallback } = buildStep({
        textMessage: authenticateInputWithRpidAndAllowCredentials,
      });

      try {
        await authenticateWithAsScript(step);
      } catch (_e) {
        // expected
      }

      const stamped = hiddenCallback.setInputValue.mock.calls[0][0];
      expect(stamped).toMatch(/^ERROR::/);
    });
  });

  describe('error path: window.PublicKeyCredential absent', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'PublicKeyCredential', {
        configurable: true,
        value: undefined,
      });
    });

    it('stamps NotSupportedError on hidden callback', async () => {
      mockCredentialsGet(jest.fn());

      const { step, hiddenCallback } = buildStep({
        textMessage: authenticateInputWithRpidAndAllowCredentials,
      });

      await expect(authenticateWithAsScript(step)).rejects.toThrow(i18n.global.t('login.webAuthn.errorNotSupported'));

      expect(hiddenCallback.setInputValue).toHaveBeenCalledWith(
        `ERROR::NotSupportedError:${i18n.global.t('login.webAuthn.errorNotSupported')}`,
      );
    });

    it('does not call navigator.credentials.get when PublicKeyCredential absent', async () => {
      const credentialsGetMock = jest.fn();
      mockCredentialsGet(credentialsGetMock);

      const { step } = buildStep({
        textMessage: authenticateInputWithRpidAndAllowCredentials,
      });

      try {
        await authenticateWithAsScript(step);
      } catch (_e) {
        // expected
      }

      expect(credentialsGetMock).not.toHaveBeenCalled();
    });
  });
});

// ---------------------------------------------------------------------------
// Registration fixtures — inlined from
// @forgerock/journey-client/dist/src/lib/webauthn/script-text.mock.data.js
// (registerInputWithRpid, registerInputWithRpidAndQuotes,
// registerInputWithoutRpid, registerInputWithExcludeCreds) following the
// same pattern as the auth fixtures above.
// ---------------------------------------------------------------------------

const registerInputWithRpid = `/*
 * Copyright 2018-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

if (!window.PublicKeyCredential) {
    document.getElementById('webAuthnOutcome').value = "unsupported";
    document.getElementById("loginButton_0").click();
}

var publicKey = {
    challenge: new Int8Array([102, -15, -36, -101, -95, 10, -20, 39, 29, 70, 122, 25, 53, 83, 72, -38, 83, -92, 31, -30, 26, -94, 92, -94, -83, 7, 82, -66, -125, -95, -4, -75]).buffer,
    // Relying Party:
    rp: {
        id: "example.com",
        name: "ForgeRock"
    },
    // User:
    user: {
        id: Uint8Array.from("NTdhNWI0ZTQtNjk5OS00YjQ1LWJmODYtYTRmMmU1ZDRiNjI5", function (c) { return c.charCodeAt(0) }),
        name: "57a5b4e4-6999-4b45-bf86-a4f2e5d4b629",
        displayName: "bob_lee-tester@me.co.uk"
    },
    // Below pubKeyCredParams format represents AM 6.5
    pubKeyCredParams: [
      {
          type: "public-key",
          alg: -7
      }
     ,{
          type: "public-key",
          alg: -257
      }
    ],
    attestation: "none",
    timeout: 60000,
    excludeCredentials: [],
    authenticatorSelection: {
      userVerification: "preferred"
      authenticatorAttachment:"cross-platform"
    }
};

navigator.credentials.create({publicKey: publicKey})
    .then(function (newCredentialInfo) {
        var rawId = newCredentialInfo.id;
        var clientData = String.fromCharCode.apply(null, new Uint8Array(newCredentialInfo.response.clientDataJSON));
        var keyData = new Int8Array(newCredentialInfo.response.attestationObject).toString();
        document.getElementById('webAuthnOutcome').value = clientData + "::" + keyData + "::" + rawId;
        document.getElementById("loginButton_0").click();
    }).catch(function (err) {
        document.getElementById('webAuthnOutcome').value = "ERROR" + "::" + err;
        document.getElementById("loginButton_0").click();
    });`;

const registerInputWithRpidAndQuotes = `/*
    * Copyright 2018-2020 ForgeRock AS. All Rights Reserved
    *
    * Use of this code requires a commercial software license with ForgeRock AS.
    * or with one of its affiliates. All use shall be exclusively subject
    * to such license between the licensee and ForgeRock AS.
    */

   if (!window.PublicKeyCredential) {
       document.getElementById('webAuthnOutcome').value = "unsupported";
       document.getElementById("loginButton_0").click();
   }

   var publicKey = {
       "challenge": new Int8Array([102, -15, -36, -101, -95, 10, -20, 39, 29, 70, 122, 25, 53, 83, 72, -38, 83, -92, 31, -30, 26, -94, 92, -94, -83, 7, 82, -66, -125, -95, -4, -75]).buffer,
       // Relying Party:
       "rp": {
           "id": "example.com",
           "name": "ForgeRock"
       },
       // User:
       "user": {
           "id": Uint8Array.from("NTdhNWI0ZTQtNjk5OS00YjQ1LWJmODYtYTRmMmU1ZDRiNjI5", function (c) { return c.charCodeAt(0) }),
           "name": "57a5b4e4-6999-4b45-bf86-a4f2e5d4b629",
           "displayName": "bob_lee-tester@me.co.uk"
       },
       "pubKeyCredParams": [ { "type": "public-key", "alg": -257 }, { "type": "public-key", "alg": -7 } ],
       "attestation": "none",
       "timeout": 60000,
       "excludeCredentials": [],
       "authenticatorSelection": {"userVerification":"preferred","authenticatorAttachment":"cross-platform"}
   };

   navigator.credentials.create({publicKey: publicKey})
       .then(function (newCredentialInfo) {
           var rawId = newCredentialInfo.id;
           var clientData = String.fromCharCode.apply(null, new Uint8Array(newCredentialInfo.response.clientDataJSON));
           var keyData = new Int8Array(newCredentialInfo.response.attestationObject).toString();
           document.getElementById('webAuthnOutcome').value = clientData + "::" + keyData + "::" + rawId;
           document.getElementById("loginButton_0").click();
       }).catch(function (err) {
           document.getElementById('webAuthnOutcome').value = "ERROR" + "::" + err;
           document.getElementById("loginButton_0").click();
       });`;

const registerInputWithoutRpid = `/*
 * Copyright 2018-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

if (!window.PublicKeyCredential) {
    document.getElementById('webAuthnOutcome').value = "unsupported";
    document.getElementById("loginButton_0").click();
}

var publicKey = {
    challenge: new Int8Array([102, -15, -36, -101, -95, 10, -20, 39, 29, 70, 122, 25, 53, 83, 72, -38, 83, -92, 31, -30, 26, -94, 92, -94, -83, 7, 82, -66, -125, -95, -4, -75]).buffer,
    // Relying Party:
    rp: {
        name: "ForgeRock"
    },
    // User:
    user: {
        id: Uint8Array.from("NTdhNWI0ZTQtNjk5OS00YjQ1LWJmODYtYTRmMmU1ZDRiNjI5", function (c) { return c.charCodeAt(0) }),
        name: "57a5b4e4-6999-4b45-bf86-a4f2e5d4b629",
        displayName: "Bob Tester"
    },
    pubKeyCredParams: [ { "type": "public-key", "alg": -257 }, { "type": "public-key", "alg": -7 } ],
    attestation: "none",
    timeout: 60000,
    excludeCredentials: [],
    authenticatorSelection: {"userVerification":"preferred"}
};

navigator.credentials.create({publicKey: publicKey})
    .then(function (newCredentialInfo) {
        var rawId = newCredentialInfo.id;
        var clientData = String.fromCharCode.apply(null, new Uint8Array(newCredentialInfo.response.clientDataJSON));
        var keyData = new Int8Array(newCredentialInfo.response.attestationObject).toString();
        document.getElementById('webAuthnOutcome').value = clientData + "::" + keyData + "::" + rawId;
        document.getElementById("loginButton_0").click();
    }).catch(function (err) {
        document.getElementById('webAuthnOutcome').value = "ERROR" + "::" + err;
        document.getElementById("loginButton_0").click();
    });`;

const registerInputWithExcludeCreds = `/*
 * Copyright 2018-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

if (!window.PublicKeyCredential) {
    document.getElementById('webAuthnOutcome').value = "unsupported";
    document.getElementById("loginButton_0").click();
}

var publicKey = {
    challenge: new Int8Array([102, -15, -36, -101, -95, 10, -20, 39, 29, 70, 122, 25, 53, 83, 72, -38, 83, -92, 31, -30, 26, -94, 92, -94, -83, 7, 82, -66, -125, -95, -4, -75]).buffer,
    // Relying Party:
    rp: {
        name: "ForgeRock"
    },
    // User:
    user: {
        id: Uint8Array.from("NTdhNWI0ZTQtNjk5OS00YjQ1LWJmODYtYTRmMmU1ZDRiNjI5", function (c) { return c.charCodeAt(0) }),
        name: "57a5b4e4-6999-4b45-bf86-a4f2e5d4b629",
        displayName: "Bob Tester"
    },
    pubKeyCredParams: [ { "type": "public-key", "alg": -257 }, { "type": "public-key", "alg": -7 } ],
    attestation: "none",
    timeout: 60000,
    excludeCredentials: [{ "type": "public-key", "id": new Int8Array([49, -96, -107, 113, 106, 5, 115, 22, 68, 121, -85, -27, 8, -58, -113, 127, -105, -37, -10, -12, -58, -25, 29, -82, -18, 69, -99, 125, 33, 82, 38, -66, -27, -128, -91, -86, 87, 68, 94, 0, -78, 70, -11, -70, -14, -53, 38, -60, 46, 27, 66, 46, 21, -125, -70, 123, -46, -124, 86, -2, 102, 70, -52, 54]).buffer },{ "type": "public-key", "id": new Int8Array([64, 17, -15, -123, -21, 127, 76, -120, 90, -112, -5, 54, 105, 93, 82, -104, -79, 107, -69, -3, -113, -94, -59, -4, 126, -33, 117, 32, -44, 122, -97, 8, -112, 105, -96, 96, 90, 44, -128, -121, 107, 79, -98, -68, -93, 11, -105, -47, 102, 13, 110, 84, 59, -91, -30, 37, -3, -22, 39, 111, -10, 87, -50, -35]).buffer }],
    authenticatorSelection: {"userVerification":"preferred"}
};

navigator.credentials.create({publicKey: publicKey})
    .then(function (newCredentialInfo) {
        var rawId = newCredentialInfo.id;
        var clientData = String.fromCharCode.apply(null, new Uint8Array(newCredentialInfo.response.clientDataJSON));
        var keyData = new Int8Array(newCredentialInfo.response.attestationObject).toString();
        document.getElementById('webAuthnOutcome').value = clientData + "::" + keyData + "::" + rawId;
        document.getElementById("loginButton_0").click();
    }).catch(function (err) {
        document.getElementById('webAuthnOutcome').value = "ERROR" + "::" + err;
        document.getElementById("loginButton_0").click();
    });`;

/** Build a fake registration credential returned by navigator.credentials.create(). */
function buildFakeRegistrationCredential() {
  const encoder = new TextEncoder();
  const clientDataJSON = encoder.encode('{"type":"webauthn.create"}');
  const attestationObject = new Int8Array([7, 8, 9]).buffer;

  return {
    id: 'fake-registration-raw-id',
    response: {
      clientDataJSON,
      attestationObject,
    },
  };
}

describe('parseRegistrationScript', () => {
  describe('registerInputWithRpid (unquoted keys, AM 6.5 pubKeyCredParams, missing comma)', () => {
    let options;
    beforeEach(() => {
      options = parseRegistrationScript(registerInputWithRpid);
    });

    it('extracts attestation', () => {
      expect(options.attestation).toBe('none');
    });

    it('extracts timeout', () => {
      expect(options.timeout).toBe(60000);
    });

    it('extracts rp with id and name', () => {
      expect(options.rp).toEqual({ id: 'example.com', name: 'ForgeRock' });
    });

    it('extracts user and authenticatorSelection, tolerating the missing comma', () => {
      expect(options.user.name).toBe('57a5b4e4-6999-4b45-bf86-a4f2e5d4b629');
      expect(options.user.displayName).toBe('bob_lee-tester@me.co.uk');
      expect(options.authenticatorSelection).toEqual({
        userVerification: 'preferred',
        authenticatorAttachment: 'cross-platform',
      });
    });

    it('extracts pubKeyCredParams (AM 6.5 multi-object unquoted layout)', () => {
      // The verbatim old-SDK regex captures the params in script order for
      // this fixture, while the journey-client expected object lists them
      // reversed — assert content, not order.
      expect(options.pubKeyCredParams).toEqual(expect.arrayContaining([
        { type: 'public-key', alg: -257 },
        { type: 'public-key', alg: -7 },
      ]));
      expect(options.pubKeyCredParams).toHaveLength(2);
    });

    it('extracts challenge as ArrayBuffer with expected bytes', () => {
      expect(options.challenge).toBeInstanceOf(ArrayBuffer);
      expect(new Int8Array(options.challenge)[0]).toBe(102);
      expect(new Int8Array(options.challenge)[1]).toBe(-15);
      expect(new Int8Array(options.challenge)[2]).toBe(-36);
    });

    it('re-encodes user.id as char codes, not base64', () => {
      const expected = new TextEncoder().encode('NTdhNWI0ZTQtNjk5OS00YjQ1LWJmODYtYTRmMmU1ZDRiNjI5');
      // Compare byte content (the setup polyfill's Uint8Array prototype differs
      // from the global one, so typed-array identity comparison fails).
      expect(Array.from(new Uint8Array(options.user.id))).toEqual(Array.from(expected));
    });

    it('omits excludeCredentials when the script lists an empty array', () => {
      expect(options.excludeCredentials).toBeUndefined();
    });
  });

  describe('registerInputWithRpidAndQuotes (fully quoted keys)', () => {
    let options;
    beforeEach(() => {
      options = parseRegistrationScript(registerInputWithRpidAndQuotes);
    });

    it('extracts attestation', () => {
      expect(options.attestation).toBe('none');
    });

    it('extracts rp with id and name', () => {
      expect(options.rp).toEqual({ id: 'example.com', name: 'ForgeRock' });
    });

    it('extracts authenticatorSelection', () => {
      expect(options.authenticatorSelection).toEqual({
        userVerification: 'preferred',
        authenticatorAttachment: 'cross-platform',
      });
    });

    it('extracts pubKeyCredParams', () => {
      expect(options.pubKeyCredParams).toEqual([
        { type: 'public-key', alg: -257 },
        { type: 'public-key', alg: -7 },
      ]);
    });

    it('extracts challenge as ArrayBuffer', () => {
      expect(options.challenge).toBeInstanceOf(ArrayBuffer);
      expect(new Int8Array(options.challenge)[0]).toBe(102);
    });

    it('produces options equal to the unquoted variant', () => {
      const unquoted = parseRegistrationScript(registerInputWithRpid);
      expect(options.attestation).toBe(unquoted.attestation);
      expect(options.authenticatorSelection).toEqual(unquoted.authenticatorSelection);
      // The two fixtures list pubKeyCredParams in different orders, so the
      // verbatim regex captures each in its script order — compare content.
      expect(options.pubKeyCredParams).toEqual(expect.arrayContaining(unquoted.pubKeyCredParams));
      expect(options.pubKeyCredParams).toHaveLength(unquoted.pubKeyCredParams.length);
      expect(options.rp).toEqual(unquoted.rp);
      expect(options.timeout).toBe(unquoted.timeout);
      expect(options.user.name).toBe(unquoted.user.name);
      expect(options.user.displayName).toBe(unquoted.user.displayName);
      expect(new Int8Array(options.challenge).toString())
        .toBe(new Int8Array(unquoted.challenge).toString());
      expect(new Uint8Array(options.user.id).toString())
        .toBe(new Uint8Array(unquoted.user.id).toString());
    });
  });

  describe('registerInputWithoutRpid', () => {
    let options;
    beforeEach(() => {
      options = parseRegistrationScript(registerInputWithoutRpid);
    });

    it('extracts rp with name only and no id', () => {
      expect(options.rp).toEqual({ name: 'ForgeRock' });
    });

    it('extracts authenticatorSelection with userVerification only', () => {
      expect(options.authenticatorSelection).toEqual({ userVerification: 'preferred' });
    });

    it('extracts user with displayName', () => {
      expect(options.user.displayName).toBe('Bob Tester');
      expect(options.user.name).toBe('57a5b4e4-6999-4b45-bf86-a4f2e5d4b629');
    });

    it('omits excludeCredentials', () => {
      expect(options.excludeCredentials).toBeUndefined();
    });
  });

  describe('registerInputWithExcludeCreds', () => {
    let options;
    beforeEach(() => {
      options = parseRegistrationScript(registerInputWithExcludeCreds);
    });

    it('parses two excludeCredentials entries with public-key type and ArrayBuffer ids', () => {
      expect(Array.isArray(options.excludeCredentials)).toBe(true);
      expect(options.excludeCredentials).toHaveLength(2);
      options.excludeCredentials.forEach((cred) => {
        expect(cred.type).toBe('public-key');
        expect(cred.id).toBeInstanceOf(ArrayBuffer);
      });
      expect(new Int8Array(options.excludeCredentials[0].id)[0]).toBe(49);
      expect(new Int8Array(options.excludeCredentials[1].id)[0]).toBe(64);
    });

    it('does not swallow excludeCredentials into pubKeyCredParams', () => {
      expect(options.pubKeyCredParams).toHaveLength(2);
      expect(options.pubKeyCredParams.every((param) => param.alg !== undefined)).toBe(true);
    });
  });

  describe('error paths', () => {
    it('throws DataError with the translated message when pubKeyCredParams is absent', () => {
      const withoutParams = registerInputWithoutRpid.replace(
        /\s*pubKeyCredParams: \[ \{ "type": "public-key", "alg": -257 \}, \{ "type": "public-key", "alg": -7 \} \],/,
        '',
      );
      expect(() => parseRegistrationScript(withoutParams))
        .toThrow(i18n.global.t('login.webAuthn.errorParseScript'));
      try {
        parseRegistrationScript(withoutParams);
      } catch (err) {
        expect(err.name).toBe('DataError');
      }
    });

    it('throws the translated message when challenge is absent', () => {
      const withoutChallenge = registerInputWithoutRpid.replace(
        /challenge: new Int8Array\(\[[\d,\s-]+\]\)\.buffer,/,
        '',
      );
      expect(() => parseRegistrationScript(withoutChallenge))
        .toThrow(i18n.global.t('login.webAuthn.errorParseScript'));
    });
  });
});

describe('registerWithAsScript', () => {
  let originalPublicKeyCredential;
  let originalCredentials;

  beforeEach(() => {
    originalPublicKeyCredential = window.PublicKeyCredential;
    originalCredentials = navigator.credentials;

    Object.defineProperty(window, 'PublicKeyCredential', {
      configurable: true,
      value: function PublicKeyCredentialStub() {},
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'PublicKeyCredential', {
      configurable: true,
      value: originalPublicKeyCredential,
    });
    Object.defineProperty(navigator, 'credentials', {
      configurable: true,
      value: originalCredentials,
    });
  });

  function mockCredentialsCreate(implementation) {
    Object.defineProperty(navigator, 'credentials', {
      configurable: true,
      value: { create: implementation, get: jest.fn() },
    });
  }

  describe('success path', () => {
    it('calls navigator.credentials.create with parsed publicKey options and returns step', async () => {
      const credentialsCreateMock = jest.fn().mockResolvedValue(buildFakeRegistrationCredential());
      mockCredentialsCreate(credentialsCreateMock);

      const { step, hiddenCallback } = buildStep({ textMessage: registerInputWithRpid });

      const result = await registerWithAsScript(step);

      expect(credentialsCreateMock).toHaveBeenCalledTimes(1);
      const callArg = credentialsCreateMock.mock.calls[0][0];
      expect(callArg).toHaveProperty('publicKey');
      expect(callArg.publicKey.challenge).toBeInstanceOf(ArrayBuffer);
      expect(callArg.publicKey.timeout).toBe(60000);
      expect(callArg.publicKey.rp).toEqual({ id: 'example.com', name: 'ForgeRock' });

      expect(result).toBe(step);

      expect(hiddenCallback.setInputValue).toHaveBeenCalledTimes(1);
      const outcomeValue = hiddenCallback.setInputValue.mock.calls[0][0];
      expect(outcomeValue).not.toMatch(/^ERROR/);
      expect(outcomeValue).toContain('::');
    });

    it('never calls navigator.credentials.get', async () => {
      const credentialsGetMock = jest.fn();
      Object.defineProperty(navigator, 'credentials', {
        configurable: true,
        value: { create: jest.fn().mockResolvedValue(buildFakeRegistrationCredential()), get: credentialsGetMock },
      });

      const { step } = buildStep({ textMessage: registerInputWithRpid });
      await registerWithAsScript(step);

      expect(credentialsGetMock).not.toHaveBeenCalled();
    });

    it('stamps a three-segment outcome: decoded clientDataJSON :: Int8Array attestationObject :: rawId', async () => {
      const credential = buildFakeRegistrationCredential();
      mockCredentialsCreate(jest.fn().mockResolvedValue(credential));

      const { step, hiddenCallback } = buildStep({ textMessage: registerInputWithRpid });
      await registerWithAsScript(step);

      const outcome = hiddenCallback.setInputValue.mock.calls[0][0];
      const parts = outcome.split('::');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('{"type":"webauthn.create"}');
      expect(parts[1]).toBe(new Int8Array(credential.response.attestationObject).toString());
      expect(parts[2]).toBe('fake-registration-raw-id');
    });
  });

  describe('error path: navigator.credentials.create rejects', () => {
    it('stamps ERROR::{name}:{message} on hidden callback and re-throws', async () => {
      const regError = new Error('User cancelled');
      regError.name = 'NotAllowedError';
      mockCredentialsCreate(jest.fn().mockRejectedValue(regError));

      const { step, hiddenCallback } = buildStep({ textMessage: registerInputWithRpid });

      await expect(registerWithAsScript(step)).rejects.toThrow(regError);

      expect(hiddenCallback.setInputValue).toHaveBeenCalledWith(
        'ERROR::NotAllowedError:User cancelled',
      );
    });
  });

  describe('error path: parse failure (missing pubKeyCredParams)', () => {
    it('stamps ERROR::DataError:{message} on hidden callback and re-throws', async () => {
      mockCredentialsCreate(jest.fn());

      const scriptWithoutParams = registerInputWithoutRpid.replace(
        /\s*pubKeyCredParams: \[ \{ "type": "public-key", "alg": -257 \}, \{ "type": "public-key", "alg": -7 \} \],/,
        '',
      );
      const { step, hiddenCallback } = buildStep({ textMessage: scriptWithoutParams });

      await expect(registerWithAsScript(step)).rejects.toThrow(i18n.global.t('login.webAuthn.errorParseScript'));

      expect(hiddenCallback.setInputValue).toHaveBeenCalledWith(
        `ERROR::DataError:${i18n.global.t('login.webAuthn.errorParseScript')}`,
      );
      expect(hiddenCallback.setInputValue).toHaveBeenCalledTimes(1);
    });
  });

  describe('error path: window.PublicKeyCredential absent', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'PublicKeyCredential', {
        configurable: true,
        value: undefined,
      });
    });

    it('stamps NotSupportedError on hidden callback and does not call create()', async () => {
      const credentialsCreateMock = jest.fn();
      mockCredentialsCreate(credentialsCreateMock);

      const { step, hiddenCallback } = buildStep({ textMessage: registerInputWithRpid });

      await expect(registerWithAsScript(step)).rejects.toThrow(i18n.global.t('login.webAuthn.errorNotSupported'));

      expect(hiddenCallback.setInputValue).toHaveBeenCalledWith(
        `ERROR::NotSupportedError:${i18n.global.t('login.webAuthn.errorNotSupported')}`,
      );
      expect(credentialsCreateMock).not.toHaveBeenCalled();
    });
  });

  describe('error path: callbacks not found', () => {
    it('stamps ERROR::NotFoundError when the hidden callback is missing', async () => {
      const textCallback = {
        getOutputValue: jest.fn((key) => (key === 'message' ? registerInputWithRpid : undefined)),
        getMessageType: jest.fn(() => '4'),
      };
      const step = {
        getCallbacksOfType: jest.fn((type) => (type === 'TextOutputCallback' ? [textCallback] : [])),
      };

      await expect(registerWithAsScript(step)).rejects.toThrow(i18n.global.t('login.webAuthn.errorCallbacksNotFound'));
    });
  });
});

describe('formatRegistrationOutcome', () => {
  it('throws UnknownError-named error when credential is null', () => {
    expect(() => formatRegistrationOutcome(null)).toThrow('No credential generated from registration');
    try {
      formatRegistrationOutcome(null);
    } catch (err) {
      expect(err.name).toBe('UnknownError');
    }
  });

  it('formats exactly three segments from a registration credential', () => {
    const credential = buildFakeRegistrationCredential();
    const outcome = formatRegistrationOutcome(credential);
    const parts = outcome.split('::');
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe('{"type":"webauthn.create"}');
    expect(parts[1]).toBe(new Int8Array(credential.response.attestationObject).toString());
    expect(parts[2]).toBe('fake-registration-raw-id');
  });
});
