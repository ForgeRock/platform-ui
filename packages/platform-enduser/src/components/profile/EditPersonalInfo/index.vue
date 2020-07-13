<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
  <BModal
    id="userDetailsModal"
    ref="fsModal"
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
          aria-label="Close"
          class="close"
          @click="hideModal">
          <i class="material-icons-outlined font-weight-bolder md-24">
            close
          </i>
        </button>
      </div>
    </template>
    <!-- Editing profile currently only supports String, Number and Boolean-->
    <BContainer>
      <BRow>
        <ValidationObserver
          v-if="formFields.length > 0"
          ref="observer"
          class="w-100">
          <template v-for="(field, index) in formFields">
            <BFormGroup
              :key="index"
              v-if="field.type === 'string' || field.type === 'number' || field.type === 'boolean'">
              <FrField :field="field" />
            </BFormGroup>
          </template>
        </ValidationObserver>
        <h3
          v-else
          class="text-center">
          {{ $t('pages.profile.editProfile.noFields') }}
        </h3>
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
        :disabled="internalUser"
        @click="saveForm">
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
  map,
} from 'lodash';
import { mapState } from 'vuex';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrField from '@forgerock/platform-shared/src/components/Field';

/**
 * @description Displays a users profile, auto generates fields based off of resource schema. Currently only displays strings, numbers and booleans. In the case of a policy
 * save error it will highlight the appropriate field and display a policy error. For custom profile changes (e.g. adding a dropdown) this would be the primary file to add these
 * adjustments.
 */
export default {
  name: 'EditPersonalInfo',
  mixins: [
    ResourceMixin,
    RestMixin,
    NotificationMixin,
  ],
  components: {
    FrField,
  },
  computed: {
    ...mapState({
      userId: (state) => state.UserStore.userId,
      managedResource: (state) => state.UserStore.managedResource,
      internalUser: (state) => state.UserStore.internalUser,
    }),
  },
  props: {
    schema: {
      type: Object,
      required: true,
    },
    profile: {
      type: Object,
      required: true,
    },
    autoOpen: {
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
  mounted() {
    if (this.autoOpen) {
      this.$root.$emit('bv::show::modal', 'userDetailsModal');
    }
  },
  methods: {
    generateFormFields() {
      const { order, properties, required } = this.schema;
      const filteredOrder = filter(order, (propName) => properties[propName].viewable
                            && properties[propName].userEditable
                            && properties[propName].type !== 'array'
                            && properties[propName].type !== 'object');
      const formFields = map(filteredOrder, (name) => ({
        name,
        key: name,
        title: `${properties[name].title} ${required.includes(name) ? '' : this.$t('pages.profile.editProfile.optional')}`,
        value: this.profile[name] || null,
        type: properties[name].type,
        validation: required.includes(name) ? 'required' : '',
      }));

      return formFields;
    },
    hideModal() {
      this.$refs.fsModal.hide();
    },
    setModal() {
      const formFields = this.generateFormFields();

      this.formFields = formFields;
      this.originalFormFields = cloneDeep(formFields);
    },
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
              this.displayNotification('IDMMessages', 'error', this.$t('pages.profile.editProfile.failedProfileSave'));
            }
          }
        });
      }
    },
  },
};
</script>
