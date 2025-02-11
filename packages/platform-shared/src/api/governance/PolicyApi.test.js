/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as PolicyApi from './PolicyApi';

const policyUrl = '/governance/policy';
const deleteMock = jest.fn();
const getMock = jest.fn();
const putMock = jest.fn();
const postMock = jest.fn();
BaseApi.generateIgaApi = jest.fn(() => ({
  delete: deleteMock,
  get: getMock,
  put: putMock,
  post: postMock,
}));

describe('Policy API', () => {
  it('getPolicyList should call api with correct parameters', async () => {
    const params = { page: 1 };

    await PolicyApi.getPolicyList(params);

    expect(postMock).toBeCalledWith(`${policyUrl}/search${encodeQueryString(params)}`);
  });

  it('getPolicyRuleList should call api with correct parameters', async () => {
    const params = { page: 1 };

    await PolicyApi.getPolicyRuleList(params);

    expect(postMock).toBeCalledWith(`${policyUrl}/rule/search${encodeQueryString(params)}`);
  });
});
