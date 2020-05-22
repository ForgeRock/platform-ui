<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BTab :title="$t('pages.access.privileges')">
    <div class="px-4 py-2 card-header">
      <BRow>
        <BCol
          md="7"
          class="my-1">
          <BButton
            type="button"
            variant="primary"
            class="mr-1"
            @click="$refs.addPrivilegesModal.show()"
            id="add_privilege">
            <i class="material-icons mr-2">add</i>
            {{ $t("common.add") }} {{ $t("pages.access.privileges") }}
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
        :fields="privilegesColumns"
        :items="privileges"
        :no-local-sorting="true"
        @row-clicked="showEditModal">
        <template v-slot:cell(path)="data">
          <slot
            name="path"
            :item="data">
            <span>
              {{ schemaMap[data.item.path].title | PluralizeFilter }}
            </span>
          </slot>
        </template>
        <template v-slot:cell(permissions)="data">
          <slot
            name="permissions"
            :item="data">
            <span
             v-for="permission in data.item.permissions"
             :key="permission"
             class="bagde badge-light mr-1 p-1">
             <small>
               {{ capitalizePermission(permission) }}
             </small>
           </span>
          </slot>
        </template>
        <template v-slot:cell(actions)="data">
          <slot
            name="actions"
            :item="data">
            <div class="text-right">
              <BDropdown
                variant="link"
                no-caret
                right
                toggle-class="text-decoration-none p-0">
                <template v-slot:button-content>
                  <i class="material-icons-outlined text-muted md-24">
                    more_horiz
                  </i>
                </template>
                <BDropdownItem @click="showEditModal(data.item, data.index)">
                  <i class="material-icons-outlined mr-3">
                    edit
                  </i> {{ $t('common.edit') }}
                </BDropdownItem>
                <BDropdownItem @click="confirmRemovePrivilege(data.index)">
                  <i class="material-icons-outlined mr-3">
                    delete
                  </i> {{ $t('common.delete') }}
                </BDropdownItem>
              </BDropdown>
            </div>
          </slot>
        </template>
      </BTable>
    </div>
    <BModal
      id="editPrivilegeModal"
      ref="editPrivilegeModal"
      :title="`${$t('common.edit')} ${$t('pages.access.privilege')}`"
      body-class="p-0"
      size="lg">
      <FrPrivilegeEditor
        v-if="privilegeToEdit"
        :privilege="privilegeToEdit"
        :identity-object-schema="schemaMap[privilegeToEdit.path]"
        @input="updatePrivilege" />

      <template v-slot:modal-footer="{ cancel }">
        <BButton
          variant="link"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <BButton
          variant="primary"
          @click="savePrivilege">
          {{ $t('common.save') }}
        </BButton>
      </template>
    </BModal>

    <BModal
      id="addPrivilegesModal"
      ref="addPrivilegesModal"
      :title="`${$t('common.add')} ${$t('pages.access.role')} ${$t('pages.access.privileges')}`"
      body-class="p-0"
      size="lg">
      <FrAddPrivileges
        :new-privileges="newPrivileges"
        :privileges-field="privilegesField"
        :schema-map="schemaMap"
        :loading="loading"/>
      <template v-slot:modal-footer="{ cancel }">
        <BButton
          variant="link"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <BButton
          variant="primary"
          @click="saveNewPrivileges">
          {{ $t('common.save') }}
        </BButton>
      </template>
    </BModal>

    <BModal
      id="removePrivilege"
      ref="removePrivilege"
      :title="$t('pages.access.removeModalTitle')">
      <div>
        {{ $t('pages.access.removeConfirm') }} {{ $t("pages.access.privilege") }}?
      </div>
      <div
        slot="modal-footer"
        class="w-100">
        <div class="float-right">
          <BButton
            variant="btn-link text-danger mr-2"
            @click="$refs.removePrivilege.hide()">
            {{ $t('common.cancel') }}
          </BButton>
          <BButton
            type="button"
            variant="danger"
            @click="removePrivilege">
            {{ $t('common.remove') }}
          </BButton>
        </div>
      </div>
    </BModal>
  </BTab>
</template>

<script>
import {
  capitalize,
  cloneDeep,
  findIndex,
  has,
} from 'lodash';
import {
  BButton,
  BCol,
  BDropdown,
  BDropdownItem,
  BModal,
  BRow,
  BTab,
  BTable,
} from 'bootstrap-vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import PluralizeFilter from '@forgerock/platform-shared/src/filters/PluralizeFilter';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import PrivilegeEditor from './PrivilegeEditor';
import AddPrivileges from './AddPrivileges';

