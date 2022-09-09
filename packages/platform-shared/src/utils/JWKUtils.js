/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as jose from 'jose'; // TODO: perhaps use https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API as alternative to jose

/**
 * Generates a JSON web key using the RS256 specification
 * @returns the generated Public key
 */
async function generateKeyPair() {
  const key = await jose.generateKeyPair('RS256', { extractable: true, modulusLength: 4096 });
  return key;
}

/**
 * Takes the given CryptoKey public key and exports as a JWK
 * @param {CryptoKey} publicKey
 * @returns the public key JWK
 */
async function getPublicKey(publicKey) {
  return jose.exportJWK(publicKey);
}

/**
 * Takes the given CryptoKey private key and exports as a JWK
 * @param {CryptoKey} privateKey
 * @returns the private key JWK
 */
async function getPrivateKey(privateKey) {
  return jose.exportJWK(privateKey);
}

/**
 * Builds a JWKS out of the given json web keys
 * @param {List} jwkList list of json web keys that we want to build a set of
 * @returns json web key set containing the given json web keys
 */
function buildJwkSet(jwkList) {
  if (!jwkList) throw Error('Something went wrong. Please provide a valid list of json web keys.');
  return {
    keys: [
      ...jwkList,
    ],
  };
}

export {
  generateKeyPair,
  getPublicKey,
  getPrivateKey,
  buildJwkSet,
};
