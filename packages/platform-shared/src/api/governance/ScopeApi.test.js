/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import * as ScopeApi from './ScopeApi';

const scopeUrl = '/governance/scope';
const deleteMock = jest.fn();
const getMock = jest.fn();
const patchMock = jest.fn();
const postMock = jest.fn();
BaseApi.generateIgaApi = jest.fn(() => ({
  delete: deleteMock,
  get: getMock,
  patch: patchMock,
  post: postMock,
}));

describe('Scope API', () => {
  it('createScope should call api with correct parameters', async () => {
    const newScope = { status: 'active' };
    const params = { _action: 'create' };

    await ScopeApi.createScope(newScope);

    expect(postMock).toBeCalledWith(`${scopeUrl}${encodeQueryString(params)}`, newScope);
  });
  it('getScopeList should call api with correct parameters', async () => {
    const params = { page: 1 };

    await ScopeApi.getScopeList(params);

    expect(getMock).toBeCalledWith(`${scopeUrl}${encodeQueryString(params)}`);
  });
  it('getScope should call api with correct parameters', async () => {
    const scopeId = 'scopeId';

    await ScopeApi.getScope(scopeId);

    expect(getMock).toBeCalledWith(`${scopeUrl}/${scopeId}`);
  });
  it('getFilterProperties should call api with correct parameters', async () => {
    const resourceName = 'catalog';

    await ScopeApi.getFilterProperties(resourceName);

    expect(getMock).toBeCalledWith(`${scopeUrl}/entity/${resourceName}`);
  });
  it('updateScope should call api with correct parameters', async () => {
    const update = { status: 'active' };
    const scopeId = '123';

    await ScopeApi.updateScope(scopeId, update);

    expect(patchMock).toBeCalledWith(`${scopeUrl}/${scopeId}`, update);
  });

  it('deleteScope should call api with correct parameters', async () => {
    const scopeId = '123';

    await ScopeApi.deleteScope(scopeId);

    expect(deleteMock).toBeCalledWith(`${scopeUrl}/${scopeId}`);
  });
});
