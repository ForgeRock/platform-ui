/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * @description Pulls out subject name from claims object's sub value, which can be either in
 * the form of `<subjectName>` or `(<claimType>!<subjectName>)`
 * @param {Object} claims - The object provided by the tokens available handler
 * @returns sub - subject of the java web token (JWT)
 */
export default function parseSub(claims) {
  const subParts = claims.sub.match(/^\((\w{3})!(.+)\)$/);
  let sub;
  if (subParts) {
    // eslint-disable-next-line prefer-destructuring
    sub = subParts[2];
  } else {
    sub = claims.sub;
  }
  return sub;
}
