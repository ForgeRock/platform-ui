<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="vh-100 d-flex justify-content-center align-items-center">
    <FrCenterCard>
      <template #center-card-header>
        <div aria-live="polite">
          <template>
            <h1 class="h2">
              {{ $t('common.signIn') }}
            </h1>
          </template>
        </div>
      </template>
      <template #center-card-body>
        <BCardBody>
          <FrAlert
            :show="!!errorMessage"
            :dismissible="false"
            variant="danger"
            class="p-3 text-left">
            {{ errorMessage }}
          </FrAlert>
          <BForm
            @submit.prevent="signIn"
            class="mb-3">
            <FrField
              v-model="userName"
              class="mb-3"
              label="Username" />
            <FrField
              v-model="password"
              class="mb-3"
              type="password"
              label="Password" />
            <BButton
              type="submit"
              class="w-100"
              variant="primary">
              {{ $t('common.signIn') }}
            </BButton>
          </BForm>
          <p
            class="text-center mb-0"
            v-if="ENABLE_SELF_SERVICE && (forgotUsernameEnabled || resetPasswordEnabled)">
            <span v-if="forgotUsernameEnabled">
              <BLink :to="{name: 'ForgotUsername'}">{{ $t('pages.login.forgotUsername') }}</BLink>
            </span>
            <span
              v-if="resetPasswordEnabled"
              class="mx-2">
              <BLink to="#">{{ $t('pages.login.forgotPassword') }}</BLink>
            </span>
          </p>
        </BCardBody>
        <BCardFooter v-if="ENABLE_SELF_SERVICE && selfRegistrationEnabled">
          {{ $t('pages.login.newHere') }}
          <BLink to="#">
            {{ $t('pages.login.createAccount') }}
          </BLink>
        </BCardFooter>
      </template>
    </FrCenterCard>
  </BContainer>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  BButton,
  BCardBody,
  BCardFooter,
  BContainer,
  BForm,
  BLink,
} from 'bootstrap-vue';
import { useRouter } from 'vue-router';
import FrAlert from '@forgerock/platform-shared/src/components/Alert';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrCenterCard from '@forgerock/platform-shared/src/components/CenterCard';
import { useAuth } from '../composables/useAuth';
import { logout } from '../api/AuthenticationApi';
import i18n from '@/i18n';
import store from '@/store';

const router = useRouter();

const userName = ref('');
const password = ref('');
const errorMessage = ref('');

const { loginIdmEnduser } = useAuth();
const ENABLE_SELF_SERVICE = store.state.FeatureFlagsStore.isSelfServiceEnabled;
const selfRegistrationEnabled = computed(() => store.state.SharedStore.uiConfig.configuration?.selfRegistration || false);
const forgotUsernameEnabled = computed(() => store.state.SharedStore.uiConfig.configuration?.forgotUsername || false);
const resetPasswordEnabled = computed(() => store.state.SharedStore.uiConfig.configuration?.passwordReset || false);

async function signIn() {
  try {
    // clear existing session if any before login request
    await logout();

    // attempt to login
    await loginIdmEnduser(userName.value, password.value);

    router.push({ name: 'Dashboard' });
  } catch (error) {
    if (error.status === 401) {
      errorMessage.value = i18n.global.t('loginAuthError');
    } else {
      errorMessage.value = i18n.global.t('loginFailure');
    }
  }
}

</script>
