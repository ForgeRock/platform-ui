<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm v-slot="{ meta: { valid } }">
    <BFormGroup
      class="text-left"
      v-for="(question, key, index) in questionText"
      :key="key">
      <FrField
        class="mb-4"
        :id="question"
        :name="question"
        v-model.trim="answers[key]"
        :label="question"
        validation="required"
        :autofocus="index === 0"
      />
    </BFormGroup>

    <BButton
      @click="save"
      size="lg"
      variant="primary"
      :disabled="!valid"
      block>
      {{ $tc('common.user.kba.submitAnswers', requiredAnswers) }}
    </BButton>
  </VeeForm>
</template>

<script setup>
import { mapValues, has, set } from 'lodash';
import { ref, computed } from 'vue';
import { BButton, BFormGroup } from 'bootstrap-vue';
import { Form as VeeForm } from 'vee-validate';
import FrField from '@forgerock/platform-shared/src/components/Field';
import i18n from '@/i18n';

/**
 * @description Selfservice stage for password reset, handles securing a users password change with verifying KBA answers
 */
const props = defineProps({
  selfServiceDetails: { type: Object, required: true },
});

const emit = defineEmits(['advance-stage']);

const { locale, fallbackLocale } = i18n.global;

const questionText = computed(() => mapValues(props.selfServiceDetails?.requirements?.properties, (value) => {
  if (has(value, 'systemQuestion')) {
    return value.systemQuestion[locale] || value.systemQuestion[fallbackLocale] || value.systemQuestion.en;
  }

  if (has(value, 'userQuestion')) {
    return value.userQuestion;
  }

  return '';
}));

const answers = ref(
  props.selfServiceDetails?.requirements?.required.reduce((acc, answer) => set(acc, answer, ''), {}),
);

const requiredAnswers = computed(() => props.selfServiceDetails?.requirements?.required?.length || 0);

function save() {
  emit('advance-stage', answers.value);
}
</script>
