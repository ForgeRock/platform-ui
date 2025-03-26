/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from './user';

// eslint-disable-next-line import/prefer-default-export
export const useEnduserStore = defineStore('enduser', () => {
  const userStore = useUserStore();

  const managedResourceSchema = ref({});
  const preferences = ref({});
  const profileImage = ref('');
  const aliasList = ref([]);
  const consentedMappings = ref(null);

  const isInternalUser = computed(() => userStore.managedResource === 'internal/user');

  function setProfile(profileData) {
    // set generic data in the user store
    userStore.setUserDetails(profileData);
    // store enduser specific data locally
    aliasList.value = profileData.aliasList || [];
    consentedMappings.value = profileData.consentedMappings || null;
    preferences.value = profileData.preferences || {};
    profileImage.value = profileData.profileImage || '';
  }

  function $reset() {
    managedResourceSchema.value = {};
    preferences.value = {};
    profileImage.value = '';
    aliasList.value = [];
    consentedMappings.value = null;
  }

  return {
    isInternalUser,
    managedResourceSchema,
    aliasList,
    consentedMappings,
    preferences,
    profileImage,
    setProfile,
    $reset,
  };
});
