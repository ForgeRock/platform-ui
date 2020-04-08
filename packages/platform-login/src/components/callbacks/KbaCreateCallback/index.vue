<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div class="kbaQuestionAnswerContainer">
    <div
      v-if="showHeader"
      class="row kbaHeaderText">
      <!-- TODO Convert to use HR component -->
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
      class="text-center">
      {{ descriptionText }}
    </p>

    <ValidationObserver ref="observer">
      <BFormSelect
        :options="options"
        v-model="selected"
        :id="questionModel.key + '_selector'"
        class="mb-2 kbaQuestionSelect"
        @change="onQuestionSelectionChange()" />
      <FrField
        v-if="showCustom"
        class="mb-3"
        :field="questionModel"
        :validator="validateQuestion"
        :validation-immediate="true" />
      <FrField
        class="mb-3"
        :field="answerModel"
        :disabled="selected === null"
        :validator="validateAnswer" />
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

export default {
  name: 'KbaCreateCallback',
  components: {
    BFormSelect,
    ValidationObserver,
    FrField,
  },
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
    customQuestonOptionText: {
      type: String,
      required: false,
      default: '',
    },
    descriptionText: {
      type: String,
      required: false,
      default: '',
    },
    requiredText: {
      type: String,
      required: false,
      default: '',
    },
    uniqueText: {
      type: String,
      required: false,
      default: '',
    },
    showHeader: {
      type: Boolean,
      required: false,
      default: false,
    },
    showSeparator: {
      type: Boolean,
      required: false,
      default: false,
    },
    callbackSubmitButton: {
      type: HTMLButtonElement,
      required: true,
    },
  },
  data() {
    return {
      options: [],
      questionModel: {
        key: `callback_${this.index}_floatingLabelInput`,
        title: 'Question',
        value: '',
        validation: { required: true },
      },
      answerModel: {
        key: `callback_${this.index}00_floatingLabelInput`,
        type: 'password',
        title: 'Answer',
        value: '',
        validation: { required: true },
      },
      selected: null,
      showCustom: false,
    };
  },
  mounted() {
    this.predefinedQuestions = this.callback.getPredefinedQuestions();

    this.loadOptions();
  },
  methods: {
    loadOptions() {
      const placeholder = { value: null, text: this.callback.getPrompt(), disabled: true };
      const customQuestionOption = { value: 'custom', text: this.customQuestonOptionText, disabled: false };
      // Add the placeholder to the first element in the question options
      this.options = [placeholder];
      // Add any predefined questions
      map(this.predefinedQuestions, (item) => {
        this.options.push(item);
      });
      // Add the custom question option to the list of questions
      this.options.push(customQuestionOption);
      this.callbackSubmitButton.disabled = true;
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
      if (this.selected === 'custom') {
        this.showCustom = true;
      } else {
        this.showCustom = false;
      }

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
      this.callback.setAnswer(this.answerModel.value);

      this.setSubmitButton();
    },
    // This function disables/enables the callback form's submit button
    setSubmitButton() {
      // A delay is needed here so the .error-message class can be added to the field component in the case of invalid data
      setTimeout(() => {
        // Let vee-validate determine if the form is valid for each field
        this.$refs.observer.validate();
        const questionInputs = map(document.querySelectorAll(`input[placeholder=${this.questionModel.title}]`), (question) => question.value);
        const answerInputs = map(document.querySelectorAll(`input[placeholder=${this.answerModel.title}]`), (answer) => answer.value);
        // Disable if there is an error shown locally or in the other KbaCreateCallbacks
        this.callbackSubmitButton.disabled = document.querySelectorAll('.error-messages .error-message').length || questionInputs.includes('') || answerInputs.includes('');
      }, 1);
    },
  },
};
</script>
