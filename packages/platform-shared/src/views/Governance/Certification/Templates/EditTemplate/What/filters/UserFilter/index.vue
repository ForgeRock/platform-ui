<!-- Copyright 2023-2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <FrField
      v-model="filterFields.userSelection"
      class="mb-4"
      name="userSelection"
      type="select"
      testid="user-selection"
      :options="userSelectionOptions" />
    <BCollapse :visible="filterFields.userSelection === $t('governance.editTemplate.singleUser')">
      <FrGovResourceSelect
        v-model="filterFields.singleUser"
        :initial-data="filterFields.singleUserInfo"
        name="singleUser"
        class="mb-4"
        resource-path="user" />
    </BCollapse>
    <BCollapse :visible="filterFields.userSelection === $t('governance.editTemplate.filterUsers')">
      <FrCertificationFilter
        @filter-update="filterFields.userFilter = $event"
        class="mb-4"
        resource-name="User"
        :properties="userProperties"
        :filter="filterFields.userFilter">
        <template #prefix>
          <slot name="prefix">
            {{ $t('governance.editTemplate.certifyUsersPrefix') }}
          </slot>
        </template>
        <template #suffix>
          <slot name="suffix">
            {{ $t('governance.editTemplate.certifyUsersSuffix') }}
          </slot>
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
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrCertificationFilter from '@forgerock/platform-shared/src/components/filterBuilder/CertificationFilter';
import { getGovernanceFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import { getAllFilter, getSingleFilter } from '@forgerock/platform-shared/src/views/Governance/utils/certification';

/**
 * A filter used to match opn user properties
 */
export default {
  name: 'UserFilter',
  components: {
    BCollapse,
    FrCertificationFilter,
    FrGovResourceSelect,
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
        singleUser: filterDataClone?.singleUser || '',
        singleUserInfo: filterDataClone?.singleUserInfo || {},
        userSelection: filterDataClone?.userSelection || '',
        userFilter: filterDataClone?.userFilter || {},
        numUsers: filterDataClone?.numUsers || 0,
      },
    };
  },
  computed: {
    userProperties() {
      return this.properties.user?.map((user) => ({
        value: user.key,
        label: user.displayName,
        type: user.type,
        path: user.managedObjectType,
      })) || [];
    },
    userSelectionOptions() {
      const options = [
        this.$t('governance.editTemplate.allUsers'),
        this.$t('governance.editTemplate.singleUser'),
        this.$t('governance.editTemplate.filterUsers'),
      ];
      if (!this.userProperties?.length) options.pop();
      return options;
    },
  },
  methods: {
    getUsersFilter(filterFields) {
      let userFilter = null;
      switch (filterFields.userSelection) {
        case this.$t('governance.editTemplate.allUsers'):
          userFilter = getAllFilter();
          break;
        case this.$t('governance.editTemplate.singleUser'):
          userFilter = getSingleFilter('id', filterFields.singleUser.split('/').pop());
          break;
        case this.$t('governance.editTemplate.filterUsers'):
          userFilter = getGovernanceFilter(filterFields.userFilter);
          break;
        default:
          break;
      }
      return userFilter;
    },
  },
  watch: {
    filterFields: {
      deep: true,
      handler(filterFields) {
        this.$emit('update-filter', {
          type: 'user',
          filter: this.getUsersFilter(filterFields),
          filterFields,
        });
      },
    },
  },
};
</script>