export default {
  name: 'PrivilegesTab',
  components: {
    FrPrivilegeEditor: PrivilegeEditor,
    FrAddPrivileges: AddPrivileges,
    BButton,
    BCol,
    BDropdown,
    BDropdownItem,
    BModal,
    BRow,
    BTab,
    BTable,
  },
  filters: {
    PluralizeFilter,
  },
  data() {
    return {
      loading: true,
      newPrivileges: [],
      privilegeToEdit: null,
      editIndex: null,
      privilegesColumns: [
        {
          key: 'path',
          label: this.$t('pages.access.identityObject'),
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
      return this.privilegesField.value || [];
    },
  },
  methods: {
    /**
    * Shows privilege editor modal and sets the current privilegeToEdit and editIndex
    *
    * @property {object} privlege - new privilege object
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
      this.privilegesField.value.splice(this.editIndex, 1);
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
    * Saves the current privilegeToEdit to the correct editIndex in the privielges array
    */
    savePrivilege() {
      if (this.privilegeToEdit.accessFlags.length === 0) {
        this.displayNotification('IDMMessages', 'error', this.$t('pages.access.mustHaveOneAttributeWithRead'));
      } else {
        this.privilegesField.value[this.editIndex] = this.privilegeToEdit;

        this.savePrivileges();
      }
    },
    /**
    * Saves all newly created privileges by appending them to the privileges array
    */
    saveNewPrivileges() {
      let doSave = true;
      this.newPrivileges.forEach((privilege) => {
        // if there is no privilegesField.value make one
        if (!this.privilegesField.value) {
          this.privilegesField.value = [];
        }

        if (privilege.accessFlags.length === 0) {
          doSave = false;
          this.displayNotification('IDMMessages', 'error', this.$t('pages.access.mustHaveOneAttributeWithRead'));
        } else {
          const existingPrivilegeIndex = findIndex(this.privilegesField.value, { name: privilege.name });
          if (existingPrivilegeIndex > -1) {
            this.privilegesField.value[existingPrivilegeIndex] = privilege;
          } else {
            this.privilegesField.value.push(privilege);
          }
        }
      });

      if (doSave && this.newPrivileges.length > 0) {
        this.savePrivileges();
      }
    },
    /**
    * Saves privielges
    */
    savePrivileges() {
      const idmInstance = this.getRequestService();

      this.privilegesField.value.forEach((privilege) => {
        if (privilege.filter === '') {
          delete privilege.filter;
        }
      });

      const patch = [{ operation: 'add', field: '/privileges', value: this.privileges }];

      idmInstance.patch(this.resourcePath, patch).then((response) => response.data).then(() => {
        this.displayNotification('IDMMessages', 'success', this.$t('pages.access.successEdited', { resource: capitalize(this.resourceName) }));
        this.$refs.privilegesGrid.refresh();
        this.$refs.editPrivilegeModal.hide();
        this.newPrivileges = [];
        this.$refs.addPrivilegesModal.hide();
      }).catch((error) => {
        if (has(error, 'response.data.detail.failedPolicyRequirements[0].policyRequirements[0].params.invalidArrayItems[0].failedPolicyRequirements[0].policyRequirements[0].policyRequirement')) {
          const policyFailure = error.response.data.detail.failedPolicyRequirements[0].policyRequirements[0].params.invalidArrayItems[0].failedPolicyRequirements[0].policyRequirements[0];
          this.displayNotification('IDMMessages', 'error', this.$t(`common.policyValidationMessages.${policyFailure.policyRequirement}`, policyFailure.params));
        } else {
          this.displayNotification('IDMMessages', 'error', this.$t('pages.access.invalidEdit'));
        }
      });
    },
  },
  mounted() {
    const idmInstance = this.getRequestService();
    // get schema for all internal/role and all managed objects that are not managed/assignment
    idmInstance.get('schema?_queryFilter=resourceCollection eq "internal/role" or resourceCollection sw "managed" and !(resourceCollection eq "managed/assignment")&_fields=*').then((response) => {
      const schemas = response.data.result;

      schemas.forEach((schema) => {
        // eslint-disable-next-line no-underscore-dangle
        this.schemaMap[schema._id] = schema;
      });

      this.loading = false;
      this.oldPrivileges = this.privileges;
    },
    () => {
      this.displayNotification('IDMMessages', 'error', this.$t('pages.access.errorGettingSchema'));
    });
  },
};
</script>
