<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BModal
    id="createResourceModal"
    @shown="focusField"
    cancel-variant="outline-secondary">
    <div
      slot="modal-header"
      class="d-flex w-100 h-100">
      <h5 class="modal-title align-self-center text-center">
        {{ $t('common.new') }} {{ resourceName }}
      </h5>
      <button
        type="button"
        aria-label="Close"
        class="close"
        @click="hideModal">
        <i class="material-icons-outlined font-weight-bolder">
          clear
        </i>
      </button>
    </div>
    <BRow>
      <BCol>
        <!-- Creating resource currently only supports String, Number and Boolean -->
        <BForm
          v-if="createProperties.length > 0"
          class="mb-3"
          @submit="saveForm"
          name="edit-personal-form">
          <ValidationObserver ref="observer">
            <template v-for="(field, index) in createProperties">
              <BFormGroup
                :key="'createResource' +index"
                v-if="(field.type === 'string' || field.type === 'number') && field.encryption === undefined">
                <label
                  v-if="field.title"
                  class="float-left"
                  :for="field.title">
                  {{ field.title }}
                </label>
                <label
                  v-else
                  class="float-left"
                  :for="field.key">
                  {{ field.key }}
                </label>
                <ValidationProvider
                  :name="field.key"
                  :rules="field.required ? 'required' : ''"
                  v-slot="{ errors }">
                  <input
                    v-if="field.type === 'string'"
                    :ref="index === 0 ? 'focusInput' : ''"
                    @keypress.enter="saveForm"
                    :name="field.key"
                    type="text"
                    :class="[{'is-invalid': errors.length > 0}, 'form-control']"
                    :autocomplete="field.key"
                    v-model.trim="formFields[field.key]">

                  <input
                    v-else
                    :ref="index === 0 ? 'focusInput' : ''"
                    :name="field.key"
                    type="number"
                    @keypress.enter="saveForm"
                    :class="[{'is-invalid': errors.length > 0}, 'form-control']"
                    :autocomplete="field.key"
                    v-model.number="formFields[field.key]">
                  <FrValidationError
                    :validator-errors="errors"
                    :field-name="field.key" />
                </ValidationProvider>
              </BFormGroup>

              <!-- for boolean values -->
              <BFormGroup
                :key="'createResource' +index"
                v-if="field.type === 'boolean'">
                <div class="d-flex flex-column">
                  <label
                    class="mr-auto"
                    :for="field.title">
                    {{ field.title }}
                  </label>

                  <div class="mr-auto">
                    <ToggleButton
                      class="mt-2 p-0 fr-toggle-primary"
                      :height="28"
                      :width="56"
                      :sync="true"
                      :css-colors="true"
                      :labels="{checked: $t('common.yes'), unchecked: $t('common.no')}"
                      v-model="formFields[field.key]" />
                  </div>
                </div>
              </BFormGroup>
            </template>

            <!-- Special logic for password -->
            <FrPolicyPasswordInput
              v-if="passwordCheck"
              :policy-api="`${resourceType}/${resourceName}/policyTest`"
              v-model="formFields['password']">
              <BFormGroup
                class="mb-3"
                slot="custom-input">
                <label for="createPassword">
                  {{ $t('pages.access.password') }}
                </label>
                <div class="form-label-password form-label-group mb-0">
                  <ValidationProvider
                    mode="aggressive"
                    name="password"
                    rules="required|policy">
                    <BFormInput
                      id="createPassword"
                      autocomplete="password"
                      :type="passwordInputType"
                      v-model="formFields['password']"
                      name="password" />
                  </ValidationProvider>
                  <div class="input-group-append">
                    <button
                      @click="revealNew"
                      class="btn btn-secondary"
                      type="button">
                      <i
                        v-if="showPassword"
                        class="material-icons-outlined">
                        visibility
                      </i>
                      <i
                        v-else
                        class="material-icons-outlined">
                        visibility_off
                      </i>
                    </button>
                  </div>
                </div>
              </BFormGroup>
            </FrPolicyPasswordInput>
          </ValidationObserver>
        </BForm>
        <template v-else>
          <h3 class="text-center">
            {{ $t('pages.access.noFields') }}
          </h3>
        </template>
      </BCol>
    </BRow>

    <div
      slot="modal-footer"
      class="w-100">
      <div class="float-right">
        <BButton
          @click.prevent="hideModal"
          variant="link">
          {{ $t('common.cancel') }}
        </BButton>
        <BButton
          type="button"
          variant="primary"
          @click="saveForm"
          :disabled="formFields.length === 0">
          {{ $t('common.save') }}
        </BButton>
      </div>
    </div>
  </BModal>
</template>

