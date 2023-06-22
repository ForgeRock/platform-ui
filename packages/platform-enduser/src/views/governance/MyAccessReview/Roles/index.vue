<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrMyAccessReviewTable
    default-sort="role.name"
    :fields="fields"
    grant-type="role" />
</template>

<script>

import FrMyAccessReviewTable from '../MyAccessReviewTable';

export default {
  name: 'Roles',
  components: {
    FrMyAccessReviewTable,
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
    };
  },
};
</script>
