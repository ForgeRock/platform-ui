<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    as="span">
    <p class="text-center mb-4">
      {{ $t('pages.selfservice.passwordReset.userQuery') }}
    </p>
    <BFormGroup>
      <FrField
        v-model="mail"
        name="mail"
        class="mb-3"
        :label="$t('common.placeholders.emailAddress')"
        validation="required|email" />
    </BFormGroup>

    <BButton
      @click="save"
      size="lg"
      block
      variant="primary"
      :disabled="!valid">
      <template v-if="apiType === 'username'">
        {{ $t("pages.selfservice.forgotUsername.advanceStageButtonText") }}
      </template>
      <template v-else>
        {{ $t("pages.selfservice.passwordReset.advanceStageButtonText") }}
      </template>
    </BButton>
  </VeeForm>
</template>

<script setup>
import { ref } from 'vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { BButton, BFormGroup } from 'bootstrap-vue';
import { Form as VeeForm } from 'vee-validate';

/**
 * @description Selfservice stage for multiple selfservice flows, typically used with an email to locate a user in the system to continue on with further
 * selfservice stages
 */

defineProps({
  apiType: {
    required: true,
    type: String,
  },
});

const emit = defineEmits(['advance-stage']);

const mail = ref('');

function getData() {
  return {
    queryFilter: `mail eq "${mail.value}"`,
  };
}

function save() {
  emit('advance-stage', getData());
}
</script>
