<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrAlert
    v-if="selfServiceDetails.tag ==='end'"
    show>
    <p>{{ $t('pages.selfservice.passwordReset.successMessage') }}</p>
  </FrAlert>
  <template v-else-if="typeof selfServiceDetails.error !== 'string'">
    <VeeForm
      v-slot="{ meta: { valid } }"
      as="span">
      <FrField
        v-model="password"
        class="mb-3"
        type="password"
        validation="required"
        :label="$t('pages.selfservice.passwordReset.newPassword')" />
      <BButton
        @click="save"
        size="lg"
        variant="primary"
        :disabled="!valid"
        block>
        {{ $t("pages.selfservice.passwordReset.changePassword") }}
      </BButton>
    </VeeForm>
  </template>
  <template v-else>
    <FrAlert
      variant="danger"
      show>
      {{ selfServiceDetails.error }}
    </FrAlert>
    <div class="mt-2">
      <BLink @click="forceReloadPasswordReset">
        {{ $t("pages.selfservice.passwordReset.tryAgain") }}
      </BLink>
    </div>
  </template>
</template>

<script setup>
import { ref, watch } from 'vue';
import { has, find, map } from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrAlert from '@forgerock/platform-shared/src/components/Alert';
import { BButton, BLink } from 'bootstrap-vue';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { Form as VeeForm } from 'vee-validate';
import i18n from '@/i18n';

const { t } = i18n.global;

const props = defineProps({
  selfServiceDetails: { type: Object, required: true },
});

const emit = defineEmits(['advance-stage']);

const password = ref('');
const defaultPolicyFailures = ref(null);

function getData() {
  return {
    password: password.value,
  };
}

function save() {
  emit('advance-stage', getData());
}

function forceReloadPasswordReset() {
  const { hash } = window.location;
  window.location.hash = hash.slice(0, hash.lastIndexOf('/') + 1);
  window.location.reload();
}

watch(
  () => props.selfServiceDetails,
  (val) => {
    /*
            If there is a change to selfServiceDetails it's probably because of a
            policy failure on password that could not be handled on the fly with
            "?_action=validateObject". Look for those failures here and send them to the
            PolicyPasswordInput via it's defaultPolicyFailures property.
        */
    if (has(val, 'requirements.error.detail.failedPolicyRequirements')) {
      const failedPolicy = find(val.requirements.error.detail.failedPolicyRequirements, { property: 'password' });

      if (failedPolicy?.policyRequirements) {
        const policyError = t(`common.policyValidationMessages.${failedPolicy.policyRequirements[0].policyRequirement}`, failedPolicy.policyRequirements[0].params);
        const errorMessage = `${t('common.policyValidationMessages.policyValidationFailed', { property: failedPolicy.property })}: ${policyError}`;
        showErrorMessage({}, errorMessage);
        defaultPolicyFailures.value = map(failedPolicy.policyRequirements, 'policyRequirement');
      }
    }
  },
  { deep: true },
);
</script>
