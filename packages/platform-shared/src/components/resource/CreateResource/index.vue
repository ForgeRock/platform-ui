<!-- Copyright (c) 2019-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    ref="observer"
    v-slot="{ meta: { valid } }"
    as="span">
    <slot>
      <BModal
        id="createResourceModal"
        size="lg"
        cancel-variant="outline-secondary"
        no-close-on-backdrop
        no-close-on-esc
        @hide="hideModal"
        @hidden="stepIndex = -1"
        @show="initialiseData"
        :body-class="[{ 'p-0' : stepIndex > -1 }]"
        :title="modalTitle">
        <BRow>
          <BCol v-if="stepIndex === -1">
            <!-- Creating resource currently only supports Array, String, Number, Boolean, and singleton relationships -->
            <BForm
              v-if="clonedCreateProperties.length"
              @submit.prevent
              class="mb-3"
              name="edit-personal-form">
              <template
                v-for="(field, index) in clonedCreateProperties"
                :key="`createResource${index}`">
                <BFormGroup v-if="((field.type === 'string' && !field.isConditional) || field.type === 'number' || field.type === 'boolean') && field.encryption === undefined">
                  <FrField
                    v-model="field.value"
                    :autofocus="index === 0"
                    :label="field.title"
                    :name="field.key"
                    :options="field.options"
                    :type="getFieldType(field)"
                    :validation="field.validation" />
                </BFormGroup>
                <BFormGroup v-else-if="field.type === 'password' && field.encryption === undefined">
                  <FrPolicyPasswordInput
                    v-model="passwordValue"
                    @is-valid="passwordValid=$event"
                    :failures-on-submit="passwordFailures"
                    :resource-name="resourceName"
                    :resource-type="resourceType"
                    :validation="field.validation" />
                </BFormGroup>
                <!-- for relationship values -->
                <BFormGroup v-else-if="field.type === 'relationship' || (field.type === 'array' && field.items.type === 'relationship')">
                  <FrRelationshipEdit
                    :close-on-select="isCloseOnSelect(field)"
                    :parent-resource="`${resourceType}/${resourceName}`"
                    :relationship-property="field"
                    :index="index"
                    :new-resource="true"
                    @setValue="setRelationshipValue($event, field.key)" />
                </BFormGroup>
                <BFormGroup v-else-if="field.type === 'array' && field.key !== 'privileges' && !field.isTemporalConstraint">
                  <FrListField
                    v-model="field.value"
                    :description="field.description"
                    :index="index"
                    :items="field.items"
                    :label="field.title"
                    :name="field.key"
                    :required="field.required"
                    @input="updateField(index, $event)" />
                </BFormGroup>
              </template>
            </BForm>
            <template v-else>
              <h1 class="text-center h3">
                {{ $t('pages.access.noRequiredFields') }}
              </h1>
            </template>
          </BCol>

          <template v-else>
            <BCol
              v-for="(step, index) in steps"
              :key="index"
              v-show="stepIndex === index">
              <FrCustomStep
                :property="step"
                :resource-name="resourceName"
                @input="updateStepPropertyValue" />
            </BCol>
          </template>
        </BRow>

        <template #modal-footer>
          <div class="flex-grow-1">
            <BButton
              v-if="stepIndex >= 0"
              @click="loadPreviousStep"
              variant="link">
              {{ $t('common.previous') }}
            </BButton>
          </div>
          <BButton
            variant="link"
            @click="hideModal">
            {{ $t('common.cancel') }}
          </BButton>
          <BButton
            v-if="!isLastStep"
            @click="loadNextStep"
            variant="primary"
            :disabled="!valid">
            {{ $t('common.next') }}
          </BButton>
          <FrButtonWithSpinner
            v-if="isLastStep || !steps.length"
            :button-text="$t('common.save')"
            :disabled="formFields.length === 0 || !valid || (passwordValue !== '' && !passwordValid) || isSaving"
            :show-spinner="isSaving"
            :spinner-text="$t('common.saving')"
            @click="saveForm" />
        </template>
      </BModal>
    </slot>
  </VeeForm>
</template>

