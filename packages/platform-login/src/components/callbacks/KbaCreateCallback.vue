<template>
  <div class="kbaQuestionAnswerContainer">
    <div
      v-if="showHeader"
      class="row kbaHeaderText">
      <!-- TODO Covert to use HR component -->
      <div class="col pr-0">
        <hr>
      </div>
      <div class="col-auto pt-1" />
      <i class="material-icons material-icons-outlined">
        lock
      </i>
      <div class="col pl-0">
        <hr>
      </div>
    </div>

    <p
      v-if="showHeader"
      class="text-center">
      {{ descriptionText }}
    </p>

    <input
      type="hidden"
      class="kbaQuestion"
      :name="questionName"
      :ref="questionName"
      :value="questionValue">
    <BFormSelect
      :options="options"
      v-model="selected"
      :id="questionName + '_selector'"
      class="mb-2 kbaQuestionSelect"
      @change="onQuestionSelectionChange()" />

    <FrFloatingLabelInput
      class="mb-3"
      type="text"
      :field-name="questionName + '_floatingLabelInput'"
      v-if="showCustom"
      v-model.trim="questionValue"
      label="Question"
      :validator="validateQuestion"
      :failed-policies="failedQuestionPolicies" />

    <FrFloatingLabelInput
      class="mb-3"
      type="password"
      :reveal="true"
      :field-name="answerName"
      v-model.trim="answerValue"
      label="Answer"
      :validator="validateAnswer"
      :failed-policies="failedAnswerPolicies" />
    <hr>
  </div>
</template>

<script>
import {
  map,
  find,
} from 'lodash';
import { BFormSelect } from 'bootstrap-vue';
import FloatingLabelInput from '@forgerock/platform-components/src/components/FloatingLabelInput';

export default {
  name: 'KbaCreateCallback',
  components: {
    BFormSelect,
    FrFloatingLabelInput: FloatingLabelInput,
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
      questionName: '',
      questionValue: '',
      answerName: '',
      answerValue: '',
      selected: null,
      showCustom: false,
      failedQuestionPolicies: [],
      failedAnswerPolicies: [],
    };
  },
  mounted() {
    this.predefinedQuestions = this.callback.getPredefinedQuestions();
    this.questionName = `callback_${this.index}`;
    this.answerName = `callback_${this.index}00`;

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
      this.setSubmitButton();
    },
    // This function sets the value of the question's hidden input and disbables the question value from other kba question selection options on the dom
    onQuestionSelectionChange() {
      // get a list of values from other .kbaQuestion's
      const otherQuestionValues = map(document.querySelectorAll(`.kbaQuestion:not([name=${this.questionName}])`), (question) => question.value);
      // get all the option elements from the other .kbaQuestion_selector's
      const otherQuestionSelectorOptions = document.querySelectorAll(`select.kbaQuestionSelect:not(#${this.questionName}_selector) option`);
      // if "Provide your own" is selected open the custom question input and reset this.questionValue
      if (this.selected === 'custom') {
        this.showCustom = true;
        this.questionValue = '';
      } else {
        // in all other cases hide the custom question input
        this.showCustom = false;
        this.questionValue = this.selected;
      }
      // disable the ability to select the same question more than once
      map(otherQuestionSelectorOptions, (option) => { option.disabled = !!(option.value === this.questionValue || otherQuestionValues.includes(option.value)); }); // eslint-disable-line no-param-reassign

      this.validateQuestion();
      this.validateAnswer();
    },
    // This function looks to make sure the question is both non-empty and unique
    validateQuestion() {
      // Find all the other questions on the dom
      const otherQuestionInputs = document.querySelectorAll(`input.kbaQuestion:not([name=${this.questionName}])`);
      const otherQuestions = map(otherQuestionInputs, (question) => question.value);

      // Look for questions with the same value as the local question
      const matchesQuestion = otherQuestions.find((q) => q === this.questionValue);

      this.failedQuestionPolicies = [];

      if (this.questionValue && this.questionValue.length === 0) {
        this.failedQuestionPolicies.push(this.requiredText);
      }

      if (matchesQuestion) {
        this.failedQuestionPolicies.push(this.uniqueText);
      }

      this.callback.setQuestion(this.questionValue);

      this.setSubmitButton();
    },
    // This function looks at the question's answer to make sure it is not empty
    validateAnswer() {
      this.failedAnswerPolicies = [];

      if (this.answerValue.length === 0) {
        this.failedAnswerPolicies.push(this.requiredText);
      }

      this.callback.setAnswer(this.answerValue);

      this.setSubmitButton();
    },
    // This function disables/enables the callback form's submit button
    setSubmitButton() {
      // A brief delay needs to happen here so the .is-invalid class can be added to the floating label inputs in the case of invalid data
      setTimeout(() => {
        // Look for any empty custom questions
        const hasEmptyQuestions = find(document.querySelectorAll('input.kbaQuestion'), { value: '' });
        // Find out if the form is valid by first looking to this instance of KbaCreateCallback for empty questions, or failedPolicies locally
        // If nothing is invalid locally look at the rest of the dom to see if any of the other KbaCreateCallbacks are in an error state
        const formIsInvalid = hasEmptyQuestions || this.failedAnswerPolicies.length || this.failedQuestionPolicies.length || document.querySelectorAll('.kbaQuestionAnswerContainer .is-invalid').length;

        this.callbackSubmitButton.disabled = formIsInvalid;
      }, 10);
    },
  },
};
</script>
