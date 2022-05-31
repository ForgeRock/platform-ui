<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="overflow-auto">
    <BTable
      class="p-0 mb-0"
      no-border
      show-empty
      ref="permissionsGrid"
      :fields="permissionsColumns"
      :items="permissions"
      :thead-class="[{'d-none': !showHeader}]"
      :no-local-sorting="true">
      <template v-slot:cell(identityObject)="data">
        <slot
          name="identityObject"
          :item="data">
          <div
            class="py-2 d-flex"
            @click="showAdvanced = !showAdvanced">
            <FrIcon
              :class="[{ 'color-red': error}, ' mr-3 align-self-center cursor-pointer']"
              :name="error ? 'info' : identityObjectSchema['mat-icon'] || 'settings_system_daydream'"
            />
            <span class="mw-100">
              <div class="text-truncate">
                {{ privilege.name }}
              </div>
              <div class="text-truncate text-muted">
                {{ privilege.path }}
              </div>
            </span>
          </div>
        </slot>
      </template>
      <template v-slot:cell(view)="data">
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
      <template v-slot:cell(create)="data">
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
      <template v-slot:cell(update)="data">
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
      <template v-slot:cell(delete)="data">
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
      <template v-slot:cell(actions)>
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
                  class="text-muted"
                  name="delete"
                />
              </BButton>
            </small>
          </div>
        </slot>
      </template>
      <template v-slot:row-details>
        <span v-show="showAdvanced">
          <FrField
            v-model="privilegeName"
            class="mb-4 flex-grow-1"
            :label="$t('pages.access.privilegeName')"
            :validation="privilegeNameValidation"
            @input="privilege.name = $event" />
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
                    <template v-slot:button-content>
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
                    <template v-slot:button-content>
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
              :label="$t('pages.access.applyFilter', { resource: $options.filters.PluralizeFilter(identityObjectSchema.title) })"
              @input="toggleFilter" />
            <div
              v-if="filterOn"
              class="pt-2">
              <FrQueryFilterBuilder
                @change="queryFilterChange"
                :disabled="disabled"
                :query-filter-string="privilege.filter"
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
// eslint-disable-next-line import/no-extraneous-dependencies
import PluralizeFilter from '@forgerock/platform-shared/src/filters/PluralizeFilter';
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
  filters: {
    PluralizeFilter,
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
      default: () => {},
    },
    identityObjectSchema: {
      type: Object,
      default: () => {},
    },
    index: {
      type: Number,
      default: -1,
      required: false,
    },
    showHeader: {
      type: Boolean,
      default: true,
      required: false,
    },
    showDelete: {
      type: Boolean,
      default: false,
      required: false,
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
      privilegeName: this.privilege.name,
      uniqueNames: [],
    };
  },
  computed: {
    error() {
      return this.uniqueNames.includes(this.privilegeName.trim());
    },
    permissions() {
      const { permissions } = this.privilege;

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
    /**
    * shows/hides QueryFilterBuilder component and sets privilege filter value to empty string when turned off
    *
    * @property {boolean} val - toggle switch value
    */
    toggleFilter(val) {
      if (!val) {
        delete this.privilege.filter;
        this.filterOn = false;
      } else {
        this.filterOn = true;
      }
    },
    /**
    * Turns permission on/off by adding/removing permision from privilege.permission
    *
    * @property {string} permission - permission to turn on/off
    */
    togglePermission(permission) {
      const permissionUpper = permission.toUpperCase();
      const permissionIndex = this.privilege.permissions.indexOf(permissionUpper);

      if (permissionIndex > -1) {
        this.privilege.permissions.splice(permissionIndex, 1);
      } else {
        this.privilege.permissions.push(permissionUpper);
      }

      // must always have at least "view" permissionss
      if (this.privilege.permissions.length === 0) {
        this.$nextTick(() => this.privilege.permissions.push('VIEW'));
        this.displayNotification('AdminMessage', 'warning', this.$t('pages.access.onePermissionRequired'));
      }
      this.setDefaultAccessFlags();
    },
    /**
    * Finds a specifc accessFlag in privilege.accessFlags array
    *
    * @property {string} propertyName - attribute name to find
    */
    getAccessFlag(propertyName) {
      return find(this.privilege.accessFlags, { attribute: propertyName });
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
        this.privilege.accessFlags.push({
          attribute: propertyName,
          readOnly,
        });
      } else {
        accessFlag.readOnly = readOnly;
      }
    },
    /**
    * Sets the readOnly value of all access flags in privilege.accessFlag array
    *
    * @property {boolean} readOnly - accessFlag readOnly setting
    */
    setAllAccessFlags(readOnly) {
      this.availableAttibutes.forEach((attribute) => {
        this.setAccessFlag(attribute.key, readOnly);
      });
    },
    /**
    * Removes a specifc accessFlag from privilege.accessFlags array
    *
    * @property {string} propertyName - attribute name for accessFlag to remove
    */
    removeAccessFlag(propertyName) {
      const accessFlagIndex = findIndex(this.privilege.accessFlags, { attribute: propertyName });
      this.privilege.accessFlags.splice(accessFlagIndex, 1);
    },
    /**
    * Sets all accessFlags to "None" by emptying the privilges.accessFlags array
    */
    removeAllAccessFlags() {
      this.privilege.accessFlags = [];
    },
    /**
    * Handles change to QueryFilterBuilder value
    *
    * @property {string} queryFilterString - new queryFilterString value
    */
    queryFilterChange(queryFilterString) {
      if (queryFilterString) {
        this.privilege.filter = queryFilterString;
      }
    },
    /**
    * Sets default access flags for View (all readOnly true), and for  Create and Update (all readOnly to false)
    */
    setDefaultAccessFlags() {
      const { permissions } = this.privilege;

      if (permissions.includes('CREATE') || permissions.includes('UPDATE')) {
        this.privilege.accessFlags.forEach((accessFlag) => {
          accessFlag.readOnly = false;
        });

        this.showReadWrite = true;
      }

      if (!permissions.includes('CREATE') && !permissions.includes('UPDATE')) {
        this.privilege.accessFlags.forEach((accessFlag) => {
          accessFlag.readOnly = true;
        });

        this.showReadWrite = false;
      }
    },
  },
  mounted() {
    if (this.privilege.accessFlags && this.privilege.accessFlags.length === 0) {
      this.setAllAccessFlags(true);
    }
  },
};
</script>

<style lang="scss" scoped>

.actions {
  text-align: right;
}

::v-deep {
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
