<!-- Copyright (c) 2025-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard>
    <FrSpinner
      v-if="isLoadingForm"
      class="py-5" />
    <FrFormBuilder
      v-else-if="form && !userStore.adminUser"
      v-model:model-value="formValue"
      :form="form.form"
      :read-only="readOnly"
      @is-valid="isValidForm = $event"
      @update:model-value="handleFormValueUpdate" />
    <FrDefaultEntitlementForm
      v-else
      show-details
      :application-id="applicationId"
      :object-type="objectType"
      :entitlement="entitlement"
      :read-only="readOnly"
      @update:glossaryValues="glossaryValues = $event"
      @update:entitlementValues="entitlementValues = $event" />
    <template #footer>
      <FrButtonWithSpinner
        class="d-block ml-auto"
        variant="primary"
        :disabled="readOnly || isSaving"
        :show-spinner="isSaving"
        @click="submitRequest" />
    </template>
  </BCard>
  <FrRequestSubmitSuccessModal
    :request-id="requestId"
    :router-path="entitlementPath"
    :success-text="$t('governance.entitlements.modifySuccess')" />
</template>

<script setup>
/**
 * Displays the details tab for an entitlement.
 * Allows the user to edit the glossary and entitlement values.
 * Saving submits a request to modify the entitlement.
 */
import { computed, ref } from 'vue';
import { BCard } from 'bootstrap-vue';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import { submitCustomRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrDefaultEntitlementForm from '@forgerock/platform-shared/src/components/governance/DefaultEntitlementForm';
import FrFormBuilder from '@forgerock/platform-shared/src/components/FormEditor/FormBuilder';
import FrRequestSubmitSuccessModal from '@forgerock/platform-shared/src/components/governance/LCM/RequestSubmitSuccessModal';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import useForm from '@forgerock/platform-shared/src/composables/governance/forms';
import i18n from '@/i18n';

const userStore = useUserStore();

const {
  isLoadingForm,
  isValidForm,
  form,
  formTypes,
  formValue,
  getFormDefinitionByType,
} = useForm();

const props = defineProps({
  entitlement: {
    type: Object,
    default: () => ({}),
  },
});
const { bvModal } = useBvModal();
const isSaving = ref(null);
const entitlementValues = ref({});
const glossaryValues = ref({});
const MODIFY_ENTITLEMENT_REQUEST_TYPE = 'modifyEntitlement';
const requestId = ref('');

const entitlementPath = computed(() => (userStore.adminUser ? 'Entitlements' : 'AdministerEntitlements'));
const readOnly = computed(() => (!props.entitlement?.permissions?.modifyEntitlement));
const applicationId = computed(() => props.entitlement?.application?.id);
const objectType = computed(() => props.entitlement?.item?.objectType);

/**
 * Splits the FormBuilder model value into entitlement and glossary values.
 * @param {Object} object - Entitlement field values keyed by field name.
 * @param {Object} glossary - Glossary field values keyed by attribute name.
 */
function handleFormValueUpdate({ object = {}, glossary = {}, ...rest } = {}) {
  entitlementValues.value = { ...object, ...rest };
  glossaryValues.value = glossary;
}

function showSuccessModal() {
  bvModal.value.show('successful-submit');
}

/**
 * Submits a modifyEntitlement request with values from the forms
 */
async function submitRequest() {
  isSaving.value = true;
  try {
    const requestPayload = {
      common: {},
      custom: {},
      entitlement: {
        entitlementId: props.entitlement.id,
        glossary: glossaryValues.value,
        object: entitlementValues.value,
      },
    };
    if (userStore.adminUser) {
      requestPayload.common.context = {
        type: 'admin',
      };
    }
    const { data } = await submitCustomRequest(MODIFY_ENTITLEMENT_REQUEST_TYPE, requestPayload);
    requestId.value = data.id;
    showSuccessModal();
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.entitlements.errorSubmittingRequest'));
  } finally {
    isSaving.value = false;
  }
}

/**
 * Initializes the form with necessary data and configurations.
 * Gets a form if it exists, otherwise uses the default entitlement form.
 */
async function initializeForm() {
  // get form definition
  const options = {
    applicationId: applicationId.value,
    operation: 'update',
    setInitialModel: false,
    application: props.entitlement?.application,
    objectType: objectType.value,
  };
  await getFormDefinitionByType(formTypes.APPLICATION, options);
  isLoadingForm.value = false;
  const glossary = props.entitlement?.glossary?.idx?.['/entitlement'] || {};
  formValue.value = {
    object: { ...props.entitlement.entitlement },
    glossary,
  };
  entitlementValues.value = { ...props.entitlement.entitlement };
  glossaryValues.value = glossary;
}

initializeForm();
</script>
