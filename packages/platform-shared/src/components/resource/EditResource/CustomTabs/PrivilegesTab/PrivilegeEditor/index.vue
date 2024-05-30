<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="overflow-auto">
    <BTable
      class="p-0 mb-0"
      no-border
      show-empty
      :empty-text="$t('common.noRecordsToShow')"
      ref="permissionsGrid"
      :fields="permissionsColumns"
      :items="permissions"
      :thead-class="[{'d-none': !showHeader}]"
      :no-local-sorting="true">
      <template #cell(identityObject)="data">
        <slot
          name="identityObject"
          :item="data">
          <div
            class="py-2 d-flex"
            @click="showAdvanced = !showAdvanced">
            <FrIcon
              :icon-class="`${error ? 'color-red' : ''} mr-3 align-self-center cursor-pointer`"
              :name="error ? 'info' : identityObjectSchema['mat-icon'] || 'settings_system_daydream'" />
            <span class="mw-100">
              <div class="text-truncate">
                {{ privilegeModel.name }}
              </div>
              <div class="text-truncate text-muted">
                {{ privilegeModel.path }}
              </div>
            </span>
          </div>
        </slot>
      </template>
      <template #cell(view)="data">
        <slot
          name="view"
          :item="data">
          <div>
            <BFormCheckbox
              v-model="data.item.view"
              :aria-label="data.field.label"
              :disabled="disabled"
              @change="togglePermission('view')" />
          </div>
        </slot>
      </template>
      <template #cell(create)="data">
        <slot
          name="create"
          :item="data">
          <div>
            <BFormCheckbox
              v-model="data.item.create"
              :aria-label="data.field.label"
              :disabled="disabled"
              @change="togglePermission('create')" />
          </div>
        </slot>
      </template>
      <template #cell(update)="data">
        <slot
          name="update"
          :item="data">
          <div>
            <BFormCheckbox
              v-model="data.item.update"
              :aria-label="data.field.label"
              :disabled="disabled"
              @change="togglePermission('update')" />
          </div>
        </slot>
      </template>
      <template #cell(delete)="data">
        <slot
          name="delete"
          :item="data">
          <div>
            <BFormCheckbox
              v-model="data.item.delete"
              :aria-label="data.field.label"
              :disabled="disabled"
              @change="togglePermission('delete')" />
          </div>
        </slot>
      </template>
      <template #cell(actions)>
        <slot name="actions">
          <div class="actions">
            <small class="text-nowrap">
              <BButton
                variant="link"
                class="p-0 mr-3"
                @click="showAdvanced = !showAdvanced">
                {{ showAdvanced ? $t('pages.access.hideAdvanced') : $t('pages.access.showAdvanced') }}
              </BButton>
              <BButton
                v-if="showDelete"
                :aria-label="$t('common.delete')"
                variant="none"
                class="p-0"
                @click="$emit('remove-privilege', index)">
                <FrIcon
                  icon-class="text-muted"
                  name="delete" />
              </BButton>
            </small>
          </div>
        </slot>
      </template>
      <template #row-details>
        <span v-show="showAdvanced">
          <FrField
            v-model="privilegeName"
            class="mb-4 flex-grow-1"
            :label="$t('pages.access.privilegeName')"
            :name="`privilegeName_${index}`"
            :validation="privilegeNameValidation"
            @input="privilegeModel.name = $event" />
          <BCard
            body-class="p-0"
            class="shadow-none">
            <div class="p-4 border-bottom">
              <h5>{{ $t('pages.access.attribute') }} {{ $t('pages.access.permissions') }}</h5>
              <div class="mb-0 text-muted">
                {{ $t('pages.access.managePermissions') }}
                <span>
                  <BDropdown
                    variant="link"
                    no-caret
                    toggle-class="text-decoration-none p-0"
                    :disabled="disabled">
                    <template #button-content>
                      <span>
                        {{ $t('pages.access.setAllAttributes') }}
                      </span>
                    </template>
                    <BDropdownItem @click="setAllAccessFlags(true)">
                      {{ $t('pages.access.read') }}
                    </BDropdownItem>
                    <BDropdownItem
                      v-if="showReadWrite"
                      @click="setAllAccessFlags(false)">
                      {{ $t('pages.access.readWrite') }}
                    </BDropdownItem>
                    <BDropdownItem @click="removeAllAccessFlags()">
                      {{ $t('common.none') }}
                    </BDropdownItem>
                  </BDropdown>
                </span>.
              </div>
            </div>
            <div
              id="attributePermissionsContainer"
              class="overflow-auto">
              <div
                v-for="attribute in availableAttibutes"
                role="row"
                :key="attribute.key"
                class="p-4 border-top">
                <small class="d-inline-block text-monospace flex-grow-1">
                  {{ attribute.key }}
                </small>
                <div class="float-right">
                  <BDropdown
                    variant="link"
                    toggle-class="text-decoration-none p-0"
                    :disabled="disabled">
                    <template #button-content>
                      <span class="mr-5">
                        {{ attribute.status }}
                      </span>
                    </template>
                    <BDropdownItem @click="setAccessFlag(attribute.key, true)">
                      {{ $t('pages.access.read') }}
                    </BDropdownItem>
                    <BDropdownItem
                      v-if="showReadWrite"
                      @click="setAccessFlag(attribute.key, false)">
                      {{ $t('pages.access.readWrite') }}
                    </BDropdownItem>
                    <BDropdownItem @click="removeAccessFlag(attribute.key)">
                      {{ $t('common.none') }}
                    </BDropdownItem>
                  </BDropdown>
                </div>
              </div>
            </div>
          </BCard>
          <BCard class="mt-4 mb-3 py-1 shadow-none">
            <FrField
              v-model="filterOn"
              class="mb-3"
              type="boolean"
              :disabled="disabled"
              :label="$t('pages.access.applyFilter', { resource: pluralizeValue(identityObjectSchema.title) })"
              @input="toggleFilter" />
            <div
              v-if="filterOn"
              class="pt-2">
              <FrQueryFilterBuilder
                @change="queryFilterChange"
                :disabled="disabled"
                :query-filter-string="privilegeModel.filter"
                :resource-name="identityObjectSchema.title.toLowerCase()"
                :properties="queryFilterDropdownOptions" />
            </div>
          </BCard>
        </span>
      </template>
    </BTable>
  </div>
