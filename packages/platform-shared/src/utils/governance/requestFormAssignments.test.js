/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  createFormAssignment,
  deleteFormAssignment,
  getFormAssignmentByFormId,
  getFormAssignmentByRequestType,
  getFormAssignmentByWorkflowNode,
} from '@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi';
import { getRequestForm } from '@forgerock/platform-shared/src/api/governance/RequestFormsApi';
import {
  buildFormAssignmentPromises,
  deleteAllFormAssignments,
  getCustomRequestForm,
} from './requestFormAssignments';

jest.mock('@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi', () => ({
  getFormAssignmentByWorkflowNode: jest.fn(),
  deleteFormAssignment: jest.fn(),
  createFormAssignment: jest.fn(),
  getFormAssignmentByFormId: jest.fn(),
  getFormAssignmentByRequestType: jest.fn(),
}));

jest.mock('@forgerock/platform-shared/src/api/governance/RequestFormsApi', () => ({
  getRequestForm: jest.fn(),
}));

describe('buildFormAssignmentPromises', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an empty array if workflowId is not provided', async () => {
    const formUpdates = { node1: 'form1', node2: 'form2' };
    const result = await buildFormAssignmentPromises('', formUpdates);
    expect(result).toEqual([]);
  });

  it('should return an empty array if formUpdates is empty', async () => {
    const workflowId = 'workflow1';
    const result = await buildFormAssignmentPromises(workflowId, {});
    expect(result).toEqual([]);
  });

  it('should delete existing form assignment and create new assignment for each form update', async () => {
    const workflowId = 'workflow1';
    const formUpdates = { node1: 'form1', node2: 'form2' };
    const existingAssignment1 = { formId: 'form1', objectId: 'workflow/workflow1/node/node1' };
    const existingAssignment2 = { formId: 'form2', objectId: 'workflow/workflow1/node/node2' };

    getFormAssignmentByWorkflowNode.mockImplementation((worklowId, nodeId) => {
      if (nodeId === 'node1') return Promise.resolve({ data: { result: [existingAssignment1] } });
      if (nodeId === 'node2') return Promise.resolve({ data: { result: [existingAssignment2] } });
      return Promise.resolve({ data: { result: [] } });
    });

    await buildFormAssignmentPromises(workflowId, formUpdates);

    expect(getFormAssignmentByWorkflowNode).toHaveBeenCalledTimes(2);
    expect(getFormAssignmentByWorkflowNode).toHaveBeenCalledWith(workflowId, 'node1');
    expect(getFormAssignmentByWorkflowNode).toHaveBeenCalledWith(workflowId, 'node2');

    expect(deleteFormAssignment).toHaveBeenCalledTimes(2);
    expect(deleteFormAssignment).toHaveBeenCalledWith({ formId: 'form1', objectId: 'workflow/workflow1/node/node1' });
    expect(deleteFormAssignment).toHaveBeenCalledWith({ formId: 'form2', objectId: 'workflow/workflow1/node/node2' });

    expect(createFormAssignment).toHaveBeenCalledTimes(2);
    expect(createFormAssignment).toHaveBeenCalledWith({ formId: 'form1', objectId: 'workflow/workflow1/node/node1' });
    expect(createFormAssignment).toHaveBeenCalledWith({ formId: 'form2', objectId: 'workflow/workflow1/node/node2' });
  });

  it('should not create a new form assignment when form id is an empty string', async () => {
    const workflowId = 'workflow1';
    const formUpdates = { node1: '', node2: 'form2' };
    const existingAssignment1 = { formId: 'form1', objectId: 'workflow/workflow1/node/node1' };
    const existingAssignment2 = { formId: 'form2', objectId: 'workflow/workflow1/node/node2' };

    getFormAssignmentByWorkflowNode.mockImplementation((worklowId, nodeId) => {
      if (nodeId === 'node1') return Promise.resolve({ data: { result: [existingAssignment1] } });
      if (nodeId === 'node2') return Promise.resolve({ data: { result: [existingAssignment2] } });
      return Promise.resolve({ data: { result: [] } });
    });

    await buildFormAssignmentPromises(workflowId, formUpdates);

    expect(getFormAssignmentByWorkflowNode).toHaveBeenCalledTimes(2);
    expect(getFormAssignmentByWorkflowNode).toHaveBeenCalledWith(workflowId, 'node1');
    expect(getFormAssignmentByWorkflowNode).toHaveBeenCalledWith(workflowId, 'node2');

    expect(deleteFormAssignment).toHaveBeenCalledTimes(2);
    expect(createFormAssignment).toHaveBeenCalledTimes(1);
    expect(createFormAssignment).toHaveBeenCalledWith({ formId: 'form2', objectId: 'workflow/workflow1/node/node2' });
  });

  it('should delete all form assignments for a given form', async () => {
    const formId = 'form1';
    const existingAssignments = {
      data: {
        result: [
          { formId, objectId: 'workflow/workflow1/node/node1' },
          { formId, objectId: 'workflow/workflow1/node/node2' },
        ],
      },
    };

    getFormAssignmentByFormId.mockResolvedValue(existingAssignments);

    await deleteAllFormAssignments(formId);

    expect(getFormAssignmentByFormId).toHaveBeenCalledWith(formId);
    expect(deleteFormAssignment).toHaveBeenCalledWith({ formId, objectId: 'workflow/workflow1/node/node1' });
    expect(deleteFormAssignment).toHaveBeenCalledWith({ formId, objectId: 'workflow/workflow1/node/node2' });
  });

  it('not to call deleteFormAssignment if no assignments are found', async () => {
    const formId = 'form1';
    const existingAssignments = { data: { result: [] } };
    getFormAssignmentByFormId.mockResolvedValue(existingAssignments);

    await deleteAllFormAssignments(formId);

    expect(getFormAssignmentByFormId).toHaveBeenCalledWith(formId);
    expect(deleteFormAssignment).not.toHaveBeenCalled();
  });
});

describe('getCustomRequestForm', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the custom request form data if found', async () => {
    const requestTypeId = 'requestType1';
    const formId = 'form1';
    const formData = { id: formId, name: 'Custom Request Form' };

    const formAssignment = { formId };
    const formAssignmentResponse = { data: { result: [formAssignment] } };
    const getRequestFormResponse = { data: formData };

    getFormAssignmentByRequestType.mockResolvedValue(formAssignmentResponse);
    getRequestForm.mockResolvedValue(getRequestFormResponse);

    const result = await getCustomRequestForm(requestTypeId);

    expect(getFormAssignmentByRequestType).toHaveBeenCalledWith(requestTypeId);
    expect(getRequestForm).toHaveBeenCalledWith(formId);
    expect(result).toEqual(formData);
  });

  it('should return null if no custom request form is found', async () => {
    const requestTypeId = 'requestType1';

    const formAssignmentResponse = { data: { result: [] } };

    getFormAssignmentByRequestType.mockResolvedValue(formAssignmentResponse);

    const result = await getCustomRequestForm(requestTypeId);

    expect(getFormAssignmentByRequestType).toHaveBeenCalledWith(requestTypeId);
    expect(getRequestForm).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
