<!-- Copyright 2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <FrProfileContainer>
    <template #settings="{ updateProfile }">
      <BCol>
        <FrAccountSecurity
          class="mb-5"
          v-model:close-reset-password="closeResetPassword"
          @reset-password="(currentPassword, newPassword) => updateProfile(...getResetPasswordPayload(currentPassword, newPassword))" />
        <FrAccountControls class="mb-5" />
        <FrPreferences
          class="mb-5"
          @updateProfile="updateProfile" />
      </BCol>
    </template>
  </FrProfileContainer>
</template>

<script setup>

import { BCol } from 'bootstrap-vue';
import FrProfileContainer from '@forgerock/platform-shared/src/components/profile/ProfileContainer';
import FrAccountControls from '@forgerock/platform-shared/src/components/profile/AccountControls';
import FrPreferences from '@forgerock/platform-shared/src/components/profile/Preferences';
import { ref } from 'vue';
import FrAccountSecurity from '@/components/AccountSecurity';

/**
 * @description Controlling component for profile management
 */

const closeResetPassword = ref(false);

/**
 * Returns the payload for the reset password request, it returns a list of
 * arguments that the updateProfile method receive, the list contains the
 * payload data and the configuration required.
 * @param {string} currentPassword - The current password
 * @param {string} newPassword - The new password
 * @return {Array} - The payload for the reset password request
 */
function getResetPasswordPayload(currentPassword, newPassword) {
  return [
    [
      {
        operation: 'add',
        field: '/password',
        value: newPassword,
      },
    ],
    {
      headers: {
        'X-OpenIDM-Reauth-Password': currentPassword,
      },
      onSuccess() {
        closeResetPassword.value = true;
      },
    },
  ];
}
</script>
