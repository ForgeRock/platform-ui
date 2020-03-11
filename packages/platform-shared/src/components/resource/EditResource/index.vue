<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BContainer class="pb-5">
    <BRow>
      <BCol>
        <div class="d-sm-flex my-4">
          <div class="media">
            <div
              v-if="name === 'user'"
              class="mr-4">
              <BImg
                width="100"
                :src="require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                fluid
                :alt="$t('common.avatar')" />
            </div>
            <div
              v-else
              class="rounded-circle d-flex align-items-center fr-resource-circle text-light bg-primary mr-4 mt-2">
              <i class="material-icons-outlined md-48 w-100">
                {{ setIcon }}
              </i>
            </div>
            <div class="media-body">
              <h5 class="text-muted mb-0">
                {{ resourceTitle }}
              </h5>
              <h1>{{ displayName }}</h1>
              <code>
                {{ secondaryTitle }}
              </code>
            </div>
          </div>
        </div>
      </BCol>
    </BRow>
    <!-- Uncomment this to use the reset modal
    <BButton
      v-if="canChangePassword"
      class="mb-4"
      type="button"
      variant="outline-secondary"
      v-b-modal.resetModal>
      <i class="material-icons-outlined mr-md-2 text-nowrap">cached</i>
      {{ $t('common.reset') }} {{ $t('common.placeholders.password') }}
    </BButton> -->
    <BCard class="card-tabs-vertical mb-5">
      <BTabs
        flex-column
        flex-sm-row
        vertical
        pills>
        <BTab
          :title="this.$t('pages.access.details')"
          active>
          <template v-if="displayProperties.length > 0">
            <div class="card-body m-4">
              <ValidationObserver ref="observer">
                <template v-for="(field, index) in displayProperties">
                  <template v-if="!field.isReadOnly">
                    <div
                      class="mb-4"
                      v-if="(field.type === 'string' || field.type === 'number') && field.encryption === undefined"
                      :key="'editResource' +index">
                      <ValidationProvider
                        :name="field.key"
                        :rules="field.required ? 'required' : ''"
                        v-slot="{ errors }">
                        <FrFloatingLabelInput
                          class="floating-label-input"
                          :class="{'fr-error': errors.length}"
                          :type="field.type"
                          v-model="formFields[field.key]"
                          :field-name="field.key"
                          :label="field.title" />
                        <FrValidationError
                          class="error-message mt-0"
                          :validator-errors="errors"
                          :field-name="field.key" />
                      </ValidationProvider>
                    </div>

                    <!-- for boolean values -->
                    <BFormGroup
                      :key="'createResource' +index"
                      v-if="field.type === 'boolean'">
                      <div class="form-row">
                        <div class="col-1">
                          <ToggleButton
                            class="mt-2 p-0 fr-toggle-primary"
                            :height="28"
                            :width="56"
                            :sync="true"
                            :css-colors="true"
                            :labels="{checked: $t('common.yes'), unchecked: $t('common.no')}"
                            v-model="formFields[field.key]" />
                        </div>

                        <label
                          class="col-form-label col-10"
                          :for="field.title">
                          {{ field.title }}
                        </label>
                      </div>
                    </BFormGroup>
                  </template>
                  <template v-else>
                    <FrFloatingLabelInput
                      v-if="(field.type === 'string' || field.type === 'number') && field.encryption === undefined"
                      :key="'readResource' +index"
                      class="floating-label-input"
                      :type="field.type"
                      v-model="formFields[field.key]"
                      :disabled="true"
                      :field-name="field.key"
                      :label="field.title" />

                    <!-- for boolean values -->
                    <BFormGroup
                      :key="'readResource' +index"
                      v-if="field.type === 'boolean'">
                      <div class="form-row">
                        <div class="col-1">
                          <ToggleButton
                            class="mt-2 p-0 fr-toggle-primary"
                            :height="28"
                            :width="56"
                            :disabled="true"
                            :sync="true"
                            :css-colors="true"
                            :labels="{checked: $t('common.yes'), unchecked: $t('common.no')}"
                            v-model="formFields[field.key]" />
                        </div>
                        <label
                          class="col-form-label col-10"
                          :for="field.title">
                          {{ field.title }}
                        </label>
                      </div>
                    </BFormGroup>
                  </template>
                </template>
              </ValidationObserver>
            </div>
            <div
              v-if="!disableSaveButton"
              class="card-footer">
              <div class="float-right mb-4">
                <BButton
                  type="button"
                  @click="saveResource"
                  variant="primary">
                  {{ $t('common.save') }}
                </BButton>
              </div>
            </div>
          </template>
          <span v-else>
            {{ $t('pages.access.noAvailableProperties') }}
          </span>
        </BTab>
      </BTabs>
    </BCard>

    <BCard
      class="mb-5"
      v-if="canDelete">
      <h5 class="card-title">
        {{ $t('common.delete') }} {{ resourceTitle }}
      </h5>
      <p class="text-danger">
        {{ $t('common.cannotBeUndone') }}
      </p>
      <BButton
        type="button"
        variant="danger"
        v-b-modal.deleteModal>
        {{ $t('common.delete') }} {{ resourceTitle }}
      </BButton>
    </BCard>

    <BModal
      v-if="canDelete"
      id="deleteModal"
      ref="deleteModal"
      :title="this.$t('pages.access.deleteModalTitle')">
      <div>
        {{ $t('pages.access.deleteConfirm') }} {{ this.name }}?
      </div>

      <template v-slot:modal-footer>
        <div class="w-100">
          <div class="float-right">
            <BButton
              type="button"
              variant="danger"
              @click="deleteResource">
              {{ $t('common.delete') }}
            </BButton>
          </div>
        </div>
      </template>
    </BModal>

    <BModal
      v-if="canChangePassword"
      id="resetModal"
      ref="resetModal"
      :title="this.$t('pages.access.resetPassword')">
      <FrPolicyPasswordInput
        :policy-api="`${resource}/${name}/policyTest`"
        v-model="formFields['password']">
        <template v-slot:custom-input>
          <BFormGroup class="mb-3">
            <label for="updatePassword">
              {{ $t('pages.access.password') }}
            </label>
            <div class="form-label-password form-label-group mb-0">
              <ValidationObserver
                ref="passwordObserver"
                vid="passwordObserver">
                <ValidationProvider
                  mode="aggressive"
                  name="password"
                  rules="required|policy"
                  v-slot="{ errors }">
                  <BFormInput
                    id="updatePassword"
                    autocomplete="password"
                    :type="passwordInputType"
                    :class="[{'is-invalid': errors.length > 0}]"
                    v-model="formFields['password']"
                    name="password" />
                </ValidationProvider>
              </ValidationObserver>
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
        </template>
      </FrPolicyPasswordInput>

      <template v-slot:modal-footer>
        <div class="w-100">
          <div class="float-right">
            <BButton
              type="button"
              variant="primary"
              @click="savePassword">
              {{ $t('common.save') }}
            </BButton>
          </div>
        </div>
      </template>
    </BModal>
  </BContainer>
