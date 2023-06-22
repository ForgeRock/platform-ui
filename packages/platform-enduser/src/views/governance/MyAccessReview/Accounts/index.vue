<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrMyAccessReviewTable
    default-sort="application.name"
    :fields="fields"
    grant-type="account" />
</template>

<script>

import FrMyAccessReviewTable from '../MyAccessReviewTable';

export default {
  name: 'Accounts',
  components: {
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
