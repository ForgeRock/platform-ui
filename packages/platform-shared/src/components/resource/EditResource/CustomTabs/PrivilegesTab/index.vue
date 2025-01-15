<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BTab :title="$t('pages.access.privileges')">
    <div
      v-if="!disabled"
      class="px-4 py-2 card-header">
      <BRow>
        <BCol
          md="7"
          class="my-1">
          <BButton
            variant="primary"
            class="mr-1"
            @click="$refs.addPrivilegesModal.show()"
            id="add_privilege">
            <FrIcon
              icon-class="mr-2"
              :outlined="false"
              name="add">
              {{ $t("pages.access.addPrivileges") }}
            </FrIcon>
          </BButton>
        </BCol>
      </BRow>
    </div>

    <div>
      <BTable
        v-if="!loading"
        ref="privilegesGrid"
        class="mb-0 border-top"
        show-empty
        :empty-text="$t('common.noRecordsToShow')"
        :fields="privilegesColumns"
        :items="privileges"
        :no-local-sorting="true"
        @row-clicked="showEditModal">
        <template #cell(path)="{ item }">
          <span class="overflow-hidden">
            <div>
              {{ item.name }}
            </div>
            <div class="text-muted">
              {{ item.path }}
            </div>
          </span>
        </template>
        <template #cell(permissions)="{ item }">
          <BBadge
            v-for="permission in item.permissions"
            :key="permission"
            class="mr-1 p-1"
            variant="light">
            <small>
              {{ capitalizePermission(permission) }}
            </small>
          </BBadge>
        </template>
        <template #cell(actions)="{ index, item }">
          <FrActionsCell
            @delete-clicked="confirmRemovePrivilege(index)"
            @edit-clicked="showEditModal(item, index)" />
        </template>
      </BTable>
    </div>
    <VeeForm
      ref="observer"
      v-slot="{ meta: { valid } }"
      as="span">
      <BModal
        id="editPrivilegeModal"
        ref="editPrivilegeModal"
        :no-close-on-esc="true"
        :title="$t('pages.access.editPrivilege')"
        body-class="p-0"
        size="xl">
        <FrPrivilegeEditor
          v-if="privilegeToEdit"
          :privilege="privilegeToEdit"
          :identity-object-schema="schemaMap[privilegeToEdit.path]"
          :disabled="clonedPrivilegesField.disabled"
          :excluded-names="editNames"
          @input="updatePrivilege" />
        <template #modal-footer="{ cancel }">
          <BButton
            variant="link"
            @click="cancel()">
            {{ $t('common.cancel') }}
          </BButton>
          <BButton
            variant="primary"
            :disabled="clonedPrivilegesField.disabled || !valid"
            @click="savePrivilege">
            {{ $t('common.save') }}
          </BButton>
        </template>
      </BModal>

      <BModal
        id="addPrivilegesModal"
        ref="addPrivilegesModal"
        :no-close-on-esc="true"
        :title="$t('pages.access.addPrivileges')"
        body-class="p-0"
        size="xl">
        <FrAddPrivileges
          :privileges-field="clonedPrivilegesField"
          :schema-map="schemaMap"
          :loading="loading"
          :existing-names="existingNames"
          @new-privileges-modified="newPrivileges = $event" />
        <template #modal-footer="{ cancel }">
          <BButton
            variant="link"
            @click="cancel()">
            {{ $t('common.cancel') }}
          </BButton>
          <BButton
            variant="primary"
            :disabled="!valid"
            @click="saveNewPrivileges">
            {{ $t('common.save') }}
          </BButton>
        </template>
      </BModal>
    </VeeForm>

    <BModal
      id="removePrivilege"
      ref="removePrivilege"
      :title="$t('pages.access.removeModalTitle')">
      <div>
        {{ $t('pages.access.removeConfirm', { type: $t('pages.access.privilege') }) }}
      </div>
      <template #modal-footer="{ cancel }">
        <BButton
          variant="link"
          class="text-danger"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <BButton
          variant="danger"
          @click="removePrivilege">
          {{ $t('common.remove') }}
        </BButton>
      </template>
    </BModal>
  </BTab>
</template>

