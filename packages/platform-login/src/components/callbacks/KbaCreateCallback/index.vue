<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

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
        <FrIcon name="lock" />
      </div>
      <div class="col pl-0">
        <hr>
      </div>
    </div>

    <VeeForm
      ref="observer"
      as="span">
      <fieldset class="w-100">
        <legend
          id="legend-kba-create-callback-description"
          v-if="showHeader"
          class="text-center kbaHeaderText mb-4">
          {{ $t('login.kba.description') }}
        </legend>
        <FrField
          :value="selected"
          @input="selected = $event; handleQuestionChoiceChange()"
          class="mb-2 kbaQuestionSelect"
          type="select"
          :searchable="true"
          :label="callback.getPrompt()"
          :name="questionModel.key + '_question_selector'"
          :id="questionModel.key + '_selector'"
          :option-height-calculation="48"
          :options="options"
          :validation="questionSelectValidation"
          :floating-label="floatingLabel"
          :is-required-aria="true"
          @open="setOptions()" />
        <FrField
          v-if="showCustom"
          :value="questionModel.value"
          @input="questionModel.value = $event; handleQuestionChoiceChange()"
          class="mb-3"
          :label="questionModel.title"
          :name="questionModel.key"
          :validation="questionTextInputValidation"
          :validation-immediate="true"
          :floating-label="floatingLabel"
          :is-required-aria="true" />
        <FrField
          :value="answerModel"
          @input="answerModel = $event; validateAnswer()"
          class="mb-3 question-answer"
          type="password"
          validation="required"
          :label="answerLabel"
          :name="`callback_${index}_answer_field`"
          :disabled="answerFieldDisabled"
          :floating-label="floatingLabel"
          :validation-immediate="!answerFieldDisabled"
          :is-required-aria="true" />
      </fieldset>
    </VeeForm>
    <hr>
  </div>
</template>

<script>
import { Form as VeeForm } from 'vee-validate';
import { mapStores } from 'pinia';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import { useKbaChoicesStore } from '../../../stores/kbaChoices';

export default {
  name: 'KbaCreateCallback',
  components: {
    VeeForm,
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
    // Define base options from props
    const customQuestionOption = { value: 'custom', text: this.$t('login.kba.custom') };
    const exposeCustomQuestion = this.callback.getOutputByName('allowUserDefinedQuestions', true) !== false;
    const baseOptions = [
      ...this.getTranslation(this.callback.getPredefinedQuestions())
        .map((question) => ({ text: question, value: question })),
      ...(exposeCustomQuestion ? [customQuestionOption] : []),
    ];

    return {
      answerModel: '',
      baseOptions,
      questionModel: {
        key: `callback_${this.index}_question_field`,
        title: this.$t('login.kba.question'),
        value: '',
      },
      questionSelectValidation: {},
      questionTextInputValidation: { required: true },
      options: [],
      selected: null,
    };
  },
  computed: {
    ...mapStores(useKbaChoicesStore),
    showCustom() {
      // if "Provide your own" is selected, show the custom question input
      return this.selected === 'custom';
    },
    answerLabel() {
      const currentChoice = this.showCustom ? this.questionModel.value : this.selected;
      return currentChoice ? this.$t('login.kba.answerFor', { question: currentChoice }) : this.$t('login.kba.answer');
    },
    answerFieldDisabled() {
      return this.selected === null;
    },
  },
  mounted() {
    this.$emit('disable-next-button', true);
    this.setOptions();
    // Subscribe to the KBA store so that validation can be updated in light of choices made across other KbaCreateCallback components
    this.kbaChoicesStore.$subscribe(() => {
      if (this.selected !== null) {
        this.validateQuestion();
      }
    });
  },
  watch: {
    selected() {
      this.handleQuestionChoiceChange();
    },
    // eslint-disable-next-line object-shorthand
    'questionModel.value'() {
      this.handleQuestionChoiceChange();
    },
  },
  methods: {
    /**
     * Sets the rendered question list to be those defined by props minus any choices from other KbaCreateCallbacks
     */
    setOptions() {
      const otherValues = this.kbaChoicesStore.getOtherChoices(this.index);
      this.options = this.baseOptions.filter((question) => (otherValues.indexOf(question.value) === -1));
    },
    /**
     * Called whenever the question choice changes to store the new choice, which will asynchronously trigger
     * validation of the current and any other KbaCreateCallbacks using the same store.
     */
    handleQuestionChoiceChange() {
      const currentChoice = this.showCustom ? this.questionModel.value : this.selected;
      this.callback.setQuestion(currentChoice);
      this.kbaChoicesStore.storeChoice(currentChoice, this.index);
    },
    /**
     * This function looks to make sure the question is both non-empty and unique
     */
    validateQuestion() {
      // Find all the other KbaCreateCallbacks question values to ensure uniqueness
      const otherValues = this.kbaChoicesStore.getOtherChoices(this.index);

      if (this.showCustom) {
        this.questionSelectValidation = {};
        this.questionTextInputValidation = { required: true, unique: otherValues };
      } else {
        this.questionSelectValidation = { required: true, uniqueValue: otherValues };
        this.questionTextInputValidation = {};
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
        this.$refs.observer.validate().then(({ valid }) => {
          this.$emit('disable-next-button', !valid);
        });
      });
    },
  },
};
</script>
<style scoped>
.question-answer :deep(label) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100% !important;
}
</style>