</template>

<script>
import {
  cloneDeep,
  find,
  findIndex,
  filter,
  has,
  includes,
  map,
  pickBy,
} from 'lodash';
import {
  BButton,
  BCard,
  BDropdown,
  BDropdownItem,
  BFormCheckbox,
  BTable,
} from 'bootstrap-vue';
import { pluralizeValue } from '@forgerock/platform-shared/src/utils/PluralizeUtils';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrQueryFilterBuilder from '@forgerock/platform-shared/src/components/filterBuilder/QueryFilterBuilder';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';

export default {
  name: 'PrivilegeEditor',
  components: {
    BButton,
    BCard,
    BDropdown,
    BDropdownItem,
    BFormCheckbox,
    BTable,
    FrField,
    FrIcon,
    FrQueryFilterBuilder,
  },
  mixins: [
    NotificationMixin,
  ],
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    excludedNames: {
      type: Array,
      default: () => [],
    },
    privilege: {
      type: Object,
      default: () => ({}),
    },
    identityObjectSchema: {
      type: Object,
      default: () => ({}),
    },
    index: {
      type: Number,
      default: -1,
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
    showDelete: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showAdvanced: false,
      showReadWrite: this.privilege.permissions.includes('CREATE') || this.privilege.permissions.includes('UPDATE'),
      filterOn: has(this.privilege, 'filter') && this.privilege.filter.length > 0,
      permissionsColumns: [
        {
          key: 'identityObject',
          label: '',
        },
        {
          key: 'view',
          label: this.$t('common.view'),
          class: 'privilege-column',
        },
        {
          key: 'create',
          label: this.$t('common.create'),
          class: 'privilege-column',
        },
        {
          key: 'update',
          label: this.$t('common.update'),
          class: 'privilege-column',
        },
        {
          key: 'delete',
          label: this.$t('common.delete'),
          class: 'privilege-column',
        },
        {
          key: 'actions',
          label: '',
        },
      ],
      privilegeModel: this.privilege,
      privilegeName: this.privilege.name,
      uniqueNames: [],
    };
  },
  computed: {
    error() {
      return this.uniqueNames.includes(this.privilegeName.trim());
    },
    permissions() {
      const { permissions } = this.privilegeModel;

      return [{
        view: includes(permissions, 'VIEW'),
        create: includes(permissions, 'CREATE'),
        update: includes(permissions, 'UPDATE'),
        delete: includes(permissions, 'DELETE'),
        _showDetails: true,
      }];
    },
    availableAttibutes() {
      const availableAttibutes = [];
      const validProps = pickBy(this.identityObjectSchema.properties, (prop, key) => {
        prop.key = key;
        return !key.startsWith('_');
      });

      this.identityObjectSchema.order.forEach((propertyName) => {
        const propObject = find(validProps, { key: propertyName });

        if (propObject) {
          const accessFlag = this.getAccessFlag(propertyName);
          propObject.status = this.$t('common.none');

          if (accessFlag) {
            propObject.status = accessFlag.readOnly ? this.$t('pages.access.read') : this.$t('pages.access.readWrite');
          }
          availableAttibutes.push(propObject);
        }
      });

      return availableAttibutes;
    },
    privilegeNameValidation() {
      return { required: true, unique: this.uniqueNames };
    },
    queryFilterDropdownOptions() {
      const allOptions = map(this.availableAttibutes, (attribute) => {
        const option = {
          label: attribute.title || attribute.description,
          value: attribute.key,
          type: attribute.type,
        };

        return option;
      });

      return filter(allOptions, (option) => {
        const isValidType = ['string', 'boolean', 'number'].includes(option.type);
        return isValidType;
      });
    },
  },
  watch: {
    privilege: {
      immediate: true,
      deep: true,
      handler(newVal) {
        this.privilegeModel = newVal;
      },
    },
    privilegeModel: {
      deep: true,
      handler(newVal) {
        this.$emit('input', newVal, this.index);
      },
    },
    excludedNames: {
      immediate: true,
      deep: true,
      handler(newVal) {
        this.uniqueNames = cloneDeep(newVal);
        this.uniqueNames[this.index] = '';
        this.uniqueNames.forEach((name) => name.trim());
      },
    },
  },
  methods: {
    pluralizeValue,
    /**
    * shows/hides QueryFilterBuilder component and sets privilegeModel filter value to empty string when turned off
    *
    * @property {boolean} val - toggle switch value
    */
    toggleFilter(val) {
      if (!val) {
        delete this.privilegeModel.filter;
        this.filterOn = false;
      } else {
        this.filterOn = true;
      }
    },
    /**
    * Turns permission on/off by adding/removing permision from privilegeModel.permission
    *
    * @property {string} permission - permission to turn on/off
    */
    togglePermission(permission) {
      const permissionUpper = permission.toUpperCase();
      const permissionIndex = this.privilegeModel.permissions.indexOf(permissionUpper);

      if (permissionIndex > -1) {
        this.privilegeModel.permissions.splice(permissionIndex, 1);
      } else {
        this.privilegeModel.permissions.push(permissionUpper);
      }

      // must always have at least "view" permissionss
      if (this.privilegeModel.permissions.length === 0) {
        this.$nextTick(() => this.privilegeModel.permissions.push('VIEW'));
        this.displayNotification('warning', this.$t('pages.access.onePermissionRequired'));
      }
      this.setDefaultAccessFlags();
    },
    /**
    * Finds a specifc accessFlag in privilegeModel.accessFlags array
    *
    * @property {string} propertyName - attribute name to find
    */
    getAccessFlag(propertyName) {
      return find(this.privilegeModel.accessFlags, { attribute: propertyName });
    },
    /**
    * Sets value of a specific accessFlag
    *
    * @property {string} propertyName - attribute name to find
    * @property {boolean} readOnly - accessFlag readOnly setting
    */
    setAccessFlag(propertyName, readOnly) {
      const accessFlag = this.getAccessFlag(propertyName);

      if (!accessFlag) {
        this.privilegeModel.accessFlags.push({
          attribute: propertyName,
          readOnly,
        });
      } else {
        accessFlag.readOnly = readOnly;
      }
    },
    /**
    * Sets the readOnly value of all access flags in privilegeModel.accessFlag array
    *
    * @property {boolean} readOnly - accessFlag readOnly setting
    */
    setAllAccessFlags(readOnly) {
      this.availableAttibutes.forEach((attribute) => {
        this.setAccessFlag(attribute.key, readOnly);
      });
    },
    /**
    * Removes a specifc accessFlag from privilegeModel.accessFlags array
    *
    * @property {string} propertyName - attribute name for accessFlag to remove
    */
    removeAccessFlag(propertyName) {
      const accessFlagIndex = findIndex(this.privilegeModel.accessFlags, { attribute: propertyName });
      this.privilegeModel.accessFlags.splice(accessFlagIndex, 1);
    },
    /**
    * Sets all accessFlags to "None" by emptying the privilges.accessFlags array
    */
    removeAllAccessFlags() {
      this.privilegeModel.accessFlags = [];
    },
    /**
    * Handles change to QueryFilterBuilder value
    *
    * @property {string} queryFilterString - new queryFilterString value
    */
    queryFilterChange(queryFilterString) {
      if (queryFilterString) {
        this.privilegeModel.filter = queryFilterString;
      }
    },
    /**
    * Sets default access flags for View (all readOnly true), and for  Create and Update (all readOnly to false)
    */
    setDefaultAccessFlags() {
      const { permissions } = this.privilegeModel;

      if (permissions.includes('CREATE') || permissions.includes('UPDATE')) {
        this.privilegeModel.accessFlags.forEach((accessFlag) => {
          accessFlag.readOnly = false;
        });

        this.showReadWrite = true;
      }

      if (!permissions.includes('CREATE') && !permissions.includes('UPDATE')) {
        this.privilegeModel.accessFlags.forEach((accessFlag) => {
          accessFlag.readOnly = true;
        });

        this.showReadWrite = false;
      }
    },
  },
  mounted() {
    if (this.privilegeModel.accessFlags?.length === 0) {
      this.setAllAccessFlags(true);
    }
  },
};
</script>

<style lang="scss" scoped>

.actions {
  text-align: right;
}

:deep {
  #attributePermissionsContainer {
    max-height: 270px;
  }

  .privilege-column {
    width: 70px;
  }

  .table.b-table > tbody > .b-table-details > td {
    padding-top: 0;
  }
}
</style>
