<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <FrListItem
    :collapsible="true"
    :panel-shown="false">
    <div
      slot="list-item-header"
      class="d-inline-flex w-100 media">
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
        <div class="btn btn-link btn-sm float-right btn-edit">
          {{ $t('common.reset') }}
        </div>
      </div>
    </div>

    <div
      v-if="selected.length"
      slot="list-item-collapse-body"
      class="d-inline-flex w-100">
      <BForm class="w-100">
        <BRow>
          <BCol sm="8">
            <ValidationObserver ref="observer">
              <fieldset
                v-for="(select, id) in selected"
                :key="id"
                class="pb-3">
                <label>
                  {{ $t('common.user.kba.question') }} {{ select.index }}
                </label>
                <BFormSelect
                  class="mb-3"
                  v-model="select.selected"
                  :options="selectOptions" />

                <div
                  v-if="select && select.selected === customIndex"
                  class="pb-3">
                  <label>{{ $t('pages.profile.accountSecurity.custom') }}</label>
                  <ValidationProvider
                    :name="$t('pages.profile.accountSecurity.custom') + ' ' + select.index"
                    rules="required"
                    v-slot="{ errors }">
                    <BFormInput
                      type="text"
                      v-model.trim="select.custom"
                      :name="$t('pages.profile.accountSecurity.custom') + ' ' + select.index"
                      :class="[{'is-invalid': errors.length > 0}, 'form-control']" />
                    <FrValidationError
                      :validator-errors="errors"
                      :field-name="$t('pages.profile.accountSecurity.custom') + ' ' + select.index" />
                  </ValidationProvider>
                </div>

                <div class="form-group mb-0">
                  <label>{{ $t('common.user.kba.answer') }}</label>
                  <ValidationProvider
                    :name="$t('common.user.kba.answer') + ' ' + select.index"
                    rules="required"
                    v-slot="{ errors }">
                    <BFormInput
                      type="text"
                      v-model.trim="select.answer"
                      :name="$t('common.user.kba.answer') + ' ' + select.index"
                      :class="[{'is-invalid': errors.length > 0}, 'form-control']" />
                    <FrValidationError
                      :validator-errors="errors"
                      :field-name="$t('common.user.kba.answer') + ' ' + select.index" />
                  </ValidationProvider>
                </div>

                <hr
                  v-if="id !== selected.length - 1"
                  class="mb-3 mt-4">
              </fieldset>

              <FrLoadingButton
                type="button"
                variant="primary"
                class="ld-ext-right mb-3"
                :label="$t('common.user.kba.saveQuestions')"
                :loading="loading"
                @click="onSaveKBA" />
            </ValidationObserver>
          </BCol>
        </BRow>
      </BForm>
    </div>
  </FrListItem>
</template>

<script>
import {
  includes,
  map,
  noop,
  times,
} from 'lodash';
import {
  ValidationObserver,
  ValidationProvider,
} from 'vee-validate';
import ListItem from '@forgerock/platform-components/src/components/listItem/';
import ValidationErrorList from '@forgerock/platform-components/src/components/ValidationErrorList/';
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
    FrValidationError: ValidationErrorList,
    ValidationObserver,
    ValidationProvider,
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
      selected: [],
      customIndex: null,
      loading: false,
    };
  },
  mounted() {
    this.questions = this.kbaData.questions;
    this.initializeForm(this.kbaData.minimumAnswersToDefine);
  },
  methods: {
    initializeForm(minimumRequired) {
      const { locale, fallbackLocale } = this.$i18n;

      // set form state based on stored user questions
      times(minimumRequired, (index) => {
        this.selected.push({
          selected: null, index: index + 1, answer: '', custom: '',
        });
      });

      // create select options
      this.selectOptions = map(this.questions, (question, key) => ({ value: key, text: question[locale] || question[fallbackLocale], disabled: true }));

      this.customIndex = this.selectOptions.length + 1;
      this.selectOptions.unshift({ value: null, text: this.$t('common.user.kba.selectQuestion'), disabled: true });
      this.selectOptions.push({ value: this.customIndex, text: this.$t('common.user.kba.custom'), disabled: false });
    },

    generatePatch() {
      const values = map(this.selected, (field) => {
        if (field.custom) {
          return {
            answer: field.answer,
            customQuestion: field.custom,
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

    clearComponent() {
      this.loading = false;
      this.questions = {};
      this.selectOptions = [];
      this.selected = [];
      this.customIndex = null;

      this.questions = this.kbaData.questions;
      this.initializeForm(this.kbaData.minimumAnswersToDefine);
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
    selected: {
      handler() {
        // create array of selected options that aren't custom
        const toDisable = map(this.selected, (s) => {
          if (s.selected !== null && s.selected !== this.customIndex) {
            return s.selected;
          }
          return null;
        });

        // set any [toDisable] option to disabled
        this.selectOptions.forEach((o) => {
          if (includes(toDisable, o.value) || o.value === null) {
            /* eslint no-param-reassign: ["error", { "ignorePropertyModificationsFor": ["0"] }] */
            o.disabled = true;
          } else {
            o.disabled = false;
          }
        });
      },
      deep: true,
    },
    kbaData: { deep: true, handler: noop },
  },
};
</script>
