<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
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
          <div class="py-2 fixed-width-title-cell">
            <i class="material-icons-outlined mr-3">
              {{ identityObjectSchema['mat-icon'] || 'settings_system_daydream' }}
            </i>
            <span>
              {{ identityObjectSchema.title | PluralizeFilter }}
            </span>
          </div>
        </slot>
      </template>
      <template v-slot:cell(view)="data">
        <slot
          name="view"
          :item="data">
          <div class="fixed-width-checkbox-cell">
            <BFormCheckbox
              v-model="data.item.view"
              :disabled="disabled"
              @change="togglePermission('view')" />
          </div>
        </slot>
      </template>
      <template v-slot:cell(create)="data">
        <slot
          name="create"
          :item="data">
          <div class="fixed-width-checkbox-cell">
            <BFormCheckbox
              v-model="data.item.create"
              :disabled="disabled"
              @change="togglePermission('create')" />
          </div>
        </slot>
      </template>
      <template v-slot:cell(update)="data">
        <slot
          name="update"
          :item="data">
          <div class="fixed-width-checkbox-cell">
            <BFormCheckbox
              v-model="data.item.update"
              :disabled="disabled"
              @change="togglePermission('update')" />
          </div>
        </slot>
      </template>
      <template v-slot:cell(delete)="data">
        <slot
          name="delete"
          :item="data">
          <div class="fixed-width-checkbox-cell">
            <BFormCheckbox
              v-model="data.item.delete"
              :disabled="disabled"
              @change="togglePermission('delete')" />
          </div>
        </slot>
      </template>
      <template v-slot:cell(actions)>
        <slot name="actions">
          <div class="fixed-width-actions-cell">
            <small>
              <BButton
                variant="link"
                class="p-0 mr-3"
                @click="showAdvanced = !showAdvanced">
                <span v-if="showAdvanced">
                  {{ $t('common.hide') }}
                </span>
                <span v-else>
                  {{ $t('common.show') }}
                </span>
                {{ $t('common.advanced') }}
              </BButton>
              <BButton
                v-if="showDelete"
                variant="none"
                class="p-0"
                @click="$emit('removePrivilege', index)">
                <i class="material-icons-outlined text-muted">
                  delete
                </i>
              </BButton>
            </small>
          </div>
        </slot>
      </template>
      <template v-slot:row-details>
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
            :field="queryFilterToggleField"
            :disabled="disabled"
            @input="toggleFilter" />
          <div
            v-if="queryFilterToggleField.value"
            class="pt-2">
            <FrQueryFilterBuilder
              @change="queryFilterChange"
              :disabled="disabled"
              :query-filter-string="privilege.filter"
              :resource-name="identityObjectSchema.title.toLowerCase()"
              :properties="queryFilterDropdownOptions" />
          </div>
        </BCard>
      </template>
    </BTable>
  </div>
</template>

<script>
import {
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
import FrQueryFilterBuilder from '@forgerock/platform-shared/src/components/QueryFilterBuilder';
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
        },
        {
          key: 'create',
          label: this.$t('common.create'),
        },
        {
          key: 'update',
          label: this.$t('common.update'),
        },
        {
          key: 'delete',
          label: this.$t('common.delete'),
        },
        {
          key: 'actions',
          label: '',
        },
      ],
    };
  },
  computed: {
    permissions() {
      const { permissions } = this.privilege;

      return [{
        view: includes(permissions, 'VIEW'),
        create: includes(permissions, 'CREATE'),
        update: includes(permissions, 'UPDATE'),
        delete: includes(permissions, 'DELETE'),
        _showDetails: this.showAdvanced,
      }];
    },
    availableAttibutes() {
      const availableAttibutes = [];
      const validProps = pickBy(this.identityObjectSchema.properties, (prop, key) => {
        prop.key = key;
        return !prop.isVirtual && !key.startsWith('_');
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
    queryFilterToggleField() {
      return {
        type: 'boolean',
        title: this.$t('pages.access.applyFilter', { resource: this.$options.filters.PluralizeFilter(this.identityObjectSchema.title) }),
        value: this.filterOn,
      };
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
  },
  methods: {
    /**
    * shows/hides QueryFilterBuilder component and sets privilege filter value to empty string when turned off
    *
    * @property {boolean} val - toggle switch value
    */
    toggleFilter(val) {
      if (!val) {
        this.privilege.filter = '';
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
      this.privilege.filter = queryFilterString;
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
/deep/ {
  #attributePermissionsContainer {
    max-height: 270px;
  }

  .fixed-width-title-cell {
    width: 150px;
  }

  .fixed-width-actions-cell {
    width: 160px;
  }

  .fixed-width-checkbox-cell {
    width: 49px;
  }
}
</style>
