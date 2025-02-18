<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid }}"
    as="span">
    <BModal
      id="add-entitlement-modal"
      size="lg"
      no-close-on-backdrop
      no-close-on-esc
      title-class="h5"
      title-tag="h2"
      :header-class="modalProperties.customHeader ? 'p-3' : ''"
      :static="isTesting"
      :title="modalProperties.title"
      @hidden="resetModal">
      <!-- header -->
      <template
        v-if="modalProperties.customHeader"
        #modal-header="{ close }">
        <div class="w-100 d-flex">
          <BMedia
            class="align-items-center position-relative"
            no-body>
            <BMediaAside class="align-self-center">
              <img
                class="d-flex justify-content-center align-items-center"
                height="36"
                :src="getApplicationLogo(application)"
                :alt="$t('common.logo')">
            </BMediaAside>
            <BMediaBody class="align-self-center overflow-hidden text-nowrap">
              <small class=" mb-0">
                {{ $t('governance.entitlements.newEntitlementTitle', { appName: getApplicationDisplayName(application), objectType }) }}
              </small>
              <h2 class="h5 modal-title mb-0">
                {{ $t('governance.entitlements.entitlementDetails') }}
              </h2>
            </BMediaBody>
          </BMedia>
          <BButtonClose
            class="ml-auto pt-0"
            variant="link"
            @click="close">
            <FrIcon
              icon-class="md-24"
              name="close" />
          </BButtonClose>
        </div>
      </template>

      <!-- body -->
      <FrAppAndObjectType
        v-if="step === 0"
        @selected:application="application = $event"
        @input="updateAppAndObjectType" />
      <FrDefaultEntitlementForm
        v-if="step === 1"
        type="CREATE"
        :application-id="applicationId"
        :object-type="objectType"
        @update:glossaryValues="glossaryValues = $event"
        @update:entitlementValues="entitlementValues = $event" />
      <FrRequestSubmitSuccess
        v-if="step === 2"
        :request-id="requestId"
        :success-text="$t('governance.entitlements.createSuccess')" />

      <!-- footer -->
      <template #modal-footer="{ cancel, ok }">
        <BButton
          v-if="step === 1"
          variant="link"
          @click="resetModal">
          {{ $t('common.previous') }}
        </BButton>
        <BButton
          v-if="step !== 2"
          class="ml-auto"
          variant="link"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          :disabled="!valid || isSaving"
          :variant="modalProperties.buttonVariant"
          :button-text="modalProperties.buttonText"
          :spinner-text="$t('common.submitting')"
          :show-spinner="isSaving"
          @click="nextStep(ok)" />
      </template>
    </BModal>
  </VeeForm>
</template>
<script setup>
import { computed, ref } from 'vue';
import { Form as VeeForm } from 'vee-validate';
import {
  BButton,
  BButtonClose,
  BModal,
} from 'bootstrap-vue';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { submitCustomRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { getApplicationLogo, getApplicationDisplayName } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrDefaultEntitlementForm from '@forgerock/platform-shared/src/components/governance/DefaultEntitlementForm';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrAppAndObjectType from '@/views/governance/LCM/Entitlements/Add/Steps/AppAndObjectType';
import FrRequestSubmitSuccess from '@/views/governance/LCM/RequestSubmitSuccess';
import i18n from '@/i18n';

defineProps({
  isTesting: {
    type: Boolean,
    default: false,
  },
});

const application = ref({});
const applicationId = ref('');
const isSaving = ref(false);
const objectType = ref('');
const requestId = ref('');
const step = ref(0);

const entitlementValues = ref({});
const glossaryValues = ref({});
const CREATE_ENTITLEMENT_REQUEST_TYPE = 'createEntitlement';

const modalProperties = computed(() => {
  if (step.value === 0) {
    return {
      buttonText: i18n.global.t('common.next'),
      buttonVariant: 'primary',
      title: i18n.global.t('governance.entitlements.newEntitlement'),
    };
  }
  if (step.value === 1) {
    return {
      customHeader: true,
      buttonText: i18n.global.t('common.submit'),
      buttonVariant: 'primary',
    };
  }
  return {
    buttonText: i18n.global.t('common.done'),
    buttonVariant: 'outline-primary',
    title: '',
  };
});

/**
 * Resets the state of the modal.
 */
function resetModal() {
  application.value = {};
  applicationId.value = '';
  isSaving.value = false;
  objectType.value = '';
  requestId.value = '';
  step.value = 0;
  entitlementValues.value = {};
  glossaryValues.value = {};
}

/**
 * Update the selected application ID and object type
 * @param {Object} value - application id and object type values.
 */
function updateAppAndObjectType(value) {
  applicationId.value = value?.applicationId || '';
  objectType.value = value?.objectType || '';
}

/**
 * Submits an access request to create a new entitlement.
 * @returns {Promise<void>} A promise that resolves when the request has been submitted.
 */
async function submitRequest() {
  const requestPayload = {
    common: {},
    custom: {},
    entitlement: {
      applicationId: applicationId.value,
      objectType: objectType.value,
      glossary: glossaryValues.value,
      object: entitlementValues.value,
    },
  };
  return submitCustomRequest(CREATE_ENTITLEMENT_REQUEST_TYPE, requestPayload);
}

/**
 * Proceeds to the next step in the modal.
 * @param {Function} ok - modal ok function.
 */
async function nextStep(ok) {
  switch (step.value) {
    case 0:
      step.value += 1;
      break;
    case 1:
      try {
        isSaving.value = true;
        const { data } = await submitRequest();
        requestId.value = data.id;
        step.value += 1;
      } catch (error) {
        showErrorMessage(error, i18n.global.t('governance.requestForm.errorSubmittingRequest'));
      } finally {
        isSaving.value = false;
      }
      break;
    case 2:
      ok();
      break;
    default:
      break;
  }
}
</script>
