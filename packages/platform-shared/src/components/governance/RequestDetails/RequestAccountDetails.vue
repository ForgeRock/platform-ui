<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrSpinner
      v-if="isLoadingSchema"
      class="py-5" />
    <BCard
      v-else-if="!isDeleteRequest && Object.keys(accountSchema).length"
      class="mb-3">
      <FrEntitlementEditForm
        :entitlement-schema="accountSchema"
        :model-value="accountValues"
        :read-only="props.readOnly"
        @update:modelValue="accountValues = $event" />
    </BCard>
    <FrObjectProperties
      v-else-if="!isDeleteRequest && Object.keys(accountProperties).length"
      :object-properties="accountProperties" />
    <div
      v-if="!isDeleteRequest && !props.readOnly"
      class="float-right d-flex justify-content-end m-4">
      <FrButtonWithSpinner
        variant="primary"
        :button-text="$t('common.save')"
        :disabled="isLoadingSchema || props.savingRequest"
        :show-spinner="props.savingRequest"
        @click="saveAccountRequest" />
    </div>
  </div>
</template>

<script setup>
/**
 * Displays the account information submitted with a createAccount,
 * modifyAccount, or deleteAccount custom request. When the current user is a
 * permitted actor on the request (readOnly is false), the account's editable
 * properties can be modified and saved back to the pending request.
 */
import { computed, onMounted, ref } from 'vue';
import { intersection, pickBy } from 'lodash';
import {
  BCard,
} from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrEntitlementEditForm from '@forgerock/platform-shared/src/components/governance/EntitlementEditForm';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrObjectProperties from '@forgerock/platform-shared/src/views/Governance/ObjectProperties/ObjectProperties';
import { getObjectTypeSchema } from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';

const props = defineProps({
  request: {
    type: Object,
    default: () => ({}),
  },
  requestType: {
    type: String,
    required: true,
  },
  readOnly: {
    type: Boolean,
    default: true,
  },
  savingRequest: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['save']);

const accountSchema = ref({});
const accountValues = ref({});
const isLoadingSchema = ref(false);

const accountData = computed(() => props.request?.account || {});
const isDeleteRequest = computed(() => props.requestType === 'deleteAccount');
const accountProperties = computed(() => accountData.value.object || {});

/**
 * Loads the account's editable object-type schema, marking non-updateable
 * properties as read-only while keeping them visible.
 */
async function loadAccountSchema() {
  const { applicationId, objectType } = accountData.value;
  if (!applicationId || !objectType) return;
  isLoadingSchema.value = true;
  try {
    const { data } = await getObjectTypeSchema(applicationId, objectType);
    accountSchema.value = pickBy(data?.properties, (value, key) => {
      const flags = value.flags || [];
      value.displayName = value.displayName || key;
      value.readOnly = intersection(flags, ['NOT_UPDATEABLE']).length > 0;
      return true;
    });
  } catch {
    // schema is optional — fall back to the raw property values
    accountSchema.value = {};
  } finally {
    isLoadingSchema.value = false;
  }
}

/**
 * Emits a save event with the modified account request payload.
 */
function saveAccountRequest() {
  emit('save', {
    ...props.request,
    account: {
      ...accountData.value,
      object: accountValues.value,
    },
  });
}

onMounted(() => {
  accountValues.value = accountProperties.value;
  if (!isDeleteRequest.value) loadAccountSchema();
});
</script>
