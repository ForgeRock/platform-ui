/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  AUTH_TYPES,
  classifyAuthenticationDeviceResponses,
} from './authenticationDeviceUtils';

function fulfilled(result) {
  return {
    status: 'fulfilled',
    value: { data: { result } },
  };
}

describe('authenticationDeviceUtils', () => {
  it('keeps authentication types in request order', () => {
    expect(AUTH_TYPES).toEqual(['oath', 'push', 'webauthn', 'recognize']);

    const response = classifyAuthenticationDeviceResponses(AUTH_TYPES.map(() => fulfilled([])));

    expect(response.responsesWithAuthTypes.map(({ authType }) => authType)).toEqual(AUTH_TYPES);
  });

  it('ignores a 404 rejection from Recognize', () => {
    const responses = [
      fulfilled([]),
      fulfilled([]),
      fulfilled([]),
      {
        status: 'rejected',
        reason: { response: { status: 404 } },
      },
    ];

    const response = classifyAuthenticationDeviceResponses(responses);

    expect(response.unexpectedResponses).toEqual([]);
  });

  it('retains a non-404 rejection as an unexpected response', () => {
    const reason = { response: { status: 500 } };
    const response = classifyAuthenticationDeviceResponses([
      fulfilled([]),
      fulfilled([]),
      fulfilled([]),
      { status: 'rejected', reason },
    ]);

    expect(response.unexpectedResponses).toEqual([
      { authType: 'recognize', response: { status: 'rejected', reason } },
    ]);
  });

  it('retains fulfilled responses with array results for component processing', () => {
    const devices = [{ _id: 'device-1' }];
    const response = classifyAuthenticationDeviceResponses([
      fulfilled(devices),
      fulfilled([]),
      fulfilled([]),
      fulfilled([]),
    ]);

    expect(response.validFulfilledResponses).toEqual([
      { authType: 'oath', response: fulfilled(devices) },
      { authType: 'push', response: fulfilled([]) },
      { authType: 'webauthn', response: fulfilled([]) },
      { authType: 'recognize', response: fulfilled([]) },
    ]);
  });

  it('treats a fulfilled response without an array result as unexpected', () => {
    const response = classifyAuthenticationDeviceResponses([
      { status: 'fulfilled', value: { data: {} } },
      fulfilled([]),
      fulfilled([]),
      fulfilled([]),
    ]);

    expect(response.validFulfilledResponses).toEqual([
      { authType: 'push', response: fulfilled([]) },
      { authType: 'webauthn', response: fulfilled([]) },
      { authType: 'recognize', response: fulfilled([]) },
    ]);
    expect(response.unexpectedResponses).toEqual([
      { authType: 'oath', response: { status: 'fulfilled', value: { data: {} } } },
    ]);
  });
});
