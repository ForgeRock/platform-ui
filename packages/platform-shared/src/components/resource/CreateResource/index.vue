<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <ValidationObserver
    ref="observer"
    v-slot="{ invalid }">
    <FrCreateAssignmentModal
      v-if="resourceType === 'managed' && resourceName === 'assignment'"
      @refreshGrid="$emit('refreshGrid')"
      :create-properties="createProperties" />
    <BModal
      v-else
      id="createResourceModal"
      @shown="focusField"
      size="lg"
      cancel-variant="outline-secondary"
      @hide="hideModal"
      @hidden="stepIndex = -1"
      :body-class="[{ 'p-0' : stepIndex > -1 }]"
      :title="modalTitle">
      <BRow>
        <BCol v-if="stepIndex === -1">
          <!-- Creating resource currently only supports String, Number, Boolean, and singleton relationships -->
          <BForm
            v-if="createProperties.length"
            class="mb-3"
            @submit="saveForm"
            name="edit-personal-form">
            <template v-for="(field, index) in createProperties">
              <BFormGroup
                :key="'createResource' + index"
                v-if="((field.type === 'string' && !field.isConditional) || field.type === 'number' || field.type === 'boolean' || field.type === 'password') && field.encryption === undefined">
                <FrField
                  v-if="field.type !== 'password'"
                  :field="field"
                  :display-description="false" />

                <!-- Special logic for password -->
                <FrPolicyPasswordInput
                  v-else
                  :policy-api="`${resourceType}/${resourceName}/policyTest`"
                  v-model="field.value">
                  <template #input>
                    <BFormGroup class="mb-3">
                      <FrField
                        :field="field"
                        :prepend-title="true" />
                    </BFormGroup>
                  </template>
                </FrPolicyPasswordInput>
              </BFormGroup>

              <!-- for singletonRelationhip values -->
              <FrRelationshipEdit
                v-else-if="field.type === 'relationship'"
                :parent-resource="`${resourceType}/${resourceName}`"
                :relationship-property="field"
                :index="index"
                :key="'createResource' +index"
                @setValue="setSingletonRelationshipValue"
                :new-resource="true" />
            </template>
          </BForm>
          <template v-else>
            <h3 class="text-center">
              {{ $t('pages.access.noFields') }}
            </h3>
          </template>
        </BCol>
        <BCol
          v-else
          v-for="(step, index) in steps"
          :key="index"
          v-show="stepIndex === index">
          <FrCustomStep
            :property="step"
            @input="updateStepPropertyValue" />
        </BCol>
      </BRow>

      <template v-slot:modal-footer>
        <div
          v-if="steps.length"
          class="w-100">
          <div class="float-left w-50 text-left">
            <BButton
              v-if="stepIndex >= 0"
              @click="loadPreviousStep"
              variant="link">
              {{ $t('common.previous') }}
            </BButton>
          </div>
          <div class="float-right w-50 text-right">
            <BButton
              variant="link"
              @click="hideModal">
              {{ $t('common.cancel') }}
            </BButton>
            <BButton
              v-if="!isLastStep"
              @click="loadNextStep"
              variant="primary"
              :disabled="invalid">
              {{ $t('common.next') }}
            </BButton>
            <BButton
              v-if="isLastStep"
              @click="saveForm"
              :disabled="formFields.length === 0 || invalid"
              variant="primary">
              {{ $t('common.save') }}
            </BButton>
          </div>
        </div>
        <div v-else>
          <BButton
            variant="link"
            @click="hideModal">
            {{ $t('common.cancel') }}
          </BButton>
          <BButton
            variant="primary"
            @click="saveForm"
            :disabled="formFields.length === 0 || invalid">
            {{ $t('common.save') }}
          </BButton>
        </div>
      </template>
    </BModal>
  </ValidationObserver>
</template>

