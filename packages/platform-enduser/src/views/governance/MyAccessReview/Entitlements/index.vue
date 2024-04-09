<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5">
    <FrHeader
      class="mb-4"
      :subtitle="$t('pages.myAccess.entitlement.subtitle')"
      :title="$t('pages.myAccess.entitlement.title')" />
    <BCard no-body>
      <FrGovResourceTable
        :fields="fields"
        grant-type="entitlement"
        :items="resourceItems"
        :total-count="resourceTotalCount"
        @load-data="queryResource"
        @revoke-items="createRevokeRequest($event, userId, 'gov-resource-revoke')" />
    </BCard>
  </BContainer>
</template>

<script>
import { BCard, BContainer } from 'bootstrap-vue';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { getGovernanceGrants, revokeResourcesFromIGA } from '@forgerock/platform-shared/src/utils/governance/resource';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrGovResourceTable from '@forgerock/platform-shared/src/components/governance/GovResourceTable';

export default {
  name: 'Entitlements',
  components: {
    BCard,
    BContainer,
    FrHeader,
    FrGovResourceTable,
  },
  data() {
    return {
      fields: [
        {
          key: 'appName',
          label: this.$t('common.application'),
          sortable: true,
        },
        {
          key: 'entitlementName',
          label: this.$t('common.name'),
          sortable: true,
        },
        {
          key: 'accountName',
          label: this.$t('pages.myAccess.accountName'),
          sortable: true,
        },
        {
          key: 'actions',
          label: '',
          class: 'p-3',
          sortable: false,
          thClass: 'w-100px',
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
      const response = await getGovernanceGrants('entitlement', this.userId, params);
      this.resourceItems = response.items;
      this.resourceTotalCount = response.totalCount;
    },
    async createRevokeRequest(requestPayload, userId, modalId) {
      try {
        await revokeResourcesFromIGA(requestPayload, userId, false);
        this.$bvModal.hide(modalId);
      } catch {
        // no catch statement needed
      }
    },
  },
};
</script>
