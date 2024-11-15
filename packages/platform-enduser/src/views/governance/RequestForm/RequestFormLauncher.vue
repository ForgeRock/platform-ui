<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrNavbar>
      <template #center-content>
        <h1 class="h5 mb-0 mr-2 d-inline-block">
          {{ $t('governance.requestForm.title') }}
        </h1>
      </template>
    </FrNavbar>
    <BContainer class="my-5">
      <BCard>
        <template v-if="loadingForm">
          <FrSpinner
            class="p-3 m-3"
            size="lg" />
          <div class="text-center pb-3">
            {{ $t('governance.requestForm.loadingForm') }}
          </div>
        </template>
        <template v-else>
          <div v-if="errorMsg">
            <div class="alert alert-danger">
              {{ errorMsg }}
            </div>
          </div>
          <template v-else>
            <FrFormBuilder
              v-model:model-value="formValue"
              :schema="form.form?.fields"
              @is-valid="isValid = $event"
              include-defaults />
            <div class="d-flex justify-content-end">
              <FrButtonWithSpinner
                :button-text="$t('governance.requestForm.submitRequest')"
                :spinner-text="$t('governance.requestForm.submitting')"
                :show-spinner="submittingRequest"
                :disabled="!isValid || submittingRequest"
                variant="primary"
                @click="submitRequest()" />
            </div>
          </template>
        </template>
      </BCard>
    </BContainer>
  </div>
</template>

<script setup>
/**
 * @description Componenent used to submit a custom request with values gathered by a request form.
 */
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  BCard,
  BContainer,
} from 'bootstrap-vue';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrFormBuilder from '@forgerock/platform-shared/src/components/FormEditor/FormBuilder';
import FrNavbar from '@forgerock/platform-shared/src/components/Navbar';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { getRequestForm } from '@forgerock/platform-shared/src/api/governance/RequestFormsApi';
import { getFormRequestTypes } from '@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi';
import { submitCustomRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getInitialModel } from '@forgerock/platform-shared/src/components/FormEditor/utils/formGeneratorSchemaTransformer';
import i18n from '@/i18n';

// composables
const { setBreadcrumb } = useBreadcrumb();
const route = useRoute();
const router = useRouter();

// data
const { formId } = route.params;
const errorMsg = ref('');
const form = ref({});
const formValue = ref({});
const isValid = ref(false);
const loadingForm = ref(true);
const requestType = ref('');
const submittingRequest = ref(false);

setBreadcrumb('/my-requests', 'Back');

/**
 * Loads the form based on the form id in the route parameter.
 * Checks to see if a request type is assigned to the form.
 */
async function loadForm() {
  loadingForm.value = true;
  try {
    const { data: formDefinition } = await getRequestForm(formId);
    form.value = formDefinition;
    formValue.value = getInitialModel(formDefinition.form?.fields, true);

    const { data: formAssignment } = await getFormRequestTypes(formId);
    if (formAssignment.result.length) {
      requestType.value = formAssignment.result[0].objectId.split('/').pop();
    } else {
      errorMsg.value = i18n.global.t('governance.requestForm.noRequestTypeFound');
    }
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.requestForm.errorGettingForm'));
  } finally {
    loadingForm.value = false;
  }
}

/**
 * Submits a custom request with values from the form.
 */
async function submitRequest() {
  submittingRequest.value = true;
  try {
    const requestBody = {
      common: {},
      custom: {},
      ...formValue.value,
    };
    await submitCustomRequest(requestType.value, requestBody);
    displayNotification('success', i18n.global.t('governance.requestForm.requestSubmitted'));
    router.push('/my-requests');
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.requestForm.errorSubmittingRequest'));
  } finally {
    submittingRequest.value = false;
  }
}

loadForm();

</script>
