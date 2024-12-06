/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import * as RequestFormsApi from './RequestFormsApi';

const formsUrl = '/governance/requestForms';
const getMock = jest.fn();
const deleteMock = jest.fn();
const putMock = jest.fn();
const patchMock = jest.fn();

BaseApi.generateIgaApi = jest.fn(() => ({
  get: getMock,
  delete: deleteMock,
  put: putMock,
  patch: patchMock,
}));
describe('FormsApi', () => {
  it('getForm should call api with correct parameters', async () => {
    const id = 'TestForm';

    await RequestFormsApi.getRequestForm(id);

    expect(getMock).toBeCalledWith(`${formsUrl}/${id}`);
  });

  it('getFormList should call api with correct parameters', async () => {
    const params = { page: 1, queryFilter: true };

    await RequestFormsApi.getFormList(params);

    expect(getMock).toBeCalledWith(`${formsUrl}${encodeQueryString(params)}`);
  });

  it('deleteForm should call api with correct parameters', async () => {
    const formId = '123';

    await RequestFormsApi.deleteForm(formId);

    expect(deleteMock).toBeCalledWith(`${formsUrl}/${formId}`);
  });

  it('saveForm should call api with correct parameters', async () => {
    const form = { id: '123' };

    await RequestFormsApi.saveForm(form);

    expect(putMock).toBeCalledWith(`${formsUrl}/${form.id}`, form);
  });

  it('patchForm should call api with correct parameters', async () => {
    const formId = '123';
    const payload = { prop: 'value' };

    await RequestFormsApi.patchForm(formId, payload);

    expect(patchMock).toBeCalledWith(`${formsUrl}/${formId}`, payload);
  });
});
