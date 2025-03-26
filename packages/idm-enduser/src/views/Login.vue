<!-- Copyright 2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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
          <BForm @submit.prevent="signIn">
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
        </BCardBody>
      </template>
    </FrCenterCard>
  </BContainer>
</template>

<script setup>
import { ref } from 'vue';
import {
  BButton,
  BCardBody,
  BContainer,
  BForm,
} from 'bootstrap-vue';
import { useRouter } from 'vue-router';
import FrAlert from '@forgerock/platform-shared/src/components/Alert';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrCenterCard from '@forgerock/platform-shared/src/components/CenterCard';
import { useAuth } from '../composables/useAuth';
import { logout } from '../api/AuthenticationApi';
import i18n from '@/i18n';

const router = useRouter();

const userName = ref('');
const password = ref('');
const errorMessage = ref('');

const { loginIdmEnduser } = useAuth();

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
