<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard>
    <FrSpinner
      v-if="isLoading"
      class="py-5" />
    <template v-else>
      <h3 class="h5 mb-4">
        {{ $t('governance.administer.entitlements.generalSettings') }}
      </h3>
      <FrGlossaryEditForm
        class="mb-2"
        :glossary-schema="glossarySchema"
        :model-value="glossaryValues"
        :read-only="readOnly"
        @update:modelValue="glossaryValues = $event" />
      <FrEntitlementEditForm
        :entitlement-schema="entitlementSchema"
        :model-value="entitlementValues"
        :read-only="readOnly"
        @update:modelValue="entitlementValues = $event" />
    </template>
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
import FrEntitlementEditForm from '@forgerock/platform-shared/src/components/governance/EntitlementEditForm';
import FrGlossaryEditForm from '@forgerock/platform-shared/src/components/governance/GlossaryEditForm';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { getEntitlementSchema } from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import { getGlossarySchema } from '@forgerock/platform-shared/src/utils/governance/glossary';
import { submitCustomRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

const props = defineProps({
  entitlement: {
    type: Object,
    default: () => ({}),
  },
});

const isLoading = ref(null);
const isSaving = ref(null);
const entitlementSchema = ref([]);
const entitlementValues = ref({});
const glossarySchema = ref([]);
const glossaryValues = ref({});
const MODIFY_ENTITLEMENT_REQUEST_TYPE = 'modifyEntitlement';

const readOnly = computed(() => (!props.entitlement?.permissions?.modifyEntitlement));

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

/**
 * Fetches glossary and entitlement schema and values
 */
async function getGlossaryAndEntitlementDetails() {
  isLoading.value = true;
  try {
    // get glossary schema and values
    const data = await getGlossarySchema('assignment');
    glossarySchema.value = data;
    glossaryValues.value = props.entitlement?.glossary?.idx?.['/entitlement'] || {};

    // get entitlement schema and values
    const { data: objectTypeSchema } = await getEntitlementSchema(props.entitlement.application.id, props.entitlement.item.objectType);
    entitlementSchema.value = objectTypeSchema.properties;
    entitlementValues.value = props.entitlement.entitlement || {};
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.administer.entitlements.errorGettingEntitlement'));
  } finally {
    isLoading.value = false;
  }
}

getGlossaryAndEntitlementDetails();
</script>
