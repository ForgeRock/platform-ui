/**
 * Copyright 2024-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import * as WorkflowApi from '@forgerock/platform-shared/src/api/governance/WorkflowApi';
import {
  WORKFLOW_STATUS, filterWorkflows, getWorkflowDisplayName, sortCompareWorkflows,
} from './workflowUtils';

describe('workflowUtils', () => {
  it('getWorkflowDisplayName returns published display name', async () => {
    WorkflowApi.getWorkflow = jest.fn().mockReturnValue({
      data: { id: 'testWorkflow', displayName: 'Test Workflow' },
    });

    const result = await getWorkflowDisplayName('123');

    expect(result).toBe('Test Workflow');
    expect(WorkflowApi.getWorkflow).toHaveBeenCalledTimes(1);
    expect(WorkflowApi.getWorkflow).toHaveBeenCalledWith('123', WORKFLOW_STATUS.PUBLISHED);
  });

  it('getWorkflowDisplayName returns draft display name if does not exist a published version of the workflow', async () => {
    WorkflowApi.getWorkflow = jest.fn()
      .mockReturnValueOnce({ data: '' })
      .mockReturnValue({ data: { id: 'testWorkflow', displayName: 'Test Workflow' } });

    const result = await getWorkflowDisplayName('123');

    expect(result).toBe('Test Workflow');
    expect(WorkflowApi.getWorkflow).toHaveBeenCalledTimes(2);
    expect(WorkflowApi.getWorkflow).toHaveBeenCalledWith('123', WORKFLOW_STATUS.PUBLISHED);
    expect(WorkflowApi.getWorkflow).toHaveBeenCalledWith('123', WORKFLOW_STATUS.DRAFT);
  });

  it('getWorkflowDisplayName returns same workflow id if the draft version of the workflow does not have a display name', async () => {
    WorkflowApi.getWorkflow = jest.fn()
      .mockReturnValueOnce({ data: '' })
      .mockReturnValue({ data: { id: 'testWorkflow' } });

    const result = await getWorkflowDisplayName('123');

    expect(result).toBe('testWorkflow');
    expect(WorkflowApi.getWorkflow).toHaveBeenCalledTimes(2);
    expect(WorkflowApi.getWorkflow).toHaveBeenCalledWith('123', WORKFLOW_STATUS.PUBLISHED);
    expect(WorkflowApi.getWorkflow).toHaveBeenCalledWith('123', WORKFLOW_STATUS.DRAFT);
  });

  it('getWorkflowDisplayName returns same workflow id if there is no published or drag version', async () => {
    WorkflowApi.getWorkflow = jest.fn()
      .mockReturnValueOnce({ data: '' })
      .mockReturnValue({ data: '' });

    const result = await getWorkflowDisplayName('123');

    expect(result).toBe('123');
    expect(WorkflowApi.getWorkflow).toHaveBeenCalledTimes(2);
    expect(WorkflowApi.getWorkflow).toHaveBeenCalledWith('123', WORKFLOW_STATUS.PUBLISHED);
    expect(WorkflowApi.getWorkflow).toHaveBeenCalledWith('123', WORKFLOW_STATUS.DRAFT);
  });

  it('same workflow id is returned if there is an error fetching the published workflow', async () => {
    WorkflowApi.getWorkflow = jest.fn()
      .mockReturnValue(Promise.reject(new Error('Error fetching published workflow')));

    const result = await getWorkflowDisplayName('123');

    expect(result).toBe('123');
    expect(WorkflowApi.getWorkflow).toHaveBeenCalledTimes(1);
    expect(WorkflowApi.getWorkflow).toHaveBeenCalledWith('123', WORKFLOW_STATUS.PUBLISHED);
  });

  it('same workflow id is returned if there is an error fetching the draft workflow', async () => {
    WorkflowApi.getWorkflow = jest.fn()
      .mockReturnValueOnce({ data: '' })
      .mockReturnValue(Promise.reject(new Error('Error fetching draft workflow')));

    const result = await getWorkflowDisplayName('123');

    expect(result).toBe('123');
    expect(WorkflowApi.getWorkflow).toHaveBeenCalledTimes(2);
    expect(WorkflowApi.getWorkflow).toHaveBeenCalledWith('123', WORKFLOW_STATUS.PUBLISHED);
    expect(WorkflowApi.getWorkflow).toHaveBeenCalledWith('123', WORKFLOW_STATUS.DRAFT);
  });

  it('sortCompareWorkflows should compare the displayed names of the workflow field in the table', () => {
    const a = { displayName: 'Workflow A' };
    const b = { displayName: 'Workflow B' };
    const result = sortCompareWorkflows(a, b, 'workflow');
    expect(result).toBe(-1);
  });

  it('sortCompareWorkflows should not compare if the field in the table is not workflow', () => {
    const a = { displayName: 'Workflow A' };
    const b = { displayName: 'Workflow B' };
    const result = sortCompareWorkflows(a, b, 'status');
    expect(result).toBe(0);
  });

  it('filterworkflows should filter the data in the table by display name', () => {
    const filter = 'workflow a';
    const result = filterWorkflows({
      displayName: 'Workflow A',
    }, filter);
    expect(result).toBe(true);
  });

  it('filterworkflows should filter the data in the table by description', () => {
    const filter = 'test';
    const result = filterWorkflows({
      displayName: 'Workflow A',
      description: 'A workflow to test',
    }, filter);
    expect(result).toBe(true);
  });
});
