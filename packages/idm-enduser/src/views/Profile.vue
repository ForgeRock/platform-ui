<!-- Copyright (c) 2025-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrProfileContainer>
    <template #settings="{ updateProfile }">
      <BCol>
        <FrAccountSecurity
          class="mb-5"
          v-model:close-reset-password="closeResetPassword"
          @reset-password="(currentPassword, newPassword) => updateProfile(...getResetPasswordPayload(currentPassword, newPassword))" />
        <FrAccountControls class="mb-5" />
        <FrSocial
          v-if="ENABLE_SELF_SERVICE"
          :client-token="clientToken"
          :linked-provider="linkedProvider" />
        <FrPreferences
          v-if="hasPreferences"
          class="mb-5"
          @updateProfile="updateProfile" />
      </BCol>
    </template>
  </FrProfileContainer>
</template>

<script setup>
import { computed, ref } from 'vue';
import { BCol } from 'bootstrap-vue';
import FrProfileContainer from '@forgerock/platform-shared/src/enduser/components/profile/ProfileContainer';
import FrAccountControls from '@forgerock/platform-shared/src/enduser/components/profile/AccountControls';
import FrPreferences from '@forgerock/platform-shared/src/enduser/components/profile/Preferences';
import { useEnduserStore } from '@forgerock/platform-shared/src/stores/enduser';
import FrAccountSecurity from '@/components/AccountSecurity';
import FrSocial from '@/components/Social';
import store from '@/store';

/**
 * @description Controlling component for profile management
 */

const enduserStore = useEnduserStore();

const closeResetPassword = ref(false);
const ENABLE_SELF_SERVICE = store.state.FeatureFlagsStore.isSelfServiceEnabled;
const clientToken = computed(() => store.state.OAuthState.clientToken);
const linkedProvider = computed(() => store.state.OAuthState.linkedProvider);
// The preferences section renders a toggle per property defined in the managed
// resource schema, so hide the whole section when the schema defines none.
const hasPreferences = computed(() => Object.keys(enduserStore.managedResourceSchema?.properties?.preferences?.properties || {}).length > 0);

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
