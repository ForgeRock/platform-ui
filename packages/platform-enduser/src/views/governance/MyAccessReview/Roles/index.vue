<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5">
    <FrHeader
      class="mb-4"
      :subtitle="$t('pages.myAccess.role.subtitle')"
      :title="$t('pages.myAccess.role.title')" />
    <FrGovResourceTable
      :fields="fields"
      grant-type="role"
      :items="resourceItems"
      :total-count="resourceTotalCount"
      @load-data="queryResource" />
  </BContainer>
</template>

<script>
import { BContainer } from 'bootstrap-vue';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { getGovernanceGrants } from '@forgerock/platform-shared/src/utils/governance/resource';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrGovResourceTable from '@forgerock/platform-shared/src/components/governance/GovResourceTable';

export default {
  name: 'Roles',
  components: {
    BContainer,
    FrHeader,
    FrGovResourceTable,
  },
  data() {
    return {
      fields: [
        {
          key: 'roleName',
          label: this.$t('common.name'),
          sortable: true,
        },
        {
          key: 'timeConstraint',
          label: this.$t('pages.myAccess.timeConstraint'),
        },
      ],
      resourceItems: [],
      resourceTotalCount: 0,
      userId: useUserStore().userId,
    };
  },
  methods: {
    /**
     * Request grants for governance resource
     * @param {Object} params query parameters to pass to request
     */
    async queryResource(params) {
      const response = await getGovernanceGrants('role', this.userId, params);
      this.resourceItems = response.items;
      this.resourceTotalCount = response.totalCount;
    },
  },
};
</script>
