<!-- Copyright 2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <FrAccordion
      accordion-group="accountSecurity"
      :items="items">
      <template #accordionHeader>
        <div class="p-4">
          <h2 class="h4">
            {{ $t('pages.profile.accountSecurity.title') }}
          </h2>
          <p class="m-0">
            {{ $t('pages.profile.accountSecurity.subtitle') }}
          </p>
        </div>
      </template>
      <template #header="{ header, open$ }">
        <BRow class="cursor-pointer">
          <BCol>
            <h3 class="h5 mb-0">
              {{ header }}
            </h3>
          </BCol>
          <BCol
            v-if="open$"
            class="text-right text-nowrap"
            md="2">
            <BButton
              variant="link"
              class="p-0">
              {{ $t('common.cancel') }}
            </BButton>
          </BCol>
        </BRow>
      </template>
      <template #body="{ open$ }">
        <FrResetPasswordForm
          :user-id="userId"
          :reset-form="!open$"
          @reset-password="(currentPassword, newPassword) => $emit('reset-password', currentPassword, newPassword)" />
      </template>
    </FrAccordion>
  </div>
</template>

<script setup>
import { BRow, BCol, BButton } from 'bootstrap-vue';
import FrAccordion from '@forgerock/platform-shared/src/components/Accordion';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { reactive, watch } from 'vue';
import FrResetPasswordForm from './ResetPasswordForm';
import i18n from '@/i18n';

/**
 * @description Component for the IDM Enduser account security options
 */

const props = defineProps({
  closeResetPassword: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['reset-password', 'update:closeResetPassword']);

const { userId } = useUserStore();

const items = reactive([
  {
    name: 'resetPassword',
    header: i18n.global.t('common.password'),
    open$: false,
  },
]);

watch(() => props.closeResetPassword, (newValue) => {
  if (newValue) {
    items[0].open$ = false;
  }
});

watch(() => items[0].open$, (newValue) => {
  if (newValue) {
    emit('update:closeResetPassword', !newValue);
  }
});
</script>
