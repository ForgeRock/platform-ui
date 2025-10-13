<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BFormGroup
    label-text-align="left"
    class="mb-0"
    v-for="(answer, index) in answers"
    :key="index">
    <FrField
      v-model="answer.questionId"
      class="mb-3"
      type="select"
      :options="options"
      :validation="getQuestionValidation(index)"
      :name="$t('common.user.kba.selectQuestion').toLowerCase() + index"
      :label="$t('common.user.kba.selectQuestion')" />
    <FrField
      v-if="answer.questionId === customIndex"
      v-model="answer.customQuestion"
      class="mb-3"
      :validation="getQuestionValidation(index)"
      :label="$t('common.user.kba.question')"
      :name="$t('common.user.kba.question').toLowerCase() + index" />
    <FrField
      v-model="answer.answer"
      class="mb-3"
      validation="required"
      :label="$t('common.user.kba.answer')"
      :name="$t('common.user.kba.answer').toLowerCase() + index" />
    <hr v-if="index !== answers.length - 1">
  </BFormGroup>
</template>

<script setup>
/**
 * @description Common selfservice component for defining security questions
 * */
import { computed, ref, watch } from 'vue';
import {
  BFormGroup,
} from 'bootstrap-vue';
import {
  map,
  times,
  omit,
} from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import i18n from '@/i18n';

const emit = defineEmits(['update:data']);

const props = defineProps({
  selfServiceDetails: {
    type: Object,
    required: true,
  },
});

const { locale, fallbackLocale } = i18n.global;
const kba = ref(props.selfServiceDetails.requirements.properties.kba);
const answers = ref(times(kba.value.minItems, () => ({ answer: null, questionId: null, customQuestion: null })));
const customIndex = 'custom';

const predefinedQuestionOptions = computed(() => map(kba.value.questions, (question) => {
  const value = question.id;
  const text = question.question[locale] || question.question[fallbackLocale] || question.question.en;
  return { value, text };
}));

const options = computed(() => {
  const customQuestionOption = { value: 'custom', text: i18n.global.t('common.user.kba.custom'), disabled: false };
  let tempOptions = [];

  tempOptions = tempOptions.concat(predefinedQuestionOptions.value, customQuestionOption);
  return tempOptions;
});

/**
 * Retrieves and processes the provided answer data for use in the KBA Definition Form Group.
 * @param {Object} answerData - The data object containing answers to be processed.
 * @returns {Object} KBA definition data.
 */
function getData(answerData) {
  return {
    kba: answerData.map((answer) => omit(answer, answer.questionId === customIndex ? 'questionId' : 'customQuestion')),
  };
}

/**
 * Returns validation rules for a KBA (Knowledge-Based Authentication) question based on the provided key.
 * @param {string} key - The identifier for the KBA question to retrieve validation rules for.
 * @returns {Array|Object} Validation rules applicable to the specified question.
 */
function getQuestionValidation(key) {
  const otherQuestions = answers.value
    .filter((answer, index) => index !== key && answer.questionId !== customIndex && answer.questionId !== null)
    .map((answer) => answer.questionId);

  return {
    required: true,
    uniqueValue: otherQuestions,
  };
}

watch(() => answers.value, (newAnswers) => {
  emit('update:data', getData(newAnswers));
}, { deep: true, immediate: true });
</script>
