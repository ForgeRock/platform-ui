<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5">
    <FrHeader
      class="mb-4"
      :subtitle="$t('pages.myAccess.entitlement.subtitle')"
      :title="$t('pages.myAccess.entitlement.title')" />
    <FrGovResourceTable
      default-sort="application.name"
      :fields="fields"
      grant-type="entitlement" />
  </BContainer>
</template>

<script>
import { BContainer } from 'bootstrap-vue';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrGovResourceTable from '@forgerock/platform-shared/src/components/governance/GovResourceTable';

export default {
  name: 'Entitlements',
  components: {
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
      ],
    };
  },
};
</script>