<script>
import {
  capitalize,
  clone,
  each,
  isArray,
  isNumber,
  isString,
} from 'lodash';
import {
  BButton,
  BFormInput,
  BFormGroup,
  BForm,
  BRow,
  BCol,
  BModal,
} from 'bootstrap-vue';
import { ValidationProvider, ValidationObserver } from 'vee-validate';
import PolicyPasswordInput from '@forgerock/platform-shared/src/components/PolicyPasswordInput/';
import ValidationErrorList from '@forgerock/platform-shared/src/components/ValidationErrorList/';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';

/**
 * @description Dialog used for managing the create portion of delegated admin. Auto generates fields based on backend return.
 * Currently generates string, number, boolean and password (not based on type, but on field name being passsword).
 *
 * @param {array} createProperties - Required list of objects used to generate the fields for creating a user
 * @param {string} resourceName - Required resource name
 * @param {string} resourceType - Required type of resource, currently only supports managed
 *
 * @mixin - utils/mixins/ResourceMixin.vue
 *
 * @fires POST type/name?_action=create (e.g. managed/user?_action=create) - Creates a record for the specified managed resource
 */
export default {
  name: 'CreateResource',
  components: {
    FrValidationError: ValidationErrorList,
    FrPolicyPasswordInput: PolicyPasswordInput,
    BButton,
    BFormInput,
    BFormGroup,
    BForm,
    BRow,
    BCol,
    BModal,
    ValidationProvider,
    ValidationObserver,
  },
  mixins: [
    ResourceMixin,
    RestMixin,
    NotificationMixin,
  ],
  props: {
    createProperties: {
      type: Array,
      required: true,
      default: () => [],
    },
    resourceName: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      required: true,
    },
  },
  data() {
    const tempFormFields = {};

    let tempPasswordCheck = false;

    each(this.createProperties, (prop) => {
      if (prop.type === 'string' || prop.type === 'number') {
        tempFormFields[prop.key] = '';
      } else {
        tempFormFields[prop.key] = false;
      }

      // Special logic for password
      if (prop.key === 'password') {
        tempPasswordCheck = true;
      }
    });

    return {
      formFields: tempFormFields,
      passwordCheck: tempPasswordCheck,
      passwordInputType: 'password',
      showPassword: true,
    };
  },
  methods: {
    saveForm() {
      const idmInstance = this.getRequestService();
      const validateSave = this.$refs.observer.validate();

      validateSave.then((isValid) => {
        if (isValid) {
          const saveData = this.cleanData(clone(this.formFields));

          idmInstance.post(`${this.resourceType}/${this.resourceName}?_action=create`, saveData).then(() => {
            this.$emit('refreshGrid');
            this.$refs.observer.reset();
            this.hideModal();

            this.displayNotification('IDMMessages', 'success', this.$t('pages.access.successCreate', { resource: capitalize(this.resourceName) }));
          },
          (error) => {
            this.setErrors(error.response);
          });
        } else {
          this.displayNotification('IDMMessages', 'error', this.$t('pages.access.invalidCreate'));
        }
      });
    },
    setErrors(error) {
      const generatedErrors = this.findPolicyError(error, this.createProperties);
      this.$refs.observer.reset();

      if (generatedErrors.length > 0) {
        each(generatedErrors, (generatedError) => {
          if (generatedError.exists) {
            this.$refs.observer.setErrors({
              [generatedError.field]: [generatedError.msg],
            });
          }
        });
      } else {
        this.displayNotification('IDMMessages', 'error', this.$t('pages.access.invalidCreate'));
      }
    },
    hideModal() {
      this.resetDialog();
      this.$root.$emit('bv::hide::modal', 'createResourceModal');
    },
    // Clean dialog after closing/saving
    resetDialog() {
      if (this.$refs.observer) {
        this.$refs.observer.reset();
      }
      this.passwordInputType = 'password';
      this.showPassword = true;

      each(this.formFields, (value, key) => {
        if (isString(value) || isNumber(value)) {
          this.formFields[key] = '';
        } else {
          this.formFields[key] = false;
        }
      });
    },
    // Hide/show for special password field
    revealNew() {
      if (this.passwordInputType === 'password') {
        this.passwordInputType = 'text';
        this.showPassword = false;
      } else {
        this.passwordInputType = 'password';
        this.showPassword = true;
      }
    },
    // Remove optional fields to not save with empty string
    cleanData(data) {
      each(data, (value, key) => {
        if (isString(value) && value.length === 0) {
          // eslint-disable-next-line no-param-reassign
          delete data[key];
        }
      });
      return data;
    },
    focusField() {
      if (isArray(this.$refs.focusInput)) {
        this.$refs.focusInput[0].focus();
      }
    },
  },
};
</script>
