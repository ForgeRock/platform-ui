<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard>
    <h3 class="h5 mb-4">
      {{ $t('governance.administer.entitlements.generalSettings') }}
    </h3>
    <FrDefaultEntitlementForm
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
</template>

<script setup>
/**
 * Displays the details tab for an entitlement.
 * Allows the user to edit the glossary and entitlement values.
 * Saving submits a request to modify the entitlement.
 */
import { computed, ref } from 'vue';
import { BCard } from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import { submitCustomRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrDefaultEntitlementForm from '@forgerock/platform-shared/src/components/governance/DefaultEntitlementForm';
import i18n from '@/i18n';

const props = defineProps({
  entitlement: {
    type: Object,
    default: () => ({}),
  },
});

const isSaving = ref(null);
const entitlementValues = ref({});
const glossaryValues = ref({});
const MODIFY_ENTITLEMENT_REQUEST_TYPE = 'modifyEntitlement';

const readOnly = computed(() => (!props.entitlement?.permissions?.modifyEntitlement));
const applicationId = computed(() => props.entitlement?.application?.id);
const objectType = computed(() => props.entitlement?.item?.objectType);

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
    await submitCustomRequest(MODIFY_ENTITLEMENT_REQUEST_TYPE, requestPayload);
    displayNotification('success', i18n.global.t('governance.requestForm.requestSubmitted'));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.requestForm.errorSubmittingRequest'));
  } finally {
    isSaving.value = false;
  }
}

</script>
