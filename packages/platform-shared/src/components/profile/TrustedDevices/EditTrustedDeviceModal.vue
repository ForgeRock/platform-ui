<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="edit-trusted-device-modal"
    no-close-on-backdrop
    no-close-on-esc
    title-tag="h2"
    title-class="h5"
    :title="i18n.global.t('pages.profile.trustedDevices.editModalTitle')">
    <FrField
      v-model="deviceNameModel"
      autofocus
      :label="$t('pages.profile.trustedDevices.editModalInput')" />
    <template #modal-footer="{ cancel }">
      <BButton
        variant="link"
        @click="cancel()">
        {{ i18n.global.t('common.cancel') }}
      </BButton>
      <FrButtonWithSpinner
        :disabled="isSaving"
        :show-spinner="isSaving"
        @click="handleSaveButtonClick" />
    </template>
  </BModal>
</template>

<script setup>
import {
  BButton,
  BModal,
} from 'bootstrap-vue';
import i18n from '@forgerock/platform-shared/src/i18n';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { ref, watch } from 'vue';

/**
* @description Modal to edit a trusted device's name (alias0)
*/

const props = defineProps({
  deviceAlias: {
    type: String,
    default: '',
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
});

const deviceNameModel = ref('');
const emit = defineEmits(['save-device']);

/**
 * Tells the consuming component to save the updated device data
 */
function handleSaveButtonClick() {
  emit('save-device', deviceNameModel.value);
}

/**
 * Watches for the `deviceAlias` prop and updates the input's v-model
 */
watch(() => props.deviceAlias, (newVal) => {
  deviceNameModel.value = newVal;
});
</script>
