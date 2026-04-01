/**
 * Copyright 2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import * as WorkflowApi from './WorkflowApi';

const workflowUrl = '/orchestration/definition';
const deleteMock = jest.fn();
const getMock = jest.fn();
const postMock = jest.fn();
const putMock = jest.fn();
BaseApi.generateIgaOrchestrationApi = jest.fn(() => ({
  delete: deleteMock,
  get: getMock,
  post: postMock,
  put: putMock,
}));

describe('Workflow API', () => {
  it('getWorkflowList should call api with correct parameters', async () => {
    const params = { _pageSize: 100 };

    await WorkflowApi.getWorkflowList(params);

    expect(getMock).toBeCalledWith(`${workflowUrl}${encodeQueryString(params)}`);
  });

  it('getWorkflow should call api with correct parameters', async () => {
    const workflowId = '123';
    const workflowStatus = 'draft';

    await WorkflowApi.getWorkflow(workflowId, workflowStatus, {});

    expect(getMock).toBeCalledWith(`${workflowUrl}/${workflowId}/${workflowStatus}`);
  });

  it('createDraftWorkflow should call api with correct parameters', async () => {
    const workflow = { id: 'saveId' };

    await WorkflowApi.createDraftWorkflow(workflow);

    expect(postMock).toBeCalledWith(`${workflowUrl}?_action=create`, workflow);
  });

  it('validateDraftWorkflow should call api with correct parameters', async () => {
    const workflow = { id: 'saveId' };

    await WorkflowApi.validateDraftWorkflow(workflow);

    expect(postMock).toBeCalledWith(`${workflowUrl}?_action=validate`, workflow);
  });

  it('publishDraftWorkflow should call api with correct parameters', async () => {
    const workflow = { id: 'saveId' };

    await WorkflowApi.publishDraftWorkflow(workflow);

    expect(postMock).toBeCalledWith(`${workflowUrl}?_action=publish`, workflow);
  });

  it('create workflow should call api with correct parameters', async () => {
    const workflow = { name: 'workflow name test' };

    await WorkflowApi.createDraftWorkflow(workflow);

    expect(postMock).toBeCalledWith(`${workflowUrl}?_action=create`, workflow);
  });

  it('updateDraftWorkflow should call api with correct parameters', async () => {
    const workflowId = '123';
    const workflow = { id: 'saveId' };

    await WorkflowApi.updateDraftWorkflow(workflowId, workflow);

    expect(putMock).toBeCalledWith(`${workflowUrl}/${workflowId}`, workflow);
  });

  it('deleteDraftWorkflow should call api with correct parameters', async () => {
    const workflowId = '123';

    await WorkflowApi.deleteDraftWorkflow(workflowId);

    expect(deleteMock).toBeCalledWith(`${workflowUrl}/${workflowId}/draft`);
  });

  it('deletePublishedWorkflow should call api with correct parameters', async () => {
    const workflowId = '123';

    await WorkflowApi.deletePublishedWorkflow(workflowId);

    expect(deleteMock).toBeCalledWith(`${workflowUrl}/${workflowId}/published`);
  });
});
