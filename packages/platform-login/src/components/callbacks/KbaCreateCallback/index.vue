<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="kbaQuestionAnswerContainer">
    <div
      v-if="showHeader"
      class="row kbaHeaderText">
      <div class="col pr-0">
        <hr>
      </div>
      <div class="col-auto pt-1">
        <i class="material-icons-outlined">
          lock
        </i>
      </div>
      <div class="col pl-0">
        <hr>
      </div>
    </div>

    <p
      v-if="showHeader"
      class="text-center kbaHeaderText">
      {{ $t('login.kba.description') }}
    </p>

    <ValidationObserver ref="observer">
      <BFormSelect
        :aria-label="callback.getPrompt()"
        v-model="selected"
        class="mb-2 kbaQuestionSelect"
        role="listbox"
        :id="questionModel.key + '_selector'"
        :options="options"
        @change="onQuestionSelectionChange()" />
      <FrField
        v-if="showCustom"
        v-model="questionModel.value"
        class="mb-3"
        :label="questionModel.title"
        :name="questionModel.key"
        :validation="questionModel.validation"
        :validation-immediate="true"
        @input="validateQuestion" />
      <FrField
        v-model="answerModel"
        class="mb-3"
        type="password"
        validation="required"
        :label="$t('login.kba.answer')"
        :name="`callback_${index}_answer_field`"
        :disabled="selected === null"
        @input="validateAnswer" />
    </ValidationObserver>
    <hr>
  </div>
</template>

<script>
import {
  map,
} from 'lodash';
import { BFormSelect } from 'bootstrap-vue';
import { ValidationObserver } from 'vee-validate';
import FrField from '@forgerock/platform-shared/src/components/Field';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';

export default {
  name: 'KbaCreateCallback',
  components: {
    BFormSelect,
    ValidationObserver,
    FrField,
  },
  mixins: [
    TranslationMixin,
  ],
  props: {
    callback: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: false,
      default: 0,
    },
    showHeader: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      answerModel: '',
      questionModel: {
        key: `callback_${this.index}_question_field`,
        title: this.$t('login.kba.question'),
        value: '',
        validation: { required: true },
      },
      options: [],
      selected: null,
      showCustom: false,
    };
  },
  mounted() {
    this.$emit('disable-next-button', true, this.index);
    this.loadOptions();
  },
  methods: {
    loadOptions() {
      const placeholder = { value: null, text: this.callback.getPrompt(), disabled: true };
      const customQuestionOption = { value: 'custom', text: this.$t('login.kba.custom'), disabled: false };
      const predefinedQuestions = this.getTranslation(this.callback.getPredefinedQuestions());
      // Add the placeholder to the first element in the question options
      // then add any predefined question
      // then add custom question option to the list of questions
      this.options = [
        placeholder,
        ...predefinedQuestions,
        customQuestionOption,
      ];
    },
    // This function sets the value of the question's hidden input and disbables the question value from other kba question selection options on the dom
    onQuestionSelectionChange() {
      // get a list of values from other .kbaQuestionSelect's
      const questionValues = map(document.querySelectorAll('select.kbaQuestionSelect'), (question) => question.value);

      // disable the ability to select the same question more than once from the other .kbaQuestionSelect's
      document.querySelectorAll(`select.kbaQuestionSelect:not(#${this.questionModel.key}_selector)`).forEach((selector) => {
        selector.forEach((option, index) => {
          if (index > 0 && option.value !== 'custom') {
            option.disabled = !!(questionValues.includes(option.value) && option.value !== selector.value);
          }
        });
      });

      // if "Provide your own" is selected, show the custom question input
      this.showCustom = this.selected === 'custom';

      this.validateQuestion();
    },
    // This function looks to make sure the question is both non-empty and unique
    validateQuestion() {
      // Find all the other questions on the dom to ensure uniqueness
      const otherQuestionInputs = document.querySelectorAll(`input[placeholder=${this.questionModel.title}]:not([name=${this.questionModel.key}])`);
      const otherQuestions = map(otherQuestionInputs, (question) => question.value);

      this.questionModel.validation = { required: true, unique: otherQuestions };
      this.callback.setQuestion(this.selected);

      this.setSubmitButton();
    },
    // This function looks at the question's answer to make sure it is not empty
    validateAnswer() {
      this.callback.setAnswer(this.answerModel);

      this.setSubmitButton();
    },
    // This function disables/enables the callback form's submit button
    setSubmitButton() {
      // A delay is needed here so the .error-message class can be added to the field component in the case of invalid data
      this.$nextTick(() => {
        // Let vee-validate determine if the form is valid for each field
        // Disable if there is an error shown locally or in the other KbaCreateCallbacks
        this.$refs.observer.validate().then((isValid) => {
          this.$emit('disable-next-button', !isValid, this.index);
        });
      });
    },
  },
};
</script>