<script>
import {
  capitalize,
  clone,
  each,
  find,
  isArray,
  isString,
  noop,
} from 'lodash';
import {
  BButton,
  BFormGroup,
  BForm,
  BRow,
  BCol,
  BModal,
} from 'bootstrap-vue';
import { ValidationObserver } from 'vee-validate';
import PolicyPasswordInput from '@forgerock/platform-shared/src/components/PolicyPasswordInput/';
import FrField from '@forgerock/platform-shared/src/components/Field';
import RelationshipEdit from '@forgerock/platform-shared/src/components/resource/RelationshipEdit';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import CreateAssignmentModal from '@forgerock/platform-admin/src/views/ManagedIdentities/Assignment/Create';
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
    FrCustomStep: CustomStep,
    FrField,
    FrPolicyPasswordInput: PolicyPasswordInput,
    FrRelationshipEdit: RelationshipEdit,
    FrCreateAssignmentModal: CreateAssignmentModal,
    BButton,
    BFormGroup,
    BForm,
    BRow,
    BCol,
    BModal,
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
    resourceTitle: {
      type: String,
      default: '',
    },
  },
  data() {
    const tempFormFields = {};

    each(this.createProperties, (prop) => {
      if (prop.type === 'string' || prop.type === 'number') {
        tempFormFields[prop.key] = '';
      } else if (prop.type === 'relationship') {
        tempFormFields[prop.key] = {};
      } else {
        tempFormFields[prop.key] = false;
      }
      if (prop.policies && prop.policies[0].policyId.includes('email')) {
        prop.validation = 'required|email';
      } else if (prop.isOptional) {
        noop();
      } else {
        prop.validation = 'required';
      }

      // Special logic for password
      if (prop.key === 'password') {
        prop.validation = 'required|policy';
        prop.type = 'password';
      }
    });

    return {
      formFields: tempFormFields,
      stepIndex: -1,
    };
  },
  computed: {
    steps() {
      const steps = [];

      this.createProperties.forEach((property) => {
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
      if (this.steps.length && this.stepIndex > -1) {
        const step = this.steps[this.stepIndex];

        if (step.key === 'privileges') {
          return `${capitalize(this.resourceName)} ${this.$t('pages.access.permissions')} `;
        }

        if (step.isConditional) {
          return `${this.$t('pages.access.dynamic')} ${capitalize(this.resourceName)} ${this.$t('pages.assignment.title')}`;
        }

        if (step.isTemporalConstraint) {
          return `${capitalize(this.resourceName)} ${this.$t('pages.access.timeConstraint')}`;
        }
      }
      return `${this.$t('common.new')} ${this.resourceTitle || capitalize(this.resourceName)}`;
    },
  },
  methods: {
    saveForm() {
      const idmInstance = this.getRequestService();
      const validateSave = this.$refs.observer.validate();

      validateSave.then((isValid) => {
        if (isValid) {
          this.createProperties.forEach((field) => {
            this.formFields[field.key] = field.value;

            if (!field.value) {
              delete this.formFields[field.key];
            }
          });
          const saveData = this.cleanData(clone(this.formFields));

          idmInstance.post(`${this.resourceType}/${this.resourceName}?_action=create`, saveData).then(() => {
            this.$emit('refreshGrid');
            this.$refs.observer.reset();
            this.hideModal();

            this.displayNotification('IDMMessages', 'success', this.$t('pages.access.successCreate', { resource: this.resourceTitle || capitalize(this.resourceName) }));
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

      this.createProperties.forEach((field) => {
        if (field.type === 'string' || field.type === 'number' || field.type === 'password') {
          field.value = '';
        } else {
          field.value = false;
        }
        this.formFields[field.key] = field.value;
      });
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
    focusField() {
      if (isArray(this.$refs.focusInput)) {
        this.$refs.focusInput[0].focus();
      }
    },
    setSingletonRelationshipValue(data) {
      this.formFields[data.property] = data.value;
    },
    loadNextStep() {
      if (this.stepIndex === -1) {
        const validateForm = this.$refs.observer.validate();

        validateForm.then((isValid) => {
          if (isValid) {
            this.stepIndex = this.stepIndex + 1;
          }
        });
      } else {
        this.stepIndex = this.stepIndex + 1;
      }
    },
    loadPreviousStep() {
      this.stepIndex = this.stepIndex - 1;
    },
    updateStepPropertyValue(property, val) {
      const createProperty = find(this.createProperties, { key: property });

      createProperty.value = val;
    },
  },
};
</script>
