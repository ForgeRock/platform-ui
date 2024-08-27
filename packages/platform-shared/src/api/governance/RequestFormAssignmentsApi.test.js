/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as RequestFormAssignmentsApi from './RequestFormAssignmentsApi';

const formAssignmentUrl = '/governance/requestFormAssignments';
const getMock = jest.fn();
const postMock = jest.fn();
BaseApi.generateIgaApi = jest.fn(() => ({
  get: getMock,
  post: postMock,
}));

describe('RequestFormAssignments Api', () => {
  it('createFormAssignment should call api with the correct payload', async () => {
    const params = { formId: '123', objectId: 'workflow/456/node/789' };

    await RequestFormAssignmentsApi.createFormAssignment(params);
    expect(postMock).toBeCalledWith(`${formAssignmentUrl}?_action=assign`, params);
  });

  it('deleteFormAssignment should call api with the correct payload', async () => {
    const params = { formId: '123', objectId: 'workflow/456/node/789' };

    await RequestFormAssignmentsApi.deleteFormAssignment(params);
    expect(postMock).toBeCalledWith(`${formAssignmentUrl}?_action=assign`, params);
  });

  it('getFormAssignmentByWorkflowNode should call api with the correct query', async () => {
    const workflowId = '123';
    const nodeId = '456';

    await RequestFormAssignmentsApi.getFormAssignmentByWorkflowNode(workflowId, nodeId);
    expect(getMock).toBeCalledWith(`${formAssignmentUrl}?_queryFilter=objectId eq "workflow/${workflowId}/node/${nodeId}"`);
  });

  it('getFormAssignmentByFormId should call api with the correct query', async () => {
    const formId = '123';

    await RequestFormAssignmentsApi.getFormAssignmentByFormId(formId);
    expect(getMock).toBeCalledWith(`${formAssignmentUrl}?_queryFilter=formId eq "${formId}"`);
  });

  it('getFormAssignmentByRequestType should call api with the correct query', async () => {
    const requestTypeId = '123';

    await RequestFormAssignmentsApi.getFormAssignmentByRequestType(requestTypeId);
    expect(getMock).toBeCalledWith(`${formAssignmentUrl}?_queryFilter=objectId eq "requestType/${requestTypeId}"`);
  });

  it('getFormRequestTypes should call api with the correct query', async () => {
    const formId = '123';

    await RequestFormAssignmentsApi.getFormRequestTypes(formId);
    expect(getMock).toBeCalledWith(`${formAssignmentUrl}?_queryFilter=objectId co "requestType/" and formId eq "${formId}"`);
  });

  it('getApplicationRequestFormAssignment should call api with the correct query', async () => {
    const appId = '123';
    const objectType = 'user';

    await RequestFormAssignmentsApi.getApplicationRequestFormAssignment(appId, objectType);
    expect(getMock).toBeCalledWith(`${formAssignmentUrl}?_queryFilter=objectId eq "application/${appId}/${objectType}/create"`);
  });
});

it('getFormApplications should call api with the correct query', async () => {
  const formId = '123';

  await RequestFormAssignmentsApi.getFormApplications(formId);
  expect(getMock).toBeCalledWith(`${formAssignmentUrl}?_queryFilter=objectId co "application/" and formId eq "${formId}"`);
});
