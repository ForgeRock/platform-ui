<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5">
    <FrHeader
      class="mb-4"
      :subtitle="$t('pages.myAccess.account.subtitle')"
      :title="$t('pages.myAccess.account.title')" />
    <FrMyAccessReviewTable
      default-sort="application.name"
      :fields="fields"
      grant-type="account" />
  </BContainer>
</template>

<script>
import { BContainer } from 'bootstrap-vue';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrMyAccessReviewTable from '@forgerock/platform-shared/src/components/governance/MyAccessReviewTable';

export default {
  name: 'Accounts',
  components: {
    BContainer,
    FrHeader,
    FrMyAccessReviewTable,
  },
  data() {
    return {
      fields: [
        {
          key: 'appName',
          label: this.$t('common.name'),
          sortable: true,
        },
        {
          key: 'status',
          label: this.$t('common.status'),
          sortable: true,
        },
      ],
    };
  },
};
</script>
