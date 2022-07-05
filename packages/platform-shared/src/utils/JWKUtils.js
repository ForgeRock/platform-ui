/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as jose from 'jose';

/**
 * Generates a JSON web key using the RS256 specification
 * @returns the generated Public key
 */
async function generatePublicKey() {
  const key = await jose.generateKeyPair('RS256');
  const publicKey = await jose.exportJWK(key.publicKey);
  return publicKey;
}

export default generatePublicKey;
