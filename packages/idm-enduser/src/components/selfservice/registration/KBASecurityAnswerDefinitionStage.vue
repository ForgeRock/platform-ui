<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <component
    :is="inline ? 'div' : VeeForm"
    v-slot="slotProps"
    as="div">
    <BForm
      class="mb-4"
      id="kbaDefinition"
      @submit.prevent>
      <FrHorizontalRule
        v-if="inline"
        insert="<i class='material-icons'>lock</i>" />
      <p class="text-center">
        {{ $t('common.user.kba.description') }}
      </p>
      <FrKBADefinitionFormGroup
        @update:data="setKbaFormGroupData"
        ref="kbaFormGroup"
        :self-service-details="selfServiceDetails" />
      <BButton
        v-if="!inline"
        @click="save"
        :disabled="!slotProps?.meta?.valid"
        block
        size="lg"
        variant="primary">
        {{ $t("pages.selfservice.registration.completeRegistration") }}
      </BButton>
    </BForm>
  </component>
</template>

<script setup>
/**
 * @description Selfservice stage that handles the initial KBA during registration functions the same in allinone
 * */
import { Form as VeeForm } from 'vee-validate';
import { ref } from 'vue';
import {
  BForm,
  BButton,
} from 'bootstrap-vue';
import FrHorizontalRule from '@forgerock/platform-shared/src/components/HorizontalRule/HorizontalRule';
import FrKBADefinitionFormGroup from '@/components/selfservice/common/KBADefinitionFormGroup';

const emit = defineEmits(['advanceStage', 'update:data']);

defineProps({
  selfServiceDetails: {
    type: Object,
    required: true,
  },
  inline: {
    type: Boolean,
    default: false,
  },
});

const kbaFormGroupData = ref(null);

/**
 * Retrieves and returns the necessary data for the KBASecurityAnswerDefinitionStage component.
 * This function is responsible for gathering any required information, such as user input,
 * configuration, or state, to be used within the component's logic or template.
 *
 * @returns {Object} The data object containing relevant properties for the component.
 */
function setKbaFormGroupData(kbaData) {
  kbaFormGroupData.value = kbaData;
  emit('update:data', kbaFormGroupData.value);
}

/**
 * Saves the current state or data related to the KBASecurityAnswerDefinitionStage component.
 * Performs asynchronous operations, such as validation and submission of security answers.
 * Handles any errors that may occur during the save process.
 *
 * @returns {Promise<void>} Resolves when the save operation is complete.
 */
async function save() {
  emit('advanceStage', kbaFormGroupData.value);
}
</script>
