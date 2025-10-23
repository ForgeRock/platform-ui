<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    fluid
    class="h-100 px-0">
    <div class="h-100 d-flex">
      <FrCenterCard :logo-enabled="false">
        <template #center-card-body>
          <FrSpinner
            class="mb-4" />
        </template>
      </FrCenterCard>
    </div>
  </BContainer>
</template>

<script setup>
/**
 * @description Return page used for oauth provider authentication. Will appropriately redirect a user to login or account claiming.
 *
 * @fires POST identityProviders?_action=handlePostAuth - Generates the token used for continuing the authentication process based off of the returned provider information
 * @fires POST authentication?_action=login - Uses data store token to establish a new user session
 */
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { isNull } from 'lodash';
import { BContainer } from 'bootstrap-vue';
import FrCenterCard from '@forgerock/platform-shared/src/components/CenterCard';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { handlePostAuth, loginWithDataStoreToken } from '@/api/AuthenticationApi';
import useSelfService from '@/composables/selfService';
import store from '@/store';
import i18n from '@/i18n';

const router = useRouter();
const { progressiveProfileCheck } = useSelfService();

const searchParams = new URLSearchParams(window.location.search);
const queryParams = Array.from(searchParams.entries()).reduce((map, [key, value]) => {
  map[key] = map[key] ? map[key].concat([value]) : [value];
  return map;
}, {});

/**
 * Handles the OAuth return process after the user is redirected back from the OAuth provider.
 * This function typically processes the returned authorization code or token,
 * performs necessary validation, and completes the authentication or account linking flow.
 * @async
 * @returns {Promise<void>} Resolves when the OAuth return handling is complete.
 */
async function handleOAuthReturn() {
  let linkedProvider = localStorage.getItem('linkedProvider');
  if (linkedProvider) linkedProvider = atob(linkedProvider);

  window.history.pushState('', '', window.location.pathname);

  try {
    const { data } = await handlePostAuth(atob(localStorage.getItem('dataStoreToken')), queryParams);
    const dataStoreToken = data.token;
    let originalToken = localStorage.getItem('accountClaimingToken');
    if (originalToken) {
      originalToken = atob(originalToken);
      localStorage.removeItem('accountClaimingToken');
    }

    try {
      const { data: loginData } = await loginWithDataStoreToken(dataStoreToken);

      // check for progressive profile
      progressiveProfileCheck(loginData, () => {
        if (linkedProvider) {
          router.push({ name: 'Profile' });
        } else if (isNull(originalToken)) {
          router.push('/');
        } else {
          store.commit('setOAuthState', dataStoreToken, originalToken, null);
          router.push({ name: 'AccountClaiming' });
        }
      });
    } catch (error) {
      store.commit('setOAuthState', dataStoreToken, originalToken, null);
      router.push({ name: 'AccountClaiming' });
    }
  } catch (error) {
    router.push('/login');
    showErrorMessage(error, i18n.global.t('pages.selfservice.genericError'));
  } finally {
    localStorage.removeItem('dataStoreToken');
    localStorage.removeItem('linkedProvider');
  }
}

onMounted(() => {
  handleOAuthReturn();
});
</script>
