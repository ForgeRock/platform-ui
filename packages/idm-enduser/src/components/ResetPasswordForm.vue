<!-- Copyright (c) 2025-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrField
      class="mb-3"
      name="currentPassword"
      type="password"
      :label="$t('pages.profile.accountSecurity.currentPassword')"
      v-model="currentPassword" />
    <FrPolicyPasswordInput
      resource-type="managed"
      resource-name="user"
      use-idm-policies-only
      v-model="newPassword" />
    <BButton
      block
      variant="primary"
      @click="$emit('reset-password', currentPassword, newPassword)">
      {{ $t('pages.profile.accountSecurity.savePassword') }}
    </BButton>
  </div>
</template>

<script setup>
import FrField from '@forgerock/platform-shared/src/components/Field';
import { BButton } from 'bootstrap-vue';
import { ref, watch } from 'vue';
import FrPolicyPasswordInput from '@forgerock/platform-shared/src/components/PolicyPasswordInput';

/**
 * @description Component for the IDM Enduser reset password form
 */

const props = defineProps({
  resetForm: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['reset-password']);

const currentPassword = ref('');
const newPassword = ref('');

watch(() => props.resetForm, (newValue) => {
  if (newValue) {
    currentPassword.value = '';
    newPassword.value = '';
  }
});
</script>
