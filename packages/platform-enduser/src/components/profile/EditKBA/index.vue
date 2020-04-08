<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <FrListItem
    :collapsible="true"
    :panel-shown="false">
    <template v-slot:list-item-header>
      <div class="d-inline-flex w-100 media">
        <div class="media-body align-self-center">
          <h6 class="my-0">
            {{ $t('pages.profile.accountSecurity.securityQuestions') }}
          </h6>
        </div>
        <div class="d-flex ml-3 align-self-center">
          <div
            class="btn btn-link btn-sm float-right btn-cancel"
            @click="clearComponent()"
            ref="cancel">
            {{ $t('common.cancel') }}
          </div>
          <div
            class="btn btn-link btn-sm float-right btn-edit"
            @click="initializeForm(kbaData.minimumAnswersToDefine)">
            {{ $t('common.reset') }}
          </div>
        </div>
      </div>
    </template>

    <template v-slot:list-item-collapse-body>
      <div
        v-if="kbaChoices.length"
        class="d-inline-flex w-100">
        <BForm class="w-100">
          <BRow>
            <BCol sm="8">
              <ValidationObserver ref="observer">
                <fieldset
                  v-for="(kbaChoice, id) in kbaChoices"
                  :key="id"
                  class="pb-3">
                  <FrField
                    :field="kbaChoice.selected"
                    :prepend-title="true"
                    class="mb-3" />
                  <FrField
                    v-if="kbaChoice.selected.value === customIndex"
                    :field="kbaChoice.customQuestion"
                    :prepend-title="true"
                    class="pb-3" />
                  <FrField
                    :field="kbaChoice.answer"
                    :prepend-title="true"
                    class="form-group mb-0" />
                  <hr
                    v-if="id !== kbaChoices.length - 1"
                    class="mb-3 mt-4">
                </fieldset>

                <FrLoadingButton
                  type="button"
                  variant="primary"
                  class="ld-ext-right mb-3"
                  :label="$t('user.kba.saveQuestions')"
                  :loading="loading"
                  @click="onSaveKBA" />
              </ValidationObserver>
            </BCol>
          </BRow>
        </BForm>
      </div>
    </template>
  </FrListItem>
</template>

<script>
import {
  includes,
  map,
  noop,
  times,
} from 'lodash';
import { ValidationObserver } from 'vee-validate';
import ListItem from '@forgerock/platform-shared/src/components/ListItem/';
import FrField from '@forgerock/platform-shared/src/components/Field';
import LoadingButton from '@/components/utils/LoadingButton';

/**
 * @description Allows a user to change their KBA, will ensure based on KBA configuration a user must match the systems KBA requirements.
 *
 */
export default {
  name: 'EditKBA',
  components: {
    FrListItem: ListItem,
    FrLoadingButton: LoadingButton,
    FrField,
    ValidationObserver,
  },
  props: {
    kbaData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      questions: {},
      selectOptions: [],
      kbaChoices: [],
      customIndex: 0,
      loading: false,
    };
  },
  mounted() {
    this.questions = this.kbaData.questions;
  },
  methods: {
    initializeForm(minimumRequired) {
      const { locale, fallbackLocale } = this.$i18n;

      // create select options
      this.selectOptions = map(this.questions, (question, index) => ({ value: index, text: question[locale] || question[fallbackLocale], $isDisabled: false }));
      this.selectOptions.unshift({ value: 0, text: this.$t('user.kba.selectQuestion'), $isDisabled: true });
      this.customIndex = this.selectOptions.length;
      this.selectOptions.push({ value: this.customIndex, text: this.$t('user.kba.custom'), $isDisabled: false });

      // set form state based on stored user questions
      times(minimumRequired, (index) => {
        this.kbaChoices.push({
          selected: {
            type: 'select',
            title: `${this.$t('user.kba.question')} ${index + 1}`,
            value: 0,
            options: this.selectOptions,
          },
          answer: {
            key: `${this.$t('user.kba.answer')} ${index + 1}`,
            title: this.$t('user.kba.answer'),
            value: '',
            validation: 'required',
          },
          customQuestion: {
            key: `${this.$t('pages.profile.accountSecurity.custom')} ${index + 1}`,
            title: this.$t('pages.profile.accountSecurity.custom'),
            value: '',
            validation: 'required',
          },
        });
      });
    },

    generatePatch() {
      const values = map(this.kbaChoices, (field) => {
        if (field.customQuestion.value) {
          return {
            answer: field.answer.value,
            customQuestion: field.customQuestion.value,
          };
        }
        return {
          answer: field.answer.value,
          questionId: field.selected.value,
        };
      });

      return [{
        operation: 'replace',
        field: '/kbaInfo',
        value: values,
      }];
    },

    clearComponent() {
      this.loading = false;
      this.selectOptions = [];
      this.kbaChoices = [];
      this.customIndex = null;
      this.questions = this.kbaData.questions;
    },

    async onSaveKBA() {
      const isValid = await this.$refs.observer.validate();
      if (isValid) {
        this.loading = true;
        this.$emit('updateKBA', this.generatePatch(), {
          onSuccess: () => {
            this.$refs.cancel.click();
          },
          onError: () => {
            this.loading = false;
          },
        });
      }
    },
  },
  watch: {
    kbaChoices: {
      handler() {
        // create array of selected options that aren't custom
        const toDisable = map(this.kbaChoices, (kbaChoice) => {
          if (kbaChoice.selected.value !== null && kbaChoice.selected.value !== this.customIndex) {
            return kbaChoice.selected.value;
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
  },
};
</script>
