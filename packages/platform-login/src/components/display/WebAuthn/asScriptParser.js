/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/journey-client';
import i18n from '@/i18n';

/**
 * Local gap-fill for asScript WebAuthn (TextOutputCallback-based) authentication.
 * @forgerock/journey-client dropped support for this flow; this module handles it
 * locally to maintain support for legacy AM users still on this path.
 */

/**
 * Parses a JavaScript array literal containing credential objects with
 * Int8Array id values. Each credential has the form:
 *   { type: "public-key", id: new Int8Array([...]).buffer }
 *
 * @param {string} arrayText - The raw JS array literal string
 * @returns {Array<{type: string, id: ArrayBuffer}>}
 */
function parseCredentialArray(arrayText) {
  const credentials = [];
  const credRegex = /new Int8Array\((\[[\d,\s-]+\])\)\.buffer/g;
  let match = credRegex.exec(arrayText);
  while (match !== null) {
    credentials.push({
      type: 'public-key',
      id: new Int8Array(JSON.parse(match[1])).buffer,
    });
    match = credRegex.exec(arrayText);
  }
  return credentials;
}

/**
 * Parses the AM asScript WebAuthn script text and extracts
 * PublicKeyCredentialRequestOptions using regex.
 *
 * Handles three AM variants:
 *   - with rpId + allowCredentials (unquoted keys)
 *   - with rpId + allowCredentials (quoted keys)
 *   - without rpId (no allowCredentials)
 *
 * @param {string} scriptText - The JS script string from TextOutputCallback
 * @returns {PublicKeyCredentialRequestOptions}
 */
