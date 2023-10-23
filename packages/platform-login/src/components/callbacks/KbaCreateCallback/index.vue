<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

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
        <FrIcon
          name="lock"
        />
      </div>
      <div class="col pl-0">
        <hr>
      </div>
    </div>

    <ValidationObserver ref="observer">
      <fieldset class="w-100">
        <legend
          id="legend-kba-create-callback-description"
          v-if="showHeader"
          class="text-center kbaHeaderText mb-4">
          {{ $t('login.kba.description') }}
        </legend>
        <FrField
          v-model="selected"
          class="mb-2 kbaQuestionSelect"
          type="select"
          input-labelledby="legend-kba-create-callback-description"
          :searchable="true"
          :label="callback.getPrompt()"
          :name="questionModel.key + '_question_selector'"
          :id="questionModel.key + '_selector'"
          :option-height-calculation="48"
          :options="options"
          :validation="questionSelectValidation"
          :floating-label="floatingLabel"
          @input="onQuestionSelectionChange()"
          @open="loadOptions()" />
        <FrField
          v-if="showCustom"
          v-model="questionModel.value"
          class="mb-3"
          :label="questionModel.title"
          :name="questionModel.key"
          :validation="questionTextInputValidation"
          :validation-immediate="true"
          :floating-label="floatingLabel"
          @input="onQuestionSelectionChange()" />
        <FrField
          v-model="answerModel"
          class="mb-3"
          type="password"
          validation="required"
          :label="$t('login.kba.answer')"
          :name="`callback_${index}_answer_field`"
          :disabled="selected === null"
          :floating-label="floatingLabel"
          @input="validateAnswer" />
      </fieldset>
    </ValidationObserver>
    <hr>
  </div>
</template>

<script>
import { ValidationObserver } from 'vee-validate';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';

export default {
  name: 'KbaCreateCallback',
  components: {
    ValidationObserver,
    FrField,
    FrIcon,
  },
  mixins: [
    TranslationMixin,
  ],
  props: {
    callback: {
      type: Object,
      required: true,
    },
    floatingLabel: {
      type: Boolean,
      default: true,
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
      },
      questionSelectValidation: {},
      questionTextInputValidation: { required: true },
      options: [],
      selected: null,
      showCustom: false,
    };
  },
  mounted() {
    this.$emit('disable-next-button', true);
    this.loadOptions();
  },
  methods: {
    /**
     * Get all other KBA callback components
     *
     * @param {Number} index callback index
     * @returns {Object[]} callback vue components
     */
    getOtherKbaCallbacks(index) {
      return this.$parent.$children.filter((x) => (x.callback && x.callback.getType() === 'KbaCreateCallback' && x.index !== index));
    },
    /**
     * Get question input values for all other KBA callback components
     *
     * @param {Number} index callback index
     * @returns {String[]} question values
     */
    getOtherQuestionValues(index) {
      return this.getOtherKbaCallbacks(index).map((x) => (x.callback.getInputValue()));
    },
    loadOptions() {
      const customQuestionOption = { value: 'custom', text: this.$t('login.kba.custom') };
      const predefinedQuestions = this.getTranslation(this.callback.getPredefinedQuestions());

      // Add any predefined question
      const options = [
        ...predefinedQuestions.map((question) => ({ text: question, value: question })),
      ];

      if (this.callback.getOutputByName('allowUserDefinedQuestions', true) !== false) {
        options.push(customQuestionOption);
      }

      // remove questions that are selected in other KBA callbacks
      const otherValues = this.getOtherQuestionValues(this.index);
      this.options = options.filter((question) => (otherValues.indexOf(question.value) === -1));
    },
    /**
     * This function sets validation for the question and sets validation
     * for other KBACreateCallback components on the page
     */
    onQuestionSelectionChange() {
      // if "Provide your own" is selected, show the custom question input
      this.showCustom = this.selected === 'custom';

      this.validateQuestion();

      // trigger validation on other KBA callbacks
      this.getOtherKbaCallbacks(this.index).map((x) => {
        if (x.callback.getInputValue()) x.validateQuestion();
        return true;
      });
    },
    /**
     * This function looks to make sure the question is both non-empty and unique
     */
    validateQuestion() {
      // Find all the other KbaCreateCallbacks question values to ensure uniqueness
      const otherValues = this.getOtherQuestionValues(this.index);

      if (this.selected === 'custom') {
        this.questionSelectValidation = {};
        this.questionTextInputValidation = { required: true, unique: otherValues };
        this.callback.setQuestion(this.questionModel.value);
      } else {
        this.questionSelectValidation = { required: true, uniqueValue: otherValues };
        this.questionTextInputValidation = {};
        this.callback.setQuestion(this.selected);
      }

      this.setSubmitButton();
    },
    /**
     * This function looks at the question's answer to make sure it is not empty
     */
    validateAnswer() {
      this.callback.setAnswer(this.answerModel);
      this.setSubmitButton();
    },
    /**
     * This function disables/enables the callback form's submit button
     */
    setSubmitButton() {
      // A delay is needed here so the .error-message class can be added to the field component in the case of invalid data
      this.$nextTick(() => {
        // Let vee-validate determine if the form is valid for each field
        // Disable if there is an error shown locally or in the other KbaCreateCallbacks
        this.$refs.observer.validate().then((isValid) => {
          this.$emit('disable-next-button', !isValid);
        });
      });
    },
  },
};
</script>
