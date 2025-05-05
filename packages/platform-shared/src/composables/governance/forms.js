/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import {
  getApplicationRequestForm,
  getCustomRequestForm,
  getLcmForm,
  getWorkflowRequestForm,
} from '@forgerock/platform-shared/src/utils/governance/requestFormAssignments';
import { getInitialModel } from '@forgerock/platform-shared/src/components/FormEditor/utils/formGeneratorSchemaTransformer';

export default function useForm() {
  const form = ref(null);
  const formValue = ref({});
  const isLoadingForm = ref(true);
  const isValidForm = ref(true);

  const formTypes = Object.freeze({
    APPLICATION: 'application',
    WORKFLOW: 'workflow',
    CUSTOM: 'custom',
    LCM: 'lcm',
  });

  /**
   * Asynchronously retrieves a form definition based on the specified type and options.
   *
   * @param {string} type - The type of form to retrieve. Must be one of the values in `formTypes`.
   * @param {Object} options - The options required to fetch the form definition.
   */
  async function getFormDefinitionByType(type, options) {
    try {
      switch (type) {
        case formTypes.APPLICATION:
          form.value = await getApplicationRequestForm(options.application, options.applicationId);
          break;
        case formTypes.WORKFLOW:
          form.value = await getWorkflowRequestForm(options.workflowId, options.phaseId);
          break;
        case formTypes.CUSTOM:
          form.value = await getCustomRequestForm(options.requestTypeId);
          break;
        case formTypes.LCM:
          form.value = await getLcmForm(options.lcmType, options.operation);
          break;
        default:
          break;
      }
      if (form.value && options.setInitialModel) formValue.value = getInitialModel(form.value.form?.fields, true);
    } catch {
      form.value = null;
    }
  }

  /**
   * Resets the form state to its default values.
   */
  function setDefaultFormValues() {
    form.value = null;
    formValue.value = {};
    isLoadingForm.value = true;
    isValidForm.value = true;
  }

  return {
    form,
    formTypes,
    formValue,
    isLoadingForm,
    isValidForm,
    getFormDefinitionByType,
    setDefaultFormValues,
  };
}