<script>
import {
  capitalize,
  cloneDeep,
  has,
} from 'lodash';
import {
  BBadge,
  BButton,
  BCol,
  BModal,
  BRow,
  BTab,
  BTable,
} from 'bootstrap-vue';
import axios from 'axios';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { Form as VeeForm } from 'vee-validate';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrPrivilegeEditor from './PrivilegeEditor';
import FrAddPrivileges from './AddPrivileges';

export default {
  name: 'PrivilegesTab',
  components: {
    BBadge,
    FrPrivilegeEditor,
    FrAddPrivileges,
    FrIcon,
    BButton,
    BCol,
    BModal,
    BRow,
    BTab,
    BTable,
    FrActionsCell,
    VeeForm,
  },
  data() {
    return {
      clonedPrivilegesField: {},
      loading: true,
      newPrivileges: [],
      privilegeToEdit: null,
      editIndex: null,
      existingNames: [],
      privilegesColumns: [
        {
          key: 'path',
          label: this.$t('common.name'),
        },
        {
          key: 'permissions',
          label: this.$t('pages.access.permissions'),
        },
        {
          key: 'actions',
          label: '',
        },
      ],
      schemaMap: {},
    };
  },
  mixins: [
    ResourceMixin,
    RestMixin,
    NotificationMixin,
  ],
  props: {
    revision: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    privilegesField: {
      type: Object,
      default: () => {},
    },
    resourcePath: {
      type: String,
      default: '',
    },
    resourceName: {
      type: String,
      default: '',
    },
  },
  computed: {
    privileges() {
      return this.clonedPrivilegesField.value || [];
    },
    editNames() {
      return this.privileges.map((privilege, index) => {
        if (this.editIndex === index) {
          return '';
        }
        return privilege.name;
      });
    },
  },
  methods: {
    /**
    * Shows privilege editor modal and sets the current privilegeToEdit and editIndex
    *
    * @property {object} privilege - new privilege object
    * @property {number} index - privilege array index
    */
    showEditModal(privilege, index) {
      // if privilege has no filter field add it as an empty string
      if (!has(privilege, 'filter')) {
        privilege.filter = '';
      }
      this.privilegeToEdit = cloneDeep(privilege);
      this.editIndex = index;
      this.$refs.editPrivilegeModal.show();
    },
    /**
    * Opens a confirmation modal for a privilege to remove and sets the editIndex for use in removePrivilege()
    *
    * @property {number} index - privilege to remove array index
    */
    confirmRemovePrivilege(index) {
      this.editIndex = index;
      this.$refs.removePrivilege.show();
    },
    /**
    * Removes confirmed privilege from privileges array
    */
    removePrivilege() {
      this.clonedPrivilegesField.value.splice(this.editIndex, 1);
      this.savePrivileges();
      this.$refs.removePrivilege.hide();
    },
    capitalizePermission(permission) {
      return capitalize(permission);
    },
    /**
    * Updates the value of a specific privilege in the privileges array
    *
    * @property {object} newVal - new privilege object value
    */
    updatePrivilege(newVal) {
      this.privilegeToEdit = newVal;
    },
    /**
    * Saves the current privilegeToEdit to the correct editIndex in the privileges array
    */
    savePrivilege() {
      if (this.privilegeToEdit.accessFlags.length === 0) {
        this.showErrorMessage('', this.$t('pages.access.mustHaveOneAttributeWithRead'));
      } else {
        this.clonedPrivilegesField.value[this.editIndex] = this.privilegeToEdit;

        this.savePrivileges();
      }
    },
    /**
    * Saves all newly created privileges by appending them to the privileges array
    */
    saveNewPrivileges() {
      let doSave = true;
      this.newPrivileges.forEach((newPrivilege) => {
        // if there is no clonedPrivilegesField.value make one
        if (!this.clonedPrivilegesField.value) {
          this.clonedPrivilegesField.value = [];
        }

        if (newPrivilege.accessFlags.length === 0) {
          doSave = false;
          this.showErrorMessage('', this.$t('pages.access.mustHaveOneAttributeWithRead'));
        } else {
          this.clonedPrivilegesField.value.push(newPrivilege);
        }
      });

      if (doSave && this.newPrivileges.length > 0) {
        this.savePrivileges();
      }
    },
    /**
    * Saves privileges
    */
    savePrivileges() {
      const idmInstance = this.getRequestService({
        headers: {
          'if-match': this.revision,
        },
      });

      this.clonedPrivilegesField.value.forEach((privilege) => {
        // IAM-8048 - _id should be included with readOnly set to true for all privileges
        const hasIdProperty = Object.keys(this.schemaMap[privilege.path]?.properties || {}).includes('_id');
        const hasIdPermission = privilege.accessFlags?.length && (privilege.accessFlags.findIndex((accessFlag) => accessFlag.attribute === '_id') !== -1);
        if (hasIdProperty && !hasIdPermission) {
          privilege.accessFlags.push({ attribute: '_id', readOnly: true });
        }
        if (privilege.filter === '') {
          delete privilege.filter;
        }
      });

      const patch = [{ operation: 'add', field: '/privileges', value: this.clonedPrivilegesField.value }];

      idmInstance.patch(this.resourcePath, patch).then(() => {
        this.displayNotification('success', this.$t('pages.access.successEdited', { resource: capitalize(this.resourceName) }));
        this.$refs.editPrivilegeModal.hide();
        this.newPrivileges = [];
        this.$refs.addPrivilegesModal.hide();
        this.existingNames = this.privileges.map((privilege) => privilege.name);
        this.$emit('refresh-data');
      }).catch((error) => {
        if (has(error, 'response.data.detail.failedPolicyRequirements[0].policyRequirements[0].params.invalidArrayItems[0].failedPolicyRequirements[0].policyRequirements[0].policyRequirement')) {
          const policyFailure = error.response.data.detail.failedPolicyRequirements[0].policyRequirements[0].params.invalidArrayItems[0].failedPolicyRequirements[0].policyRequirements[0];
          this.showErrorMessage('', this.$t(`common.policyValidationMessages.${policyFailure.policyRequirement}`, policyFailure.params));
        } else {
          this.showErrorMessage('', this.$t('pages.access.invalidEdit'));
        }
      });
    },
  },
  mounted() {
    const userStore = useUserStore();
    // get schema for all internal/role and all managed objects that are not
    // managed/assignment or that end in application
    if (userStore.adminUser) {
      const urlParams = {
        queryFilter: 'resourceCollection eq "internal/role" or (resourceCollection sw "managed")',
        fields: '*',
      };
      getSchema(encodeQueryString(urlParams)).then(
        (response) => {
          const schemas = response.data.result.filter((result) => {
            const resourceName = result.resourceCollection;

            // Always filter objects ending in managed/assignment, and when workforce
            // is enabled also filter out reserved resources
            const { workforceEnabled } = this.$store.state.SharedStore;
            const reservedAlways = this.$store.state.isFraas ? ['managed/alpha_assignment', 'managed/bravo_assignment'] : ['managed/assignment'];
            const reservedWhenWorkforceEnabled = this.$store.state.isFraas ? ['managed/alpha_application', 'managed/bravo_application'] : ['managed/application'];
            const rejectedAlways = reservedAlways.includes(resourceName);
            const rejectedWhenWorkforceEnabled = workforceEnabled && reservedWhenWorkforceEnabled.includes(resourceName);

            return !rejectedAlways && !rejectedWhenWorkforceEnabled;
          });

          schemas.forEach((schema) => {
            this.schemaMap[schema._id] = schema;
          });

          this.loading = false;
        },
        () => {
          this.showErrorMessage('', this.$t('pages.access.errorGettingSchema'));
        },
      );
    } else {
      // get privileges, then construct get with the resources they have access to, one at a time
      const idmInstance = this.getRequestService();
      idmInstance.post('privilege?_action=listPrivileges').then(
        (response) => {
          const axiosCalls = response.data.map((privilege) => getSchema(privilege.privilegePath));

          axios.all(axiosCalls).then(axios.spread((...privilegesArray) => {
            privilegesArray.forEach((privilegeObj) => {
              this.schemaMap[privilegeObj.data.resourceCollection] = privilegeObj.data;
            });

            this.loading = false;
          }), () => {
            this.showErrorMessage('', this.$t('pages.access.errorGettingSchema'));
          });
        },
        () => {
          this.showErrorMessage('', this.$t('pages.access.errorGettingSchema'));
        },
      );
    }
    this.existingNames = this.privileges.map((privilege) => privilege.name);
  },
  watch: {
    privilegesField: {
      handler(privilegesField) {
        this.clonedPrivilegesField = cloneDeep(privilegesField);
      },
      immediate: true,
    },
  },
};
</script>