</template>

<script>
import {
  capitalize,
  clone,
  each,
  indexOf,
  isUndefined,
  pick,
  keys,
} from 'lodash';
import {
  BButton,
  BCard,
  BCol,
  BContainer,
  BFormGroup,
  BImg,
  BFormInput,
  BModal,
  BRow,
  BTab,
  BTabs,
  VBModal,
} from 'bootstrap-vue';
import axios from 'axios';
import { ValidationProvider, ValidationObserver } from 'vee-validate';
import FloatingLabelInput from '@forgerock/platform-shared/src/components/FloatingLabelInput';
import ValidationErrorList from '@forgerock/platform-shared/src/components/ValidationErrorList/';
import PolicyPasswordInput from '@forgerock/platform-shared/src/components/PolicyPasswordInput/';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import BreadcrumbMixin from '@forgerock/platform-shared/src/mixins/BreadcrumbMixin';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import { ToggleButton } from 'vue-js-toggle-button';

/**
 * @description Full page that provides view/edit of a specific resource for delegated admin. Auto generates fields based on backend return.
 * Currently generates string, number, boolean and password (not based on type, but on field name being passsword).
 *
 * @fires GET schema/type/name/ (e.g. schema/managed/user) - Schema for a resource
 * @fires GET privilege/type/name/id (e.g. privilege/managed/user/_id) - Privileges for a specific record of a resource
 * @fires GET type/name/id (e.g. managed/user/_id) - Resource details, in this context privileges will restrict the data return
 * @fires DELETE type/name/id (e.g. managed/user/_id) - Deletes resource record
 * @fires PATCH type/name/id (e.g. managed/user/_id) - Submits a patch object of changes for the provided resource record
 */
