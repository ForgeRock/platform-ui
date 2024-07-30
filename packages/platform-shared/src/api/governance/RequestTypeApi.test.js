/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as RequestTypeApi from './RequestTypeApi';

const requestTypeUrl = '/governance/requestTypes';
const getMock = jest.fn();
BaseApi.generateIgaApi = jest.fn(() => ({
  get: getMock,
}));

describe('getCustomRequestTypes', () => {
  it('should call api with the correct query', async () => {
    const queryString = 'example';

    await RequestTypeApi.getCustomRequestTypes(queryString);
    expect(getMock).toBeCalledWith(`${requestTypeUrl}?_queryFilter=custom%20eq%20%22true%22%20and%20(id%20co%20%22example%22%20or%20displayName%20co%20%22example%22)`);
  });

  it('should call api without query if queryString is not provided', async () => {
    await RequestTypeApi.getCustomRequestTypes();
    expect(getMock).toBeCalledWith(`${requestTypeUrl}?_queryFilter=custom%20eq%20%22true%22`);
  });
});
