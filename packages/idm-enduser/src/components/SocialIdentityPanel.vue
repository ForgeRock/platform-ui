<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="mb-4">
    <BRow
      v-if="showAccountDetails"
      class="mb-4">
      <BCol lg="3">
        <h4 class="h5">
          {{ $t('pages.profile.socialSignIn.linkedAccount') }}
        </h4>
      </BCol>
      <BCol lg="9">
        <BMedia>
          <template #aside>
            <BImg
              :src="photoUrl || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
              rounded="circle"
              width="40"
              height="40"
              :alt="profile.displayName || 'profile'" />
          </template>
          <BMediaBody>
            <div class="text-dark">
              {{ profile.displayName }}
            </div>
            <div
              v-if="accountDisplayName"
              class="text-muted">
              {{ accountDisplayName }}
            </div>
          </BMediaBody>
        </BMedia>
      </BCol>
    </BRow>
    <BRow>
      <BCol lg="3">
        {{ $t('pages.profile.socialSignIn.sharing') }}
      </BCol>
      <BCol
        lg="9"
        class="text-muted">
        <div
          v-for="(scope, index) in provider.scope"
          :key="`scopes-${index}`"
          class="py-1">
          <FrIcon
            name="check"
            class="text-success mr-2">
            {{ capitalize(scope) }}
          </FrIcon>
        </div>
      </BCol>
    </BRow>
  </div>
</template>
<script setup>
/**
* @description Display component for each configured social provider
* @fires POST identityProviders?_action=normalizeProfile - Returns a normalized set of data for social providers, this is used to provide additional display such as profile picture from Facebook or Google.
*/
import { computed, ref, onMounted } from 'vue';
import {
  capitalize,
  has,
  isEmpty,
  set,
} from 'lodash';
import {
  BCol,
  BImg,
  BMedia,
  BMediaBody,
  BRow,
} from 'bootstrap-vue';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { getSocialProviderProfile } from '@/api/SelfServiceApi';
import i18n from '@/i18n';

const props = defineProps({
  provider: {
    type: Object,
    required: true,
  },
});

const profile = ref({});
const accountDisplayName = computed(() => profile.value.email || profile.value.username);
const photoUrl = computed(() => profile.value.photoUrl || '');

/**
 * Computed property that determines whether the account details should be displayed.
 * The logic for showing account details is based on reactive state or props.
 * @returns {boolean} True if account details should be shown, false otherwise.
 */
const showAccountDetails = computed(() => {
  const profileNotEmpty = !isEmpty(profile.value);
  const profileHasDisplayName = has(profile.value, 'displayName');
  const profileHasEmailOrUsername = has(profile.value, 'email') || has(profile.value, 'username');

  return profileNotEmpty && (profileHasDisplayName || profileHasEmailOrUsername);
});

/**
 * Constructs and returns the payload object required for a profile request.
 * This payload typically contains user-specific information needed to fetch
 * or update the user's social identity profile.
 * @returns {Object} The payload object for the profile request.
 */
function getProfileRequestPayload() {
  const rawProfile = props.provider?.propertyMap?.reduce((result, mapping) => set(result, mapping.source, props.provider[mapping.source]), {}) || {};
  rawProfile._refResourceCollection = props.provider?._refResourceCollection;
  return { rawProfile };
}

/**
 * Fetches the profile data for the current user from the server.
 * Handles asynchronous operations and returns the user's profile information.
 * @returns {Promise<Object>} A promise that resolves to the user's profile data.
 */
async function getProfileData() {
  try {
    const { data } = await getSocialProviderProfile(getProfileRequestPayload());
    [profile.value] = data;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('pages.profile.socialSignIn.errorGettingProfile'));
  }
}

onMounted(() => {
  getProfileData();
});
</script>
