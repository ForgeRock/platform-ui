<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <ValidationObserver
    v-slot="{ invalid }"
    ref="observer">
    <BModal
      id="userDetailsModal"
      ref="fsModal"
      size="lg"
      cancel-variant="outline-secondary"
      @show="setModal"
      @keydown.enter.native.prevent="saveForm">
      <template #modal-header>
        <div class="d-flex w-100 h-100">
          <h5 class="modal-title align-self-center text-center">
            {{ title }}
          </h5>
          <button
            type="button"
            :aria-label="$t('common.close')"
            class="close"
            @click="hideModal">
            <FrIcon
              class="font-weight-bolder md-24"
              name="close" />
          </button>
        </div>
      </template>
      <!-- Editing profile currently only supports String, Number and Boolean-->
      <BContainer>
        <BRow>
          <template v-if="formFields.length">
            <BFormGroup
              class="w-100"
              :label="title"
              label-sr-only>
              <template v-for="(field, index) in formFields">
                <div
                  :key="index">
                  <FrField
                    v-model="field.value"
                    class="personal-info-field"
                    :label="field.title"
                    :name="field.name"
                    :type="field.format ? field.format : field.type"
                    :validation="field.validation"
                    :testid="`edit-personal-info-${index}`"
                    :disabled="!field.userEditable"
                    v-if="field.type === 'string' || field.type === 'number' || field.type === 'boolean'" />
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
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <BButton
          variant="primary"
          :disabled="internalUser || invalid"
          @click="saveForm">
          {{ $t('common.save') }}
        </BButton>
      </template>
    </BModal>
  </ValidationObserver>
</template>

<script>
import {
  cloneDeep,
  each,
  filter,
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
import { ValidationObserver } from 'vee-validate';
import { mapState } from 'vuex';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrListField from '@forgerock/platform-shared/src/components/ListField';
import ListsMixin from '@forgerock/platform-shared/src/mixins/ListsMixin';

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
    FrIcon,
    FrListField,
    ValidationObserver,
  },
  computed: {
    ...mapState({
      userId: (state) => state.UserStore.userId,
      managedResource: (state) => state.UserStore.managedResource,
      internalUser: (state) => state.UserStore.internalUser,
    }),
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
  },
  data() {
    return {
      formFields: [],
      originalFormFields: [],
      title: this.$t('pages.profile.editProfile.userDetailsTitle'),
    };
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
      const formFields = map(filteredOrder, (name) => ({
        name,
        title: `${properties[name].title} ${required.includes(name) ? '' : this.$t('pages.profile.editProfile.optional')}`,
        value: this.profile[name] || null,
        type: properties[name].type,
        description: properties[name].description,
        items: properties[name].items,
        format: properties[name].format,
        validation: required.includes(name) ? 'required' : '',
        userEditable: properties[name].userEditable,
      }));

      return formFields;
    },
    /**
     * Hide the modal
     */
    hideModal() {
      this.$refs.fsModal.hide();
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
      const isValid = await this.$refs.observer.validate();
      if (isValid) {
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
            this.$refs.observer.reset();
            this.hideModal();
          } else {
            const generatedErrors = this.findPolicyError({
              data: {
                detail: {
                  failedPolicyRequirements: policyResult.data.failedPolicyRequirements,
                },
              },
            }, this.formFields);

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
              this.displayNotification('IDMMessages', 'error', this.$t('pages.profile.failedProfileSave'));
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
