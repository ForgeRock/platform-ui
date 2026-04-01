<!-- Copyright 2023-2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <h2 class="h5 mb-3">
      {{ $t('common.roles') }}
    </h2>
    <FrField
      v-model="filterFields.roleSelection"
      class="mb-4"
      name="roleSelection"
      testid="role-selection"
      type="select"
      :options="roleSelectionOptions" />
    <BCollapse :visible="filterFields.roleSelection === $t('governance.editTemplate.filterRoles')">
      <FrCertificationFilter
        @filter-update="filterFields.roleFilter = $event"
        class="mb-4"
        :resource-name="$t('common.role')"
        :properties="roleProperties"
        :filter="filterFields.roleFilter">
        <template #prefix>
          {{ $t('governance.editTemplate.certifyRolesPrefix') }}
        </template>
        <template #suffix>
          {{ $t('governance.editTemplate.certifyRolesSuffix') }}
        </template>
      </FrCertificationFilter>
    </BCollapse>
  </div>
</template>
<script>

import {
  BCollapse,
} from 'bootstrap-vue';
import { cloneDeep } from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrCertificationFilter from '@forgerock/platform-shared/src/components/filterBuilder/CertificationFilter';
import { getGovernanceFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import { getAllFilter } from '@forgerock/platform-shared/src/views/Governance/utils/certification';

/**
 * A filter used to match on role properties
 */
export default {
  name: 'RoleFilter',
  components: {
    BCollapse,
    FrCertificationFilter,
    FrField,
  },
  props: {
    filterData: {
      type: Object,
      default: () => ({}),
    },
    properties: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    const filterDataClone = cloneDeep(this.filterData);
    return {
      filterFields: {
        roleSelection: filterDataClone?.roleSelection || '',
        roleFilter: filterDataClone?.roleFilter || {},
      },
    };
  },
  computed: {
    roleProperties() {
      // id property is not useful for filtering
      const filteredProperties = this.properties.role?.filter((property) => (property.key !== 'id')) || [];
      return filteredProperties.map((role) => ({
        value: role.key,
        label: role.displayName,
        type: role.type,
        path: role.managedObjectType,
      }));
    },
    roleSelectionOptions() {
      const options = [
        this.$t('governance.editTemplate.allRoles'),
        this.$t('governance.editTemplate.filterRoles'),
      ];
      if (!this.roleProperties?.length) options.pop();
      return options;
    },
  },
  methods: {
    getRoleFilter() {
      let roleFilter = null;
      switch (this.filterFields.roleSelection) {
        case this.$t('governance.editTemplate.allRoles'):
          roleFilter = getAllFilter();
          break;
        case this.$t('governance.editTemplate.filterRoles'):
          roleFilter = getGovernanceFilter(this.filterFields.roleFilter);
          break;
        default:
          break;
      }
      return roleFilter;
    },
  },
  watch: {
    filterFields: {
      deep: true,
      handler(filterFields) {
        this.$emit('update-filter', {
          type: 'role',
          filter: this.getRoleFilter(),
          filterFields,
        });
      },
    },
  },
};
</script>
