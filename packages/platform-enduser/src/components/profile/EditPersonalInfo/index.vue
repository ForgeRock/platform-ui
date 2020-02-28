<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BModal
    id="userDetailsModal"
    modal-class="fr-full-screen"
    ref="fsModal"
    cancel-variant="outline-secondary"
    @show="setModal"
    @keydown.enter.native.prevent="saveForm">
    <template v-slot:modal-header>
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
        <BCol
          sm="8"
          offset-sm="2">
          <BForm
            style="flex-direction: column;"
            v-if="formFields.length > 0"
            class="mb-3 fr-edit-personal-form"
            name="edit-personal-form">
            <ValidationObserver
              ref="observer"
              v-slot:default>
              <template v-for="(field, index) in formFields">
                <BFormGroup
                  style="min-width: 200px;"
                  :key="index"
                  v-if="field.type === 'string' || field.type === 'number'">
                  <label :for="field.title">
                    {{ field.title }}
                  </label>
                  <small
                    v-if="!field.required"
                    class="text-muted ml-1">
                    {{ $t('pages.profile.editProfile.optional') }}
                  </small>

                  <ValidationProvider
                    :name="field.title"
                    :rules="field.required ? 'required' : ''"
                    v-slot="{ errors }">
                    <input
                      v-if="field.type === 'string'"
                      :name="field.name"
                      :type="field.type"
                      :class="[{'is-invalid': errors.length > 0}, 'form-control']"
                      v-model.trim="field.value">
                    <input
                      v-else
                      :name="field.name"
                      :type="field.type"
                      :class="[{'is-invalid': errors.length > 0}, 'form-control']"
                      v-model.number="field.value">
                    <FrValidationError
                      :validator-errors="errors"
                      :field-name="field.name" />
                  </ValidationProvider>
                </BFormGroup>

                <!-- for boolean values -->
                <BFormGroup
                  :key="index"
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
                        :value="formFields[index].value"
                        @change="formFields[index].value = !formFields[index].value" />
                    </div>
                  </div>
                </BFormGroup>
              </template>
            </ValidationObserver>
          </BForm>
          <template v-else>
            <h3 class="text-center">
              {{ $t('pages.profile.editProfile.noFields') }}
            </h3>
          </template>
        </BCol>
      </BRow>
    </BContainer>
    <template v-slot:modal-footer>
      <div class="w-100">
        <div class="float-right">
          <BBtn
            variant="outline-secondary mr-2"
            @click="hideModal">
            {{ $t('common.cancel') }}
          </BBtn>
          <BBtn
            type="button"
            variant="primary"
            :disabled="internalUser"
            @click="saveForm">
            {{ $t('common.saveChanges') }}
          </BBtn>
        </div>
      </div>
    </template>
  </BModal>
</template>

<script>
import {
  cloneDeep,
  each,
  filter,
  includes,
  map,
} from 'lodash';
import { mapState } from 'vuex';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import ValidationErrorList from '@forgerock/platform-shared/src/components/ValidationErrorList/';

/**
 * @description Displays a users profile, auto generates fields based off of resource schema. Currently only displays strings, numbers and booleans. In the case of a policy
 * save error it will highlight the appropriate field and display a policy error. For custom profile changes (e.g. adding a dropdown) this would be the primary file to add these
 * adjustments.
 *
 */
export default {
  name: 'EditPersonalInfo',
  mixins: [
    ResourceMixin,
    RestMixin,
    NotificationMixin,
  ],
  components: {
    FrValidationError: ValidationErrorList,
    ValidationObserver,
    ValidationProvider,
  },
  computed: {
    ...mapState({
      userId: (state) => state.UserStore.userId,
      managedResource: (state) => state.UserStore.managedResource,
      internalUser: (state) => state.UserStore.internalUser,
    }),
  },
  props: {
    schema: { type: Object, required: true },
    profile: { type: Object, required: true },
    autoOpen: { type: Boolean, required: false, default: false },
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
        title: properties[name].title,
        value: this.profile[name] || null,
        type: properties[name].type,
        required: includes(required, name),
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
