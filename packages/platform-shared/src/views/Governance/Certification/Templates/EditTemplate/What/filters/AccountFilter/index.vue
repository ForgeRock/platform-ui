<!-- Copyright 2023-2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <h2 class="h5 mb-3">
      {{ $t('common.accounts') }}
    </h2>
    <FrField
      v-model="filterFields.accountSelection"
      class="mb-4"
      name="accountSelection"
      testid="account-selection"
      type="select"
      :options="accountSelectionOptions" />
    <BCollapse :visible="filterFields.accountSelection === $t('governance.editTemplate.filterAccounts')">
      <FrCertificationFilter
        @filter-update="filterFields.accountFilter = $event"
        class="mb-4"
        :resource-name="$t('governance.editTemplate.accounts')"
        :properties="accountProperties"
        :filter="filterFields.accountFilter">
        <template #prefix>
          {{ $t('governance.editTemplate.certifyAccountsPrefix') }}
        </template>
        <template #suffix>
          {{ $t('governance.editTemplate.certifyAccountsSuffix') }}
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
 * A filter used to match on account properties
 */
export default {
  name: 'AccountFilter',
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
        accountSelection: filterDataClone?.accountSelection || '',
        accountFilter: filterDataClone?.accountFilter || {},
      },
    };
  },
  computed: {
    accountProperties() {
      return this.properties.account?.map((account) => ({
        value: account?.key,
        label: account?.displayName,
        type: account?.type,
        path: account?.managedObjectType,
      }));
    },
    accountSelectionOptions() {
      const options = [
        this.$t('governance.editTemplate.allAccounts'),
        this.$t('governance.editTemplate.filterAccounts'),
      ];
      if (!this.accountProperties?.length) options.pop();
      return options;
    },
  },
  methods: {
    getAccountsFilter() {
      let accountFilter = null;

      switch (this.filterFields.accountSelection) {
        case this.$t('governance.editTemplate.allAccounts'):
          accountFilter = getAllFilter();
          break;
        case this.$t('governance.editTemplate.filterAccounts'):
          accountFilter = getGovernanceFilter(this.filterFields.accountFilter);
          break;
        default:
          break;
      }
      return accountFilter;
    },
  },
  watch: {
    filterFields: {
      deep: true,
      handler(filterFields) {
        this.$emit('update-filter', {
          type: 'account',
          filter: this.getAccountsFilter(),
          filterFields,
        });
      },
    },
  },
};
</script>
