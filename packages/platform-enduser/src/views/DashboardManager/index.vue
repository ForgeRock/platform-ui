<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrDashboard v-if="type === types.DEFAULT" />
    <FrGovDashboard v-if="type === types.GOVERNANCE" />
  </div>
</template>

<script>
import FrDashboard from '@/views/DashboardManager/dashboards/Default';
import FrGovDashboard from '@/views/DashboardManager/dashboards/Governance';

const types = {
  DEFAULT: 'default',
  GOVERNANCE: 'governance',
};

export default {
  name: 'DashboardManager',
  components: {
    FrDashboard,
    FrGovDashboard,
  },
  data() {
    return {
      type: 'default',
      types,
    };
  },
  created() {
    if (this.$store.state.SharedStore.governanceEnabled === true && this.$store.state.realm === 'alpha') this.type = types.GOVERNANCE;
  },
};
</script>
