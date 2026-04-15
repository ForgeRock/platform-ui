<!-- Copyright (c) 2019-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <component
    :is="isModal ? 'VeeForm' : 'span'"
    ref="observer"
    v-slot="slotProps"
    as="span">
    <slot>
      <component
        :is="isModal ? 'BModal' : 'div'"
        id="createResourceModal"
        size="lg"
        cancel-variant="outline-secondary"
        no-close-on-backdrop
        no-close-on-esc
        :title="modalTitle"
        title-tag="h2"
        :title-class="modalTitleClass"
        @hide="hideModal"
        @hidden="onModalHidden"
        @show="initialiseData"
        :body-class="[{ 'p-0' : stepIndex > -1 || enablePostSaveStep }]">
        <template v-if="enablePostSaveStep">
          <div class="py-4 px-3 text-center d-flex flex-column align-items-center justify-content-center">
            <BAspect>
              <BImg
                :src="require('@forgerock/platform-shared/src/assets/images/check.svg')"
                alt=""
                class="w-160px m-4" />
            </BAspect>
            <h3
              class="h4 mb-2 font-weight-bold">
              {{ $t('pages.access.successCreate', { resource: capitalize(objectType) }) }}
            </h3>
            <p
              v-if="newObjectName"
              class="mb-4 text-muted">
              {{ $t('configure.managedObjectSettings.successCreateDescription', { objectName: newObjectName }) }}
            </p>
            <div class="d-inline-flex align-items-center flex-wrap justify-content-center">
              <BButton
                class="mx-1"
                variant="primary"
                @click="navigateToDetailView">
                <FrIcon
                  name="arrow_forward"
                  icon-class="mr-2" />
                {{ $t('configure.managedObjectSettings.viewObject', { objectType }) }}
              </BButton>
              <BButton
                class="mx-1"
                variant="outline-primary"
                @click="createAnotherResource">
                <FrIcon
                  name="add"
                  icon-class="mr-2" />
                {{ $t('configure.managedObjectSettings.createAnother') }}
              </BButton>
            </div>
          </div>
        </template>
        <BRow v-else>
          <BCol v-if="stepIndex === -1">
            <!-- Creating resource currently only supports Array, String, Number, Boolean, and singleton relationships -->
            <BForm
              v-if="clonedCreateProperties.length"
              @submit.prevent
              class="mb-3"
              name="edit-personal-form">
              <template
                v-for="(field, index) in annotatedCreateProperties"
                :key="`createResource${index}`">
                <BFormGroup v-if="field.isAcceptedProperty">
                  <FrField
                    v-model="field.value"
                    :autocomplete="disableAutocomplete ? 'off' : undefined"
                    :autofocus="index === 0"
                    :label="field.title"
                    :name="field.key"
                    :options="field.options || field.enum"
                    :type="getFieldType(field)"
                    :validation="field.type === 'boolean' ? {} : field.validation" />
                </BFormGroup>
                <BFormGroup v-else-if="field.type === 'password' && field.encryption === undefined">
                  <FrPolicyPasswordInput
                    v-model="passwordValue"
                    :autocomplete="disableAutocomplete ? 'new-password' : undefined"
                    @is-valid="passwordValid=$event"
                    :failures-on-submit="passwordFailures"
                    :resource-name="resourceName"
                    :resource-type="resourceType"
                    :validation="field.validation"
                    :payload-data="clonedCreateProperties.reduce((obj, item) => Object.assign(obj, { [item.key]: item.value }), {})" />
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
                    number-validation="number"
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

        <template #modal-footer="{ close }">
          <template v-if="enablePostSaveStep">
            <BButton
              variant="primary"
              @click="close">
              {{ $t('common.done') }}
            </BButton>
          </template>
          <template v-else>
            <BButton
              v-if="stepIndex >= 0"
              @click="loadPreviousStep"
              variant="link">
              {{ $t('common.previous') }}
            </BButton>
            <BButton
              variant="link"
              @click="hideModal">
              {{ $t('common.cancel') }}
            </BButton>
            <BButton
              v-if="!isLastStep"
              @click="loadNextStep"
              variant="primary"
              :disabled="!slotProps.meta.valid">
              {{ $t('common.next') }}
            </BButton>
            <FrButtonWithSpinner
              v-if="isLastStep || !steps.length"
              :button-text="$t('common.save')"
              :disabled="formFields.length === 0 || !slotProps.meta.valid || (passwordValue !== '' && !passwordValid) || isSaving"
              :show-spinner="isSaving"
              :spinner-text="$t('common.saving')"
              @click="saveForm" />
          </template>
        </template>
      </component>
    </slot>
  </component>
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
  BAspect,
  BButton,
  BFormGroup,
  BForm,
  BImg,
  BRow,
  BCol,
  BModal,
} from 'bootstrap-vue';
import { Form as VeeForm } from 'vee-validate';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
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
    BAspect,
    BButton,
    BFormGroup,
    BForm,
    BImg,
    BRow,
    BCol,
    BModal,
    FrButtonWithSpinner,
    FrCustomStep: CustomStep,
    FrField,
    FrIcon,
    FrListField,
    FrPolicyPasswordInput,
    FrRelationshipEdit: RelationshipEdit,
    VeeForm,
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
    /**
     * Shows a `Post Save Modal step` to decide whether to create another resource or view the details of the created resource.
     * */
    showPostSaveStep: {
      type: Boolean,
      default: false,
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
    /**
     * When true, sets autocomplete="off" on all text/number inputs to prevent
     * browser autofill.
     */
    disableAutocomplete: {
      type: Boolean,
      default: false,
    },
    isModal: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      enablePostSaveStep: false,
      clonedCreateProperties: [],
      formFields: {},
      isSaving: false,
      newObjectName: '',
      newObjectResponseData: null,
      passwordValue: '',
      passwordValid: false,
      passwordFailures: [],
      stepIndex: -1,
    };
  },
  mounted() {
    if (!this.isModal) this.initialiseData();
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
      if (this.enablePostSaveStep) {
        return this.$t('pages.access.successCreate', { resource: capitalize(this.objectType) });
      }
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
    modalTitleClass() {
      return this.enablePostSaveStep ? 'sr-only' : 'h5';
    },
    annotatedCreateProperties() {
      return this.clonedCreateProperties.map((property) => {
        property.isAcceptedProperty = this.isAcceptedProperty(property);
        return property;
      });
    },
    objectType() {
      // Expecting resource title to be like "Alpha realm - Users".
      const resourceTitleSplit = this.resourceTitle.split(' - ');
      return resourceTitleSplit[1] || resourceTitleSplit[0] || this.resourceName;
    },
  },
  methods: {
    capitalize,
    /**
     * User decides to create another resource after successfully creating a resource,
     * so reset the form and go back to the first step of the modal.
     */
    createAnotherResource() {
      this.enablePostSaveStep = false;
      this.initialiseData();
    },
    /**
     * User decides to view the `new`ly created resource.
     */
    navigateToDetailView() {
      this.$emit('show-details', this.newObjectResponseData);
      this.hideModal();
    },
    isCloseOnSelect(field) {
      return !has(field, 'items');
    },
    isAcceptedProperty(property) {
      return (((property.type?.includes('string')) && !property.isConditional)
          || property.type?.includes('number')
          || property.type === 'boolean')
          && property.encryption === undefined;
    },
    onModalHidden() {
      this.stepIndex = -1;
      this.enablePostSaveStep = false;

      if (this.showPostSaveStep && this.newObjectResponseData) {
        this.newObjectResponseData = null;
        this.$emit('refresh-data');
      }
    },
    saveForm() {
      if (this.isSaving) {
        return;
      }
      this.isSaving = true;
      const idmInstance = this.getRequestService();
      const validateSave = this.isModal
        ? this.$refs.observer.validate()
        : Promise.resolve({ valid: true });

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
            this.newObjectResponseData = newObjectResponse.data;
            const {
              displayName, userName, name, _id,
            } = newObjectResponse.data;
            this.newObjectName = displayName || userName || name || _id || '';
            this.displayNotification('success', this.$t('pages.access.successCreate', { resource: this.resourceTitle || capitalize(this.resourceName) }));
            if (this.showPostSaveStep) {
              this.enablePostSaveStep = true;
            } else {
              this.$emit('show-details', this.newObjectResponseData);
              this.hideModal();
            }
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
        if (prop.type === 'string' || prop.type?.includes('string') || prop.type === 'number' || prop.type?.includes('number')) {
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
      this.stepIndex = -1;
      this.isSaving = false;
      this.newObjectName = '';
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
      if (Array.isArray(field.type)) {
        // When properties are set to NULL in the schema,
        // they are returned as an array of types, e.g.
        // ["string", "null"]. In this case, we want to
        // use the first type in the array to determine the
        // field type since the list is limited to two entries.
        const [fieldType] = field.type;
        return fieldType;
      }
      if (has(field, 'enum')) {
        return 'select';
      }
      return field.type;
    },
  },
};
</script>
