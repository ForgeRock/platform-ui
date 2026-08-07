/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export const AUTH_TYPES = ['oath', 'push', 'webauthn', 'recognize'];

function hasValidResult(response) {
  return response.status === 'fulfilled' && Array.isArray(response.value?.data?.result);
}

function isExpectedRejectedResponse(authType, response) {
  return authType === 'recognize' && response.reason?.response?.status === 404;
}

/**
 * Associates settled authentication-device responses with their request type and separates
 * valid results from failures that should be reported to the user.
 *
 * @param {Array} responseArray settled authentication-device responses in AUTH_TYPES order
 * @returns {Object} responses grouped by type and load outcome
 */
export function classifyAuthenticationDeviceResponses(responseArray) {
  const responsesWithAuthTypes = responseArray.map((response, index) => ({
    authType: AUTH_TYPES[index],
    response,
  }));
  const validFulfilledResponses = responsesWithAuthTypes.filter(({ response }) => hasValidResult(response));
  const unexpectedResponses = responsesWithAuthTypes.filter(({ authType, response }) => (
    !hasValidResult(response)
    && (response.status !== 'rejected' || !isExpectedRejectedResponse(authType, response))
  ));

  return {
    responsesWithAuthTypes,
    validFulfilledResponses,
    unexpectedResponses,
  };
}