export default {
  name: 'EditResource',
  components: {
    FrPolicyPasswordInput: PolicyPasswordInput,
    FrValidationError: ValidationErrorList,
    FrFloatingLabelInput: FloatingLabelInput,
    ValidationObserver,
    ValidationProvider,
    BButton,
    BFormInput,
    BFormGroup,
    BImg,
    BRow,
    BCol,
    BContainer,
    BTabs,
    BTab,
    BCard,
    BModal,
    ToggleButton,
  },
  mixins: [
    BreadcrumbMixin,
    ResourceMixin,
    RestMixin,
    NotificationMixin,
  ],
  directives: {
    'b-modal': VBModal,
  },
  data() {
    return {
      resourceTitle: '',
      name: this.$route.params.resourceName,
      resource: this.$route.params.resourceType,
      id: this.$route.params.resourceId,
      displayProperties: [],
      canDelete: false,
      canChangePassword: false,
      passwordInputType: 'password',
      showPassword: true,
      disableSaveButton: false,
      icon: '',
      displayNameField: '',
      displaySecondaryTitleField: '',
      formFields: {},
      oldFormFields: {},
      isOpenidmAdmin: this.$store.state.userId === 'openidm-admin',
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      const idmInstance = this.getRequestService();
      axios.all([
        idmInstance.get(`schema/${this.resource}/${this.name}`),
        idmInstance.get(`privilege/${this.resource}/${this.name}/${this.id}`),
        idmInstance.get(`${this.resource}/${this.name}/${this.id}`)]).then(axios.spread((schema, privilege, resourceDetails) => {
        this.resourceTitle = schema.data.title;
        this.setBreadcrumb(`/${this.$route.meta.listRoute}/${this.resource}/${this.name}`, `${this.resourceTitle} List`);
        this.generateDisplay(schema.data, privilege.data, resourceDetails.data);
      }))
        .catch((error) => {
          this.displayNotification('IDMMessages', 'error', error.response.data.message);
        });
    },
    generateDisplay(schema, privilege, resourceDetails) {
      if (this.isOpenidmAdmin) {
        const filteredFields = [];

        keys(resourceDetails).forEach((key) => {
          const prop = schema.properties[key];

          if (prop && prop.viewable && !['object', 'array'].includes(prop.type)) {
            filteredFields.push(key);
          }
        });

        this.oldFormFields = pick(resourceDetails, filteredFields);
      } else {
        this.oldFormFields = pick(resourceDetails, privilege.VIEW.properties);
      }

      if (privilege.DELETE.allowed || this.isOpenidmAdmin) {
        this.canDelete = true;
      }

      if (schema['mat-icon'] && schema['mat-icon'].length > 0) {
        this.icon = schema['mat-icon'];
      } else {
        this.icon = 'check_box_outline_blank';
      }

      // Add reactive form for changes
      each(this.oldFormFields, (value, key) => {
        this.$set(this.formFields, key, value);
      });

      if (privilege.VIEW.allowed || this.isOpenidmAdmin) {
        // if there are no update properties disable the save button
        if (privilege.UPDATE.properties.length === 0 && !this.isOpenidmAdmin) {
          this.disableSaveButton = true;
        }
        each(this.mergePrivilegeProperties(privilege, schema), (createPriv) => {
          const tempProp = schema.properties[createPriv.attribute];

          if (indexOf(schema.required, createPriv.attribute) !== -1) {
            tempProp.required = true;
          }

          if (createPriv.attribute === 'password' && !createPriv.readOnly) {
            this.canChangePassword = true;
          }

          tempProp.key = createPriv.attribute;

          // Try and do some primary detection for a display name
          if (((createPriv.attribute).toLowerCase() === 'username' || (createPriv.attribute).toLowerCase() === 'name') && this.displayNameField.length === 0) {
            this.displayNameField = createPriv.attribute;
          }

          // Try and do some primary detection for a secondary title
          if (((createPriv.attribute).toLowerCase() === 'title'
                                || (createPriv.attribute).toLowerCase() === 'email'
                                || (createPriv.attribute).toLowerCase() === 'type'
                                || (createPriv.attribute).toLowerCase() === 'mail') && this.displaySecondaryTitleField.length === 0) {
            this.displaySecondaryTitleField = createPriv.attribute;
          }

          // Add fields that may not be set yet from reading the resource
          if (isUndefined(this.formFields[createPriv.attribute])) {
            if (tempProp.type === 'boolean') {
              this.$set(this.formFields, createPriv.attribute, false);
              this.oldFormFields[createPriv.attribute] = false;
            } else {
              this.$set(this.formFields, createPriv.attribute, '');
              this.oldFormFields[createPriv.attribute] = '';
            }
          }

          if (createPriv.readOnly) {
            tempProp.isReadOnly = true;
          }

          if (createPriv.attribute !== 'password') {
            this.displayProperties.push(tempProp);
          }
        });
      }
    },
    deleteResource() {
      const idmInstance = this.getRequestService();

      this.$refs.deleteModal.hide();

      idmInstance.delete(`${this.resource}/${this.name}/${this.id}`).then(() => {
        this.displayNotification('IDMMessages', 'success', this.$t('pages.access.deleteResource', { resource: this.name }));

        this.$router.push({
          name: 'ListResource',
          params: {
            resourceType: this.resource,
            resourceName: this.name,
          },
        });
      })
        .catch((error) => {
          this.displayNotification('IDMMessages', 'error', error.response.data.message);
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
    async saveResource() {
      const idmInstance = this.getRequestService();

      this.$refs.observer.reset();

      const isValid = await this.$refs.observer.validate();
      if (isValid) {
        const saveData = this.generateUpdatePatch(clone(this.oldFormFields), clone(this.formFields));

        idmInstance.patch(`${this.resource}/${this.name}/${this.id}`, saveData).then(() => {
          this.displayNotification('IDMMessages', 'success', this.$t('pages.access.successEdited', { resource: capitalize(this.name) }));
        },
        (error) => {
          const generatedErrors = this.findPolicyError(error.response, this.displayProperties);

          this.$refs.observer.reset();

          if (generatedErrors.length > 0) {
            each(generatedErrors, (generatedError) => {
              if (generatedError.exists) {
                const newError = {};
                newError[generatedError.field] = [generatedError.msg];
                this.$refs.observer.setErrors(newError);
              }
            });
          }

          this.displayNotification('IDMMessages', 'error', this.$t('pages.access.invalidEdit'));
        });
      } else {
        this.displayNotification('IDMMessages', 'error', this.$t('pages.access.invalidEdit'));
      }
    },
    async savePassword() {
      const idmInstance = this.getRequestService();

      const isValid = await this.$refs.passwordObserver.validate();
      if (isValid) {
        const saveData = [{ operation: 'add', field: '/password', value: this.formFields.password }];

        this.$refs.resetModal.hide();
        this.formFields.password = '';

        idmInstance.patch(`${this.resource}/${this.name}/${this.id}`, saveData).then(() => {
          this.displayNotification('IDMMessages', 'success', this.$t('pages.access.successSavePassword'));
        },
        () => {
          this.displayNotification('IDMMessages', 'error', this.$t('pages.access.failedSavePassword'));
        });
      } else {
        this.displayNotification('IDMMessages', 'error', this.$t('pages.access.invalidEdit'));
      }
    },
    mergePrivilegeProperties(privilege, schema) {
      const properties = [];

      each(schema.order, (schemaPropName) => {
        const canView = this.isOpenidmAdmin || indexOf(privilege.VIEW.properties, schemaPropName) > -1;
        const canUpdate = this.isOpenidmAdmin || indexOf(privilege.UPDATE.properties, schemaPropName) > -1;
        const property = { attribute: schemaPropName };

        if (canUpdate && schemaPropName !== '_id') {
          properties.push(property);
        } else if (canView && schemaPropName !== '_id') {
          property.readOnly = true;
          properties.push(property);
        }
      });

      return properties;
    },
  },
  computed: {
    secondaryTitle() {
      let tempDisplayName = `${this.resource} - ${this.name}`;

      if (this.displaySecondaryTitleField.length > 0) {
        tempDisplayName = this.formFields[this.displaySecondaryTitleField];
      }

      return tempDisplayName;
    },
    displayName() {
      let tempDisplayName = this.id;

      if (this.displayNameField.length > 0) {
        tempDisplayName = this.formFields[this.displayNameField];
      } else {
        tempDisplayName = this.formFields[keys(this.formFields)[0]];
      }

      return tempDisplayName;
    },
    setIcon() {
      let tempIcon = 'check_box_outline_blank';

      if (this.icon.length > 0) {
        tempIcon = this.icon;
      }

      return `${tempIcon}`;
    },
  },
};
</script>

<style lang="scss" scoped>
/deep/ {
  .fr-error.floating-label-input {
    margin-bottom: 0 !important;
    border: none !important;

    /deep/ input {
      border: 1px solid $danger;
    }

    /deep/ button {
      border: 1px solid $danger !important;
      border-left-color: $gray-400 !important;
    }
  }

  .card-tabs-vertical {
    .card-body {
      padding: 0;
    }
  }
}

</style>
