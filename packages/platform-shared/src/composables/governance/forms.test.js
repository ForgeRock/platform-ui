/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as requestFormAssignments from '@forgerock/platform-shared/src/utils/governance/requestFormAssignments';
import useForm from './forms';

jest.mock('@forgerock/platform-shared/src/utils/governance/requestFormAssignments');

describe('useForm composable', () => {
  const form = useForm();

  it('should initialize with default values', () => {
    expect(form.form.value).toBe(null);
    expect(form.formValue.value).toEqual({});
    expect(form.isLoadingForm.value).toBe(true);
    expect(form.isValidForm.value).toBe(true);
  });

  it('should set default form values', () => {
    form.form.value = { test: 'data' };
    form.formValue.value = { key: 'value' };
    form.isLoadingForm.value = false;
    form.isValidForm.value = false;

    form.setDefaultFormValues();

    expect(form.form.value).toBe(null);
    expect(form.formValue.value).toEqual({});
    expect(form.isLoadingForm.value).toBe(true);
    expect(form.isValidForm.value).toBe(true);
  });

  describe('getFormDefinitionByType', () => {
    const mockOptions = {
      application: 'app',
      applicationId: 'appId',
      workflowId: 'workflowId',
      phaseId: 'phaseId',
      requestTypeId: 'requestTypeId',
      lcmType: 'lcmType',
      operation: 'operation',
    };

    requestFormAssignments.getApplicationRequestForm.mockResolvedValue({ form: { fields: [] } });
    requestFormAssignments.getWorkflowRequestForm.mockResolvedValue({ form: { fields: [] } });
    requestFormAssignments.getCustomRequestForm.mockResolvedValue({ form: { fields: [] } });
    requestFormAssignments.getLcmForm.mockResolvedValue({ form: { fields: [] } });

    it('should fetch application form', async () => {
      await form.getFormDefinitionByType(form.formTypes.APPLICATION, mockOptions);

      expect(requestFormAssignments.getApplicationRequestForm).toHaveBeenCalledWith(mockOptions.application, mockOptions.applicationId);
      expect(form.form.value).toEqual({ form: { fields: [] } });
    });

    it('should fetch workflow form', async () => {
      await form.getFormDefinitionByType(form.formTypes.WORKFLOW, mockOptions);

      expect(requestFormAssignments.getWorkflowRequestForm).toHaveBeenCalledWith(mockOptions.workflowId, mockOptions.phaseId);
      expect(form.form.value).toEqual({ form: { fields: [] } });
    });

    it('should fetch custom form', async () => {
      await form.getFormDefinitionByType(form.formTypes.CUSTOM, mockOptions);

      expect(requestFormAssignments.getCustomRequestForm).toHaveBeenCalledWith(mockOptions.requestTypeId);
      expect(form.form.value).toEqual({ form: { fields: [] } });
    });

    it('should fetch LCM form and set initial model', async () => {
      await form.getFormDefinitionByType(form.formTypes.LCM, mockOptions);

      expect(requestFormAssignments.getLcmForm).toHaveBeenCalledWith(mockOptions.lcmType, mockOptions.operation);
      expect(form.form.value).toEqual({ form: { fields: [] } });
    });

    it('should handle errors and set form to null', async () => {
      requestFormAssignments.getApplicationRequestForm.mockRejectedValue(new Error('Error fetching form'));
      await form.getFormDefinitionByType(form.formTypes.APPLICATION, mockOptions);

      expect(form.form.value).toBe(null);
    });
  });
});