function parseOptionsFromScript(scriptText) {
  const challengeMatch = /["']?challenge["']?\s*:\s*new Int8Array\((\[[\d,\s-]+\])\)\.buffer/.exec(scriptText);
  if (!challengeMatch) {
    throw new Error(i18n.global.t('login.webAuthn.errorParseScript'));
  }
  const challenge = new Int8Array(JSON.parse(challengeMatch[1])).buffer;

  const timeoutMatch = /["']?timeout["']?\s*:\s*(\d+)/.exec(scriptText);
  const timeout = timeoutMatch ? parseInt(timeoutMatch[1], 10) : undefined;

  const rpIdMatch = /["']?rpId["']?\s*:\s*["']([^"']+)["']/.exec(scriptText);
  const rpId = rpIdMatch ? rpIdMatch[1] : undefined;

  const uvMatch = /["']?userVerification["']?\s*:\s*["']([^"']+)["']/.exec(scriptText);
  const userVerification = uvMatch ? uvMatch[1] : undefined;

  let allowCredentials;
  const allowCredsMatch = /["']?allowCredentials["']?\s*:\s*(\[.+?\.buffer\s*}\s*\])/s.exec(scriptText);
  if (allowCredsMatch) {
    allowCredentials = parseCredentialArray(allowCredsMatch[1]);
  }

  const options = { challenge };
  if (timeout !== undefined) options.timeout = timeout;
  if (rpId !== undefined) options.rpId = rpId;
  if (userVerification !== undefined) options.userVerification = userVerification;
  if (allowCredentials !== undefined) options.allowCredentials = allowCredentials;

  return options;
}

/**
 * Finds the TextOutputCallback whose message contains 'webAuthnOutcome'
 * on the given step.
 *
 * @param {object} step - AM step object
 * @returns {object|null} The callback, or null if not found
 */
function findWebAuthnTextOutputCallback(step) {
  const callbacks = step.getCallbacksOfType(callbackType.TextOutputCallback);
  return callbacks.find((cb) => {
    const msg = cb.getOutputValue('message') || cb.getMessage?.() || '';
    return msg.includes('webAuthnOutcome') && ['4', '5'].includes(String(cb.getMessageType?.()));
  }) || null;
}

/**
 * Finds the HiddenValueCallback whose output id is 'webAuthnOutcome'.
 *
 * @param {object} step - AM step object
 * @returns {object|null} The callback, or null if not found
 */
function findWebAuthnHiddenCallback(step) {
  const callbacks = step.getCallbacksOfType('HiddenValueCallback');
  return callbacks.find((cb) => {
    const id = cb.getOutputValue('id');
    return id === 'webAuthnOutcome';
  }) || null;
}

/**
 * Formats the credential returned by navigator.credentials.get() into the
 * AM expected outcome string:
 *   {clientDataJSON}::{authenticatorData}::{signature}::{rawId}
 * or with optional userHandle:
 *   {clientDataJSON}::{authenticatorData}::{signature}::{rawId}::{userHandle}
 *
 * @param {PublicKeyCredential} credential
 * @returns {string}
 */
function formatOutcome(credential) {
  const clientDataJSON = new TextDecoder().decode(credential.response.clientDataJSON);
  const authenticatorData = new Int8Array(credential.response.authenticatorData).toString();
  const signature = new Int8Array(credential.response.signature).toString();
  const rawId = credential.id;

  let outcome = `${clientDataJSON}::${authenticatorData}::${signature}::${rawId}`;

  if (credential.response.userHandle) {
    const userHandle = new TextDecoder().decode(credential.response.userHandle);
    if (userHandle) {
      outcome += `::${userHandle}`;
    }
  }

  return outcome;
}

/**
 * Handles WebAuthn authentication for asScript=true steps.
 *
 * Parses the JS script from the TextOutputCallback, calls
 * navigator.credentials.get() with the extracted options, formats the
 * outcome string, and sets it on the HiddenValueCallback.
 *
 * On any error, stamps "ERROR::{error.name}:{error.message}" on the
 * hidden callback and re-throws.
 *
 * @param {object} step - The AM step object
 * @returns {Promise<object>} Resolves with the step when authentication succeeds
 */
async function authenticateWithAsScript(step) {
  const textCallback = findWebAuthnTextOutputCallback(step);
  const hiddenCallback = findWebAuthnHiddenCallback(step);

  if (!textCallback || !hiddenCallback) {
    const err = new Error(i18n.global.t('login.webAuthn.errorCallbacksNotFound'));
    if (hiddenCallback) {
      hiddenCallback.setInputValue(`ERROR::NotFoundError:${err.message}`);
    }
    throw err;
  }

  const scriptText = textCallback.getOutputValue('message') || textCallback.getMessage?.() || '';

  if (!window.PublicKeyCredential) {
    const err = new Error(i18n.global.t('login.webAuthn.errorNotSupported'));
    hiddenCallback.setInputValue(`ERROR::NotSupportedError:${err.message}`);
    throw err;
  }

  let options;
  try {
    options = parseOptionsFromScript(scriptText);
  } catch (parseErr) {
    hiddenCallback.setInputValue(`ERROR::${parseErr.name}:${parseErr.message}`);
    throw parseErr;
  }

  try {
    const credential = await navigator.credentials.get({ publicKey: options });
    const outcome = formatOutcome(credential);
    hiddenCallback.setInputValue(outcome);
    return step;
  } catch (err) {
    hiddenCallback.setInputValue(`ERROR::${err.name}:${err.message}`);
    throw err;
  }
}

/**
 * Returns capture group 1 of a regex match, or an empty string when the
 * regex did not match. Ported from the legacy @forgerock/javascript-sdk
 * fr-webauthn helper getIndexOne.
 *
 * @param {Array|null} match - RegExp exec/match result or null
 * @returns {string} The first capture group, or ''
 */
function getIndexOne(match) {
  return match ? match[1] : '';
}

/**
 * Parses a pubKeyCredParams capture into an array of { type, alg } objects.
 * Ported from the legacy @forgerock/javascript-sdk fr-webauthn helper
 * parsePubKeyArray. Handles already-parsed arrays, JSON arrays and the
 * unquoted-key object literal form AM emits.
 *
 * @param {string|Array} value - Raw capture string or already-parsed array
 * @returns {Array|undefined} Parsed pubKeyCredParams, or undefined when not parseable
 */
function parsePubKeyArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value !== 'string') {
    return undefined;
  }
  if (value && value[0] === '[') {
    return JSON.parse(value);
  }
  const quoted = value.replace(/(\w+):/g, '"$1":');
  return JSON.parse(`[${quoted}]`);
}

/**
 * Parses the AM asScript WebAuthn registration script text and extracts
 * PublicKeyCredentialCreationOptions using field-by-field regexes.
 *
 * This is a port of the legacy @forgerock/javascript-sdk
 * parseWebAuthnRegisterText; the regexes are intentionally unchanged. AM
 * emits non-strict JavaScript (the real registerInputWithRpid fixture has a
 * missing comma inside authenticatorSelection), so the options object cannot
 * be JSON.parse'd as a whole.
 *
 * Handles the AM registration variants:
 *   - with rp.id + excludeCredentials [] (quoted and unquoted keys)
 *   - without rp.id
 *   - with populated excludeCredentials
 *
 * @param {string} scriptText - The JS script string from TextOutputCallback
 * @returns {PublicKeyCredentialCreationOptions}
 * @throws {Error} When the challenge cannot be found
 * @throws {Error} With name 'DataError' when pubKeyCredParams is missing or empty
 */
function parseRegistrationScript(scriptText) {
  const attestation = getIndexOne(/attestation"?:\s*"(\w+)"/.exec(scriptText));
  const timeoutMatch = /timeout"?:\s*(\d+)/.exec(scriptText);
  const timeout = timeoutMatch ? Number(timeoutMatch[1]) : undefined;
  const userVerification = getIndexOne(/userVerification"?:\s*"(\w+)"/.exec(scriptText));
  const requireResidentKey = getIndexOne(/requireResidentKey"?:\s*(\w+)/.exec(scriptText));
  const authenticatorAttachment = getIndexOne(/authenticatorAttachment"?:\s*"([\w-]+)/.exec(scriptText));

  const rpBlock = getIndexOne(/rp"?:\s*{([^}]+)}/.exec(scriptText)).trim();
  const rpId = getIndexOne(/id"?:\s*"([^"]*)"/.exec(rpBlock));
  const rpName = getIndexOne(/name"?:\s*"([^"]*)"/.exec(rpBlock));

  // user fields must be matched against the isolated user block only;
  // matching them against the whole script would let rp.name leak into user.name.
  const userBlock = getIndexOne(/user"?:\s*{([^]+)},/.exec(scriptText)).trim();
  const userIdLiteral = getIndexOne(/id"?:\s*Uint8Array\.from\("([^"]+)"/.exec(userBlock));
  const userName = getIndexOne(/name"?:\s*"([\d\w._-]+)"/.exec(userBlock));
  const userDisplayName = getIndexOne(/displayName"?:\s*"([\d\w\s.@_-]+)"/.exec(userBlock));

  // The capture deliberately ends in a digit-terminated object so that
  // excludeCredentials' very similar `.buffer` objects are not swallowed
  // into pubKeyCredParams.
  const pubKeyCredParamsText = getIndexOne(/pubKeyCredParams"*:\s*\[([^]+\d\s*})\s*]/.exec(scriptText)).trim();
  const pubKeyCredParams = parsePubKeyArray(pubKeyCredParamsText);
  if (!pubKeyCredParams || pubKeyCredParams.length === 0) {
    const err = new Error(i18n.global.t('login.webAuthn.errorParseScript'));
    err.name = 'DataError';
    throw err;
  }

  const excludeCredentials = parseCredentialArray(
    getIndexOne(/excludeCredentials"?:\s*\[([^]+)\s*]/.exec(scriptText)).trim(),
  );

  // The `\)` escape is part of the verbatim old-SDK regex
  // eslint-disable-next-line no-useless-escape
  const challengeMatch = /challenge"?:\s*new\s*(Uint|Int)8Array\(([^\)]+)/.exec(scriptText);
  if (!challengeMatch) {
    throw new Error(i18n.global.t('login.webAuthn.errorParseScript'));
  }
  const challenge = new Int8Array(JSON.parse(challengeMatch[2])).buffer;

  const authenticatorSelection = {};
  if (userVerification) {
    authenticatorSelection.userVerification = userVerification;
  }
  // Only include authenticatorAttachment if the value is truthy
  if (authenticatorAttachment) {
    authenticatorSelection.authenticatorAttachment = authenticatorAttachment;
  }
  // Only include requireResidentKey when the captured value is the string "true"
  if (requireResidentKey === 'true') {
    authenticatorSelection.requireResidentKey = true;
  }

  return {
    attestation,
    // Only include authenticatorSelection if at least one of its members matched
    ...(Object.keys(authenticatorSelection).length > 0 && { authenticatorSelection }),
    challenge,
    // Only include excludeCredentials when the script lists credentials
    ...(excludeCredentials.length > 0 && { excludeCredentials }),
    pubKeyCredParams,
    rp: {
      name: rpName,
      // only add key-value pair if a truthy id value is provided
      ...(rpId && { id: rpId }),
    },
    // Only include timeout when the script provides one
    ...(timeout !== undefined && { timeout }),
    user: {
      displayName: userDisplayName,
      // AM builds the id with Uint8Array.from("...", (c) => c.charCodeAt(0)),
      // so the captured string is re-encoded one byte per char code
      // (NOT base64-decoded)
      id: new TextEncoder().encode(userIdLiteral),
      name: userName,
    },
  };
}

/**
 * Formats the credential returned by navigator.credentials.create() into the
 * AM expected outcome string:
 *   {clientDataJSON}::{attestationObject}::{rawId}
 *
 * The registration outcome has exactly three segments — no
 * signature/authenticatorData, no userHandle and no deviceName suffix. This
 * matches the footer AM's own asScript registration script generates.
 *
 * @param {PublicKeyCredential} credential
 * @returns {string}
 * @throws {Error} With name 'UnknownError' when the credential is null
 */
function formatRegistrationOutcome(credential) {
  if (credential === null) {
    const err = new Error('No credential generated from registration');
    err.name = 'UnknownError';
    throw err;
  }

  const clientDataJSON = new TextDecoder().decode(credential.response.clientDataJSON);
  const attestationObject = new Int8Array(credential.response.attestationObject).toString();
  return `${clientDataJSON}::${attestationObject}::${credential.id}`;
}

/**
 * Handles WebAuthn registration for asScript=true steps.
 *
 * Parses the JS script from the TextOutputCallback, calls
 * navigator.credentials.create() with the extracted options (never .get()),
 * formats the three-segment outcome string, and sets it on the
 * HiddenValueCallback.
 *
 * On any error, stamps "ERROR::{error.name}:{error.message}" on the
 * hidden callback and re-throws.
 *
 * @param {object} step - The AM step object
 * @returns {Promise<object>} Resolves with the step when registration succeeds
 */
async function registerWithAsScript(step) {
  const textCallback = findWebAuthnTextOutputCallback(step);
  const hiddenCallback = findWebAuthnHiddenCallback(step);

  if (!textCallback || !hiddenCallback) {
    const err = new Error(i18n.global.t('login.webAuthn.errorCallbacksNotFound'));
    if (hiddenCallback) {
      hiddenCallback.setInputValue(`ERROR::NotFoundError:${err.message}`);
    }
    throw err;
  }

  if (!window.PublicKeyCredential) {
    const err = new Error(i18n.global.t('login.webAuthn.errorNotSupported'));
    hiddenCallback.setInputValue(`ERROR::NotSupportedError:${err.message}`);
    throw err;
  }

  const scriptText = textCallback.getOutputValue('message') || textCallback.getMessage?.() || '';

  let options;
  try {
    options = parseRegistrationScript(scriptText);
  } catch (parseErr) {
    hiddenCallback.setInputValue(`ERROR::${parseErr.name}:${parseErr.message}`);
    throw parseErr;
  }

  try {
    const credential = await navigator.credentials.create({ publicKey: options });
    const outcome = formatRegistrationOutcome(credential);
    hiddenCallback.setInputValue(outcome);
    return step;
  } catch (err) {
    hiddenCallback.setInputValue(`ERROR::${err.name}:${err.message}`);
    throw err;
  }
}

export {
  authenticateWithAsScript,
  parseOptionsFromScript,
  formatOutcome,
  parseRegistrationScript,
  formatRegistrationOutcome,
  registerWithAsScript,
};
