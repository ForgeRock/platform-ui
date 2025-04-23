<!-- Copyright 2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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
