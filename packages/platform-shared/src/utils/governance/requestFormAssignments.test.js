/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  createFormAssignment,
  deleteFormAssignment,
  getApplicationFormAssignments,
  getApplicationRequestFormAssignment,
  getFormAssignmentByFormId,
  getFormAssignmentByRequestType,
  getFormAssignmentByWorkflowNode,
  getFormAssignmentByLcmOperation,
} from '@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi';
import { getRequestForm } from '@forgerock/platform-shared/src/api/governance/RequestFormsApi';
import {
  buildFormAssignmentPromises,
  deleteAllFormAssignments,
  getApplicationRequestForm,
  getCustomRequestForm,
  getLcmForm,
} from './requestFormAssignments';

jest.mock('@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi', () => ({
  getFormAssignmentByWorkflowNode: jest.fn(),
  deleteFormAssignment: jest.fn(),
  createFormAssignment: jest.fn(),
  getFormAssignmentByFormId: jest.fn(),
  getFormAssignmentByRequestType: jest.fn(),
  getFormAssignmentByLcmOperation: jest.fn(),
  getApplicationRequestFormAssignment: jest.fn(),
  getApplicationFormAssignments: jest.fn(),
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

  describe('getLcmForm', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return the LCM form data if found', async () => {
      const lcmType = 'lcmType1';
      const operation = 'operation1';
      const formId = 'form1';
      const formData = { id: formId, name: 'LCM Form' };

      const formAssignment = { formId };
      const formAssignmentResponse = { data: { result: [formAssignment] } };
      const getRequestFormResponse = { data: formData };

      getFormAssignmentByLcmOperation.mockResolvedValue(formAssignmentResponse);
      getRequestForm.mockResolvedValue(getRequestFormResponse);

      const result = await getLcmForm(lcmType, operation);

      expect(getFormAssignmentByLcmOperation).toHaveBeenCalledWith(lcmType, operation);
      expect(getRequestForm).toHaveBeenCalledWith(formId);
      expect(result).toEqual(formData);
    });

    it('should return null if no LCM form is found', async () => {
      const lcmType = 'lcmType1';
      const operation = 'operation1';

      const formAssignmentResponse = { data: { result: [] } };

      getFormAssignmentByLcmOperation.mockResolvedValue(formAssignmentResponse);

      const result = await getLcmForm(lcmType, operation);

      expect(getFormAssignmentByLcmOperation).toHaveBeenCalledWith(lcmType, operation);
      expect(getRequestForm).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null if an error occurs', async () => {
      const lcmType = 'lcmType1';
      const operation = 'operation1';

      getFormAssignmentByLcmOperation.mockRejectedValue(new Error('Error fetching LCM form assignment'));

      const result = await getLcmForm(lcmType, operation);

      expect(getFormAssignmentByLcmOperation).toHaveBeenCalledWith(lcmType, operation);
      expect(getRequestForm).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});

describe('getApplicationRequestForm', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should derive the object type from the inbound user mapping when not provided', async () => {
    getApplicationRequestFormAssignment.mockResolvedValue({ data: { result: [{ formId: 'form1' }] } });
    getRequestForm.mockResolvedValue({ data: { id: 'form1', name: 'App Form' } });

    const result = await getApplicationRequestForm({
      connectorId: 'Ldap',
      objectTypes: [{ name: '__ACCOUNT__' }],
      mappingNames: ['systemLdap__ACCOUNT___managedAlpha_user'],
    }, 'app1', null, 'create');

    expect(getApplicationRequestFormAssignment).toHaveBeenCalledWith('app1', '__ACCOUNT__', 'create');
    expect(getRequestForm).toHaveBeenCalledWith('form1');
    expect(result).toEqual({ id: 'form1', name: 'App Form' });
  });

  it('matches mapping names case-insensitively against the connector id', async () => {
    getApplicationRequestFormAssignment.mockResolvedValue({ data: { result: [{ formId: 'form1' }] } });
    getRequestForm.mockResolvedValue({ data: { id: 'form1' } });

    // master's regex required a capitalized connectorId — a lowercase one matched nothing
    const result = await getApplicationRequestForm({
      connectorId: 'ldap',
      objectTypes: [{ name: '__ACCOUNT__' }],
      mappingNames: ['systemldap__ACCOUNT___managedAlpha_user'],
    }, 'app1', null, 'create');

    expect(getApplicationRequestFormAssignment).toHaveBeenCalledWith('app1', '__ACCOUNT__', 'create');
    expect(result).toEqual({ id: 'form1' });
  });

  it('matches non-Alpha managed user mappings (generic _user suffix)', async () => {
    getApplicationRequestFormAssignment.mockResolvedValue({ data: { result: [{ formId: 'form2' }] } });
    getRequestForm.mockResolvedValue({ data: { id: 'form2' } });

    // master's regex only accepted managedAlpha_user suffixes
    const result = await getApplicationRequestForm({
      connectorId: 'Ldap',
      objectTypes: [{ name: '__ACCOUNT__' }],
      mappingNames: ['systemLdap__ACCOUNT___managedLdap_user'],
    }, 'app1', null, 'create');

    expect(getApplicationRequestFormAssignment).toHaveBeenCalledWith('app1', '__ACCOUNT__', 'create');
    expect(result).toEqual({ id: 'form2' });
  });

  it('returns the first canonicalized mapping when several inbound user mappings exist', async () => {
    getApplicationRequestFormAssignment.mockResolvedValue({ data: { result: [] } });

    // master returned null when more than one inbound user mapping matched
    const result = await getApplicationRequestForm({
      connectorId: 'Ldap',
      objectTypes: [{ name: '__ACCOUNT__' }],
      mappingNames: [
        'systemLdap__ACCOUNT___managedAlpha_user',
        'systemLdap__ACCOUNT2___managedAlpha_user',
      ],
    }, 'app1', null, 'create');

    expect(getApplicationRequestFormAssignment).toHaveBeenCalledWith('app1', '__ACCOUNT__', 'create');
    expect(result).toBeNull();
  });

  it('should fall back to any application assignment when no object type is derivable', async () => {
    getApplicationFormAssignments.mockResolvedValue({
      data: {
        result: [{ objectId: 'application/app1/__ACCOUNT__/update', formId: 'form2' }, { objectId: 'application/app1/__ACCOUNT__/create', formId: 'form1' }],
      },
    });
    getRequestForm.mockResolvedValue({ data: { id: 'form1', name: 'App Form' } });

    const result = await getApplicationRequestForm(
      { isDisconnected: true },
      'app1',
      null,
      'create',
    );

    expect(getApplicationRequestFormAssignment).not.toHaveBeenCalled();
    expect(getApplicationFormAssignments).toHaveBeenCalledWith('app1');
    expect(getRequestForm).toHaveBeenCalledWith('form1');
    expect(result).toEqual({ id: 'form1', name: 'App Form' });
  });

  it('should fall back to the only assignment when none match the operation', async () => {
    getApplicationFormAssignments.mockResolvedValue({
      data: {
        result: [{ objectId: 'application/app1/Disco/create', formId: 'form3' }],
      },
    });
    getRequestForm.mockResolvedValue({ data: { id: 'form3', name: 'Disco Form' } });

    const result = await getApplicationRequestForm({ isDisconnected: true }, 'app1', null, 'update');

    expect(getRequestForm).toHaveBeenCalledWith('form3');
    expect(result).toEqual({ id: 'form3', name: 'Disco Form' });
  });

  it('should return null when the disconnected app has no assigned forms', async () => {
    getApplicationFormAssignments.mockResolvedValue({ data: { result: [] } });

    const result = await getApplicationRequestForm({ isDisconnected: true }, 'app1', null, 'create');

    expect(getApplicationFormAssignments).toHaveBeenCalledWith('app1');
    expect(getRequestForm).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should use the provided object type and skip derivation', async () => {
    const result = await getApplicationRequestForm({
      connectorId: 'Ldap',
      mappingNames: ['systemLdap__GROUP__managedLdap_group'],
    }, 'app1', '__ACCOUNT__', 'update');

    expect(getApplicationRequestFormAssignment).toHaveBeenCalledWith('app1', '__ACCOUNT__', 'update');
    expect(result).toBeNull();
  });
});