<script>
import {
  camelCase,
  capitalize,
  clone,
  cloneDeep,
  each,
  find,
  has,
  isString,
  noop,
  startCase,
} from 'lodash';
import {
  BButton,
  BFormGroup,
  BForm,
  BRow,
  BCol,
  BModal,
} from 'bootstrap-vue';
import { Form as VeeForm } from 'vee-validate';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import RelationshipEdit from '@forgerock/platform-shared/src/components/resource/RelationshipEdit';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import PasswordPolicyMixin from '@forgerock/platform-shared/src/mixins/PasswordPolicyMixin';
import FrPolicyPasswordInput from '@forgerock/platform-shared/src/components/PolicyPasswordInput';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import FrListField from '@forgerock/platform-shared/src/components/ListField';
import ListsMixin from '@forgerock/platform-shared/src/mixins/ListsMixin';
import { setFieldError } from '@forgerock/platform-shared/src/utils/veeValidateUtils';
import CustomStep from './CustomStep/index';

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
    FrButtonWithSpinner,
    FrCustomStep: CustomStep,
    FrField,
    FrRelationshipEdit: RelationshipEdit,
    BButton,
    BFormGroup,
    BForm,
    BRow,
    BCol,
    BModal,
    VeeForm,
    FrListField,
    FrPolicyPasswordInput,
  },
  mixins: [
    ResourceMixin,
    RestMixin,
    NotificationMixin,
    PasswordPolicyMixin,
    ListsMixin,
    TranslationMixin,
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
    resourceTitle: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      formFields: {},
      clonedCreateProperties: [],
      stepIndex: -1,
      passwordValue: '',
      passwordValid: false,
      passwordFailures: [],
      isSaving: false,
    };
  },
  watch: {
    passwordValue(newVal) {
      const passwordField = find(this.clonedCreateProperties, { key: 'password' });

      if (passwordField) {
        passwordField.value = newVal;
      }
    },
  },
  computed: {
    steps() {
      const steps = [];

      this.clonedCreateProperties.forEach((property) => {
        if (property.isConditional || property.isTemporalConstraint || property.key === 'privileges') {
          steps.push(property);
        }
      });

      return steps;
    },
    isLastStep() {
      return this.stepIndex === this.steps.length - 1;
    },
    modalTitle() {
      const name = capitalize(this.resourceTitle || this.resourceName);
      if (this.steps.length && this.stepIndex > -1) {
        const step = this.steps[this.stepIndex];

        if (step.key === 'privileges') {
          return this.$t('pages.access.objectPermissions', { object: name });
        }

        if (step.isConditional) {
          return this.$t('pages.access.dynamic', { name });
        }

        if (step.isTemporalConstraint) {
          return this.$t('pages.access.timeConstraint', { object: name });
        }
      }
      return this.$t('common.newObject', { object: this.getTranslation(name) });
    },
  },
  methods: {
    isCloseOnSelect(field) {
      return !has(field, 'items');
    },
    saveForm() {
      if (this.isSaving) {
        return;
      }
      this.isSaving = true;
      const idmInstance = this.getRequestService();
      const validateSave = this.$refs.observer.validate();

      validateSave.then(({ valid }) => {
        if (valid) {
          this.clonedCreateProperties.forEach((field) => {
            // account for boolean type properties when the field's value is undefined
            if (field.type === 'boolean' && field.value === undefined) {
              field.value = false;
            }
            this.formFields[field.key] = field.value;
            // only remove fields with empty values when they are not boolean type
            if (!field.value && field.type !== 'boolean') {
              delete this.formFields[field.key];
            }
          });

          const saveData = this.cleanData(clone(this.formFields));

          idmInstance.post(`${this.resourceType}/${this.resourceName}?_action=create`, saveData).then((newObjectResponse) => {
            this.$emit('show-details', newObjectResponse.data);
            this.hideModal();

            this.displayNotification('success', this.$t('pages.access.successCreate', { resource: this.resourceTitle || capitalize(this.resourceName) }));
          },
          (error) => {
            /**
             * Special case to handle AIC proxy timeouts that respond to the request before IDM finishes processing data.
             * For this 502 Bad Gateway or 504 Gateway Timeout we will issue the user a warning that their request is still be processed by IDM
             * and will eventually complete - being visible in the UI.
             */
            if (error.response.status === 502 || error.response.status === 504) {
              this.displayNotification('warning', this.$t('pages.access.gatewayWarning'), 10000);
              this.hideModal();
            } else {
              this.setErrors(error.response);
            }
          }).finally(() => {
            this.isSaving = false;
          });
        } else {
          this.isSaving = false;
          this.showErrorMessage('error', this.$t('pages.access.invalidCreate'));
        }
      })
        .catch(() => { this.isSaving = false; });
    },
    setErrors(error) {
      const generatedErrors = this.findPolicyError(error, this.clonedCreateProperties);
      const passwordErrors = [];

      if (generatedErrors.length > 0) {
        each(generatedErrors, (generatedError) => {
          if (generatedError.exists) {
            setFieldError(generatedError.field, generatedError.msg, this.$refs.observer);
            if (generatedError.field === 'password') {
              passwordErrors.push(generatedError.msg);
            }
          }
        });
      }
      this.passwordFailures = passwordErrors;
      this.showErrorMessage(error, this.$t('pages.access.invalidCreate'));
    },
    hideModal() {
      this.$root.$emit('bv::hide::modal', 'createResourceModal');
    },
    // Remove optional fields to not save with empty string
    cleanData(data) {
      each(data, (value, key) => {
        if (isString(value) && value.length === 0) {
          delete data[key];
        }
      });
      return data;
    },
    setRelationshipValue(data, fieldKey) {
      const property = this.clonedCreateProperties.find((prop) => prop.key === fieldKey);
      property.value = data;
    },
    loadNextStep() {
      if (this.stepIndex === -1) {
        const validateForm = this.$refs.observer.validate();

        validateForm.then(({ valid }) => {
          if (valid) {
            this.stepIndex += 1;
          }
        });
      } else {
        this.stepIndex += 1;
      }
    },
    loadPreviousStep() {
      this.stepIndex -= 1;
    },
    updateStepPropertyValue(property, val) {
      const createProperty = find(this.clonedCreateProperties, { key: property });

      createProperty.value = val;
    },
    setFormFields() {
      const tempFormFields = {};

      each(this.clonedCreateProperties, (prop) => {
        if (Object.prototype.hasOwnProperty.call(prop, 'default') && prop.default !== null) {
          prop.value = prop.default;
        }
        if (prop.type === 'string' || prop.type === 'number') {
          tempFormFields[prop.key] = '';
        } else if (prop.type === 'array' && prop.items.type === 'relationship') {
          tempFormFields[prop.key] = [];
        } else if (prop.type === 'array') {
          const hasTitle = prop.title && prop.title.length > 0;
          const hasDescription = prop.description && prop.description.length > 0;
          tempFormFields[prop.key] = [];

          if (!hasTitle && hasDescription) {
            prop.title = prop.description;
          } else if (!hasTitle && !hasDescription) {
            // best effort to create a title when none is provided
            prop.title = startCase(camelCase(prop.key));
          }
        } else if (prop.type === 'relationship') {
          tempFormFields[prop.key] = {};
        } else {
          tempFormFields[prop.key] = false;
        }
        if (prop.policies && prop.policies[0] && prop.policies[0].policyId.includes('email')) {
          prop.validation = 'required|email';
        } else if (prop.isOptional) {
          noop();
        } else if (prop.type === 'array' && prop.items.type === 'relationship') {
          noop();
        } else {
          prop.validation = 'required';
        }

        // Special logic for password
        if (prop.key === 'password') {
          prop.type = 'password';
        }
      });

      this.formFields = tempFormFields;
    },
    initialiseData() {
      this.isSaving = false;
      this.passwordValue = '';
      this.passwordValid = false;
      this.passwordFailures = [];
      this.clonedCreateProperties = cloneDeep(this.createProperties);
      this.setFormFields();
    },
    /**
     * change field value for valid fields
     */
    updateField(index, newValue) {
      this.clonedCreateProperties[index].value = newValue;
      this.$forceUpdate();
    },
    /**
     * Determines the exact field type component to use.
     * IAM-4692: Brings a change to use checkbox component when the field type is boolean. Earlier it used to use the switch component.
     * @param {Object} field - The field object for which the type is to be determined.
     * @returns {String} - The type of the field.
     */
    getFieldType(field) {
      if (field.format) {
        return field.format;
      }
      if (field.type === 'boolean') {
        return 'checkbox';
      }
      return field.type;
    },
  },
};
</script>
