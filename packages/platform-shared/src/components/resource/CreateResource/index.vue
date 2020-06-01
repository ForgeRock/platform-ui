<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <FrCreateAssignmentModal
    v-if="resourceType === 'managed' && resourceName === 'assignment'"
    @refreshGrid="$emit('refreshGrid')"
    :create-properties="createProperties" />
  <BModal
    v-else
    id="createResourceModal"
    @shown="focusField"
    cancel-variant="outline-secondary">
    <template #modal-header>
      <div class="d-flex w-100 h-100">
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
    </template>
    <BRow>
      <BCol>
        <!-- Creating resource currently only supports String, Number, Boolean, and singleton relationships -->
        <BForm
          v-if="createProperties.length > 0"
          class="mb-3"
          @submit="saveForm"
          name="edit-personal-form">
          <ValidationObserver ref="observer">
            <template v-for="(field, index) in createProperties">
              <BFormGroup
                :key="'createResource' + index"
                v-if="(field.type === 'string' || field.type === 'number' || field.type === 'boolean' || field.type === 'password') && field.encryption === undefined">
                <FrField
                  v-if="field.type !== 'password'"
                  :field="field"
                  :prepend-title="true" />

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
          </ValidationObserver>
        </BForm>
        <template v-else>
          <h3 class="text-center">
            {{ $t('pages.access.noFields') }}
          </h3>
        </template>
      </BCol>
    </BRow>

    <template #modal-footer="{ cancel }">
      <BButton
        variant="link"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <BButton
        variant="primary"
        @click="saveForm"
        :disabled="formFields.length === 0">
        {{ $t('common.save') }}
      </BButton>
    </template>
  </BModal>
</template>

<script>
import {
  capitalize,
  clone,
  each,
  isArray,
  isString,
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
    };
  },
  methods: {
    saveForm() {
      const idmInstance = this.getRequestService();
      const validateSave = this.$refs.observer.validate();

      validateSave.then((isValid) => {
        if (isValid) {
          this.createProperties.forEach((field) => {
            this.formFields[field.key] = field.value;
          });
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
  },
};
</script>
