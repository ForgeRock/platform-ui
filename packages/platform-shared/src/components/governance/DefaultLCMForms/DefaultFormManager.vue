<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrAddUserForm
      v-if="currentFormComponent === defaultForms.createUser"
      :model-value="options.userValues"
      :read-only="readOnly"
      @update:modelValue="handleInput($event)" />
    <FrModifyUserForm
      v-else-if="currentFormComponent === defaultForms.modifyUser"
      allow-all-properties
      :user-id="options.userId"
      :read-only="readOnly"
      :user="options.userValues"
      @update:modelValue="handleInput($event)" />
    <FrDefaultEntitlementForm
      v-else-if="currentFormComponent === defaultForms.entitlement"
      :entitlement="options.entitlement"
      :application-id="options.applicationId"
      :object-type="options.objectType"
      :read-only="readOnly"
      :type="requestType === requestTypes.CREATE_ENTITLEMENT.value ? 'CREATE' : 'MODIFY'"
      @update:glossaryValues="handleInput({ entitlementValues, glossaryValues: $event })"
      @update:entitlementValues="handleInput({ entitlementValues: $event, glossaryValues })" />
  </div>
</template>
<script setup>
/**
 * This component is used to manage the default (OOTB) forms for user and entitlement requests.
 * It dynamically loads the appropriate form based on the request type and options provided.
 */
import { ref } from 'vue';
import { requestTypes } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import FrAddUserForm from '@forgerock/platform-shared/src/components/governance/DefaultLCMForms/User/AddUserForm';
import FrModifyUserForm from '@forgerock/platform-shared/src/components/governance/DefaultLCMForms/User/ModifyUserForm';
import FrDefaultEntitlementForm from '@forgerock/platform-shared/src/components/governance/DefaultEntitlementForm';

const emit = defineEmits(['input']);

const props = defineProps({
  readOnly: {
    type: Boolean,
    default: false,
  },
  requestType: {
    type: String,
    required: true,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
});

const currentFormComponent = ref('');
const defaultForms = {
  createUser: 'createUser',
  modifyUser: 'modifyUser',
  entitlement: 'entitlement',
};

const glossaryValues = ref({});
const entitlementValues = ref({});

/**
 * Handles the input event triggered by a user interaction.
 * This function emits the updated model value based on the request type.
 *
 * @param {Event} event - The input event object.
 */
function handleInput(event) {
  // Emit the updated model value to the parent component
  if (props.requestType === 'createUser' || props.requestType === 'modifyUser') {
    emit('input', event);
  }

  if (props.requestType === 'createEntitlement' || props.requestType === 'modifyEntitlement') {
    glossaryValues.value = event.glossaryValues;
    entitlementValues.value = event.entitlementValues;
    emit('input', { glossary: glossaryValues.value, entitlement: entitlementValues.value });
  }
}

/**
 * Sets the current form component based on the request type.
 */
async function setFormComponent() {
  if (props.requestType === 'createUser') {
    currentFormComponent.value = defaultForms.createUser;
  }
  if (props.requestType === 'modifyUser') {
    currentFormComponent.value = defaultForms.modifyUser;
  }
  if (props.requestType === 'createEntitlement' || props.requestType === 'modifyEntitlement') {
    currentFormComponent.value = defaultForms.entitlement;
  }
}

setFormComponent();
</script>
