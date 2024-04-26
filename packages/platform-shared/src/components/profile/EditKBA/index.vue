<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BRow>
      <BCol md="10">
        <h3 class="h5">
          {{ $t('pages.profile.accountSecurity.securityQuestions') }}
        </h3>
      </BCol>
      <BCol
        md="2"
        class="text-right text-nowrap">
        <BLink
          :aria-label="$t('pages.profile.accountSecurity.resetSecurityQuestions')"
          @click="initializeForm(kbaData.minimumAnswersToDefine)">
          {{ showCancel ? $t('common.cancel') : $t('common.reset') }}
        </BLink>
      </BCol>
    </BRow>
    <BCollapse
      v-model="showKBAResetForm"
      @hidden="clearComponent"
      id="collapse-1"
      class="mt-4">
      <VeeForm
        ref="observer"
        as="span">
        <div
          v-for="(kbaChoice, id) in kbaChoices"
          :key="id"
          class="pb-3">
          <FrField
            v-model="kbaChoice.selected"
            class="mb-3"
            type="select"
            :label="$t('user.kba.selectQuestion')"
            :options="selectOptions"
            validation="required"
            :name="`${$t('user.kba.selectQuestion')} ${id + 1}`"
          />
          <FrField
            v-if="kbaChoice.selected === customIndex"
            v-model="kbaChoice.customQuestion"
            class="mb-3"
            validation="required"
            :label="$t('pages.profile.accountSecurity.custom')"
            :name="`${$t('pages.profile.accountSecurity.custom')} ${id + 1}`" />
          <FrField
            v-model="kbaChoice.answer"
            class="mb-3"
            validation="required"
            :label="$t('user.kba.answer')"
            :name="`${$t('user.kba.answer')} ${id + 1}`" />
          <hr
            v-if="id !== kbaChoices.length - 1"
            class="mt-4">
        </div>
        <FrButtonWithSpinner
          :button-text="$t('common.save')"
          :disabled="processingRequest"
          :show-spinner="processingRequest"
          :spinner-text="$t('common.saving')"
          @click="onSaveKBA" />
      </VeeForm>
    </BCollapse>
  </div>
</template>

<script>
import {
  includes,
  map,
  noop,
  times,
} from 'lodash';
import {
  BCol,
  BCollapse,
  BLink,
  BRow,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import { Form as VeeForm } from 'vee-validate';
/**
 * @description Allows a user to change their KBA, will ensure based on KBA configuration a user must match the systems KBA requirements.
 *
 */
export default {
  name: 'EditKBA',
  components: {
    FrButtonWithSpinner,
    FrField,
    BCol,
    BCollapse,
    BLink,
    BRow,
    VeeForm,
  },
  props: {
    kbaData: {
      type: Object,
      default: () => {},
    },
    processingRequest: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      questions: {},
      selectOptions: [],
      kbaChoices: [],
      customIndex: null,
      showCancel: false,
      showKBAResetForm: false,
    };
  },
  mounted() {
    this.questions = this.kbaData.questions;
  },
  methods: {
    /**
     * Initializes select options for each required KBA definition
     * @param {Number} minimumRequired number of KBA definitions required
     */
    initializeForm(minimumRequired) {
      // toggle form collapse
      this.showKBAResetForm = !this.showKBAResetForm;
      const { locale, fallbackLocale } = this.$i18n;

      // create select options
      this.selectOptions = map(this.questions, (question, index) => ({ value: index, text: question[locale] || question[fallbackLocale] || Object.values(question)[0], $isDisabled: false }));
      this.customIndex = this.selectOptions.length;
      this.selectOptions.push({ value: this.customIndex, text: this.$t('user.kba.custom'), $isDisabled: false });

      // set form state based on stored user questions
      times(minimumRequired, () => {
        this.kbaChoices.push({
          selected: '',
          answer: '',
          customQuestion: '',
        });
      });
      this.showCancel = true;
    },
    /**
     * Generate patch options for updating KBA
     * @returns {Object[]} Array containing single object with patch options as key/value pairs
     */
    generatePatch() {
      const values = map(this.kbaChoices, (field) => {
        if (field.customQuestion) {
          return {
            answer: field.answer,
            customQuestion: field.customQuestion,
          };
        }
        return {
          answer: field.answer,
          questionId: field.selected,
        };
      });

      return [{
        operation: 'replace',
        field: '/kbaInfo',
        value: values,
      }];
    },
    /**
     * Clear the component data
     */
    clearComponent() {
      this.selectOptions = [];
      this.kbaChoices = [];
      this.customIndex = null;
      this.questions = this.kbaData.questions;
      this.showCancel = false;
    },
    /**
     * Handler for clicking the save button.
     * Validates form input, then sends event to update KBA and collapses component if successful
     * Emits an event for patching the kba information
     */
    onSaveKBA() {
      return this.$refs.observer.validate().then(({ valid }) => {
        if (valid) {
          const patch = this.generatePatch();
          this.$emit('updateKBA', patch);
        }
      });
    },
  },

  watch: {
    kbaChoices: {
      handler() {
        // create array of selected options that aren't custom
        const toDisable = map(this.kbaChoices, (kbaChoice) => {
          if (kbaChoice.selected !== null && kbaChoice.selected !== this.customIndex) {
            return kbaChoice.selected;
          }
          return null;
        });

        // set any [toDisable] option to disabled
        this.selectOptions.forEach((option) => {
          if (includes(toDisable, option.value) || option.value === 0) {
            option.$isDisabled = true;
          } else {
            option.$isDisabled = false;
          }
        });
      },
      deep: true,
    },
    kbaData: { deep: true, handler: noop },
    processingRequest: {
      handler() {
        if (!this.processingRequest) {
          this.showKBAResetForm = !this.showKBAResetForm;
        }
      },
    },
  },
};
</script>
