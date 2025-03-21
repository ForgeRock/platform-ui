<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="userDetailsModal"
    cancel-variant="outline-secondary"
    size="lg"
    title-class="h5"
    title-tag="h2"
    :title="title"
    @show="setModal"
    :static="isTesting">
    <!-- Editing profile currently only supports String, Number and Boolean-->
    <BContainer>
      <BRow>
        <template v-if="formFields.length">
          <BFormGroup
            class="w-100"
            :label="title"
            label-sr-only>
            <template
              v-for="(field, index) in formFields"
              :key="index">
              <div @keydown.enter="saveForm()">
                <FrField
                  v-if="field.type === 'string' || field.type === 'number' || field.type === 'boolean'"
                  v-model="field.value"
                  class="personal-info-field"
                  :label="field.title"
                  :name="field.name"
                  :options="field.enum || []"
                  :type="getFieldType(field)"
                  :validation="field.validation"
                  :testid="`edit-personal-info-${index}`"
                  :disabled="!field.userEditable" />
                <FrListField
                  v-else-if="field.type === 'array' && field.name !== 'privileges'"
                  v-model="field.value"
                  class="w-100 personal-info-field"
                  :description="field.description"
                  :items="field.items"
                  :label="field.title"
                  :name="field.name"
                  :required="field.required"
                  :index="index"
                  :disabled="!field.userEditable"
                  v-on="$listeners"
                  @input="updateField(index, $event)" />
              </div>
            </template>
          </BFormGroup>
        </template>
        <h1
          v-else
          class="text-center h3"
          data-testid="edit-personal-info-no-fields">
          {{ $t('pages.profile.editProfile.noFields') }}
        </h1>
      </BRow>
    </BContainer>
    <template #modal-footer="{ cancel }">
      <BButton
        variant="link mr-2"
        @click="cancel()"
        data-testid="btn-edit-personal-info-cancel">
        {{ $t('common.cancel') }}
      </BButton>
      <BButton
        variant="primary"
        :disabled="isInternalUser || !meta.valid"
        @click="saveForm()"
        data-testid="btn-edit-personal-info-save">
        {{ $t('common.save') }}
      </BButton>
    </template>
  </BModal>
</template>

<script>
import {
  cloneDeep,
  each,
  filter,
  has,
  map,
  reject,
} from 'lodash';
import {
  BButton,
  BContainer,
  BFormGroup,
  BModal,
  BRow,
} from 'bootstrap-vue';
import { useForm } from 'vee-validate';
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { useEnduserStore } from '@forgerock/platform-shared/src/stores/enduser';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrListField from '@forgerock/platform-shared/src/components/ListField';
import ListsMixin from '@forgerock/platform-shared/src/mixins/ListsMixin';
import { setFieldError } from '@forgerock/platform-shared/src/utils/veeValidateUtils';

/**
 * @description Displays a users profile, auto generates fields based off of resource schema. Currently only displays strings, numbers and booleans. In the case of a policy
 * save error it will highlight the appropriate field and display a policy error. For custom profile changes (e.g. adding a dropdown) this would be the primary file to add these
 * adjustments.
 */
export default {
  name: 'EditPersonalInfo',
  mixins: [
    ListsMixin,
    NotificationMixin,
    ResourceMixin,
    RestMixin,
  ],
  components: {
    BButton,
    BContainer,
    BFormGroup,
    BModal,
    BRow,
    FrField,
    FrListField,
  },
  computed: {
    ...mapState(useUserStore, ['userId', 'managedResource']),
    ...mapState(useEnduserStore, ['isInternalUser']),
  },
  props: {
    /**
     * Schema data for profile
     */
    schema: {
      type: Object,
      required: true,
    },
    /**
     * Profile data
     */
    profile: {
      type: Object,
      required: true,
    },
    /**
     * Should only be used to mount this modal in isolation for testing
     */
    isTesting: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      formFields: [],
      originalFormFields: [],
      title: this.$t('pages.profile.editProfile.userDetailsTitle'),
    };
  },
  setup() {
    const veeValidateInstance = useForm();
    const { meta } = veeValidateInstance;
    return { meta, veeValidateInstance };
  },
  methods: {
    /**
     * Get form fields from schema and profile data
     *
     * @returns {Object} profile fields
     */
    generateFormFields() {
      const { order, properties, required } = this.schema;
      const filteredOrder = filter(order, (propName) => properties[propName].viewable
                            && properties[propName].scope !== 'private'
                            && properties[propName].type !== 'object');
      const formFields = map(filteredOrder, (name) => {
        const property = properties[name];
        const formField = {
          name,
          title: `${property.title} ${required.includes(name) ? '' : this.$t('common.optional')}`.trim(),
          value: this.profile[name] || null,
          type: property.type,
          description: property.description,
          ...(property.enum && { enum: property.enum }),
          items: property.items,
          format: property.format,
          validation: required.includes(name) ? 'required' : '',
          userEditable: property.userEditable,
        };
        return formField;
      });

      return formFields;
    },
    /**
     * Hide the modal
     */
    hideModal() {
      this.$bvModal.hide('userDetailsModal');
    },
    /**
     * Set the form fields for the modal. Maintain the original values for patch
     */
    setModal() {
      const formFields = this.generateFormFields();

      this.formFields = formFields;
      this.originalFormFields = cloneDeep(formFields);
    },
    /**
     * Save the updated profile information via patch.
     * Values are validated by backend before saving.
     */
    async saveForm() {
      if (this.meta.valid) {
        const idmInstance = this.getRequestService();
        const policyFields = {};

        each(this.formFields, (field) => {
          if (field.value !== null) {
            policyFields[field.name] = field.value;
          }
        });

        idmInstance.post(`policy/${this.managedResource}/${this.userId}?_action=validateObject`, policyFields).then((policyResult) => {
          // reject any failedPolicyRequirements on properties that don't exist in this.formFields
          policyResult.data.failedPolicyRequirements = reject(policyResult.data.failedPolicyRequirements, (policy) => !map(this.formFields, 'name').includes(policy.property));

          if (policyResult.data.failedPolicyRequirements.length === 0) {
            this.$emit('updateProfile', this.generateUpdatePatch(this.originalFormFields, this.formFields));
            this.hideModal();
          } else {
            const generatedErrors = this.findPolicyError({
              data: {
                detail: {
                  failedPolicyRequirements: policyResult.data.failedPolicyRequirements,
                },
              },
            }, this.formFields);

            if (generatedErrors.length > 0) {
              each(generatedErrors, (generatedError) => {
                if (generatedError.exists) {
                  setFieldError(generatedError.field, generatedError.msg, this.veeValidateInstance);
                }
              });
            } else {
              this.showErrorMessage('error', this.$t('pages.profile.failedProfileSave'));
            }
          }
        });
      }
    },
    /**
     * Update form data model with a new value. Used for editing a list field
     *
     * @param {Number} index index of form field
     * @param {Array} newValue new value of form field
     */
    updateField(index, newValue) {
      this.formFields[index].value = newValue;
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
      if (has(field, 'enum')) {
        return 'select';
      }
      return field.type;
    },
  },
};
</script>
<style lang="scss">

.personal-info-field {
  margin-bottom: 1.875rem
}

.personal-info-field .form-label-group .form-label-group-input .form-control:disabled,
.personal-info-field .form-label-group .form-label-group-input .disabled {
  background-color: $gray-100 !important;
}
</style>
