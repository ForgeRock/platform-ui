<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer>
    <div class="mt-5">
      <FrHeader
        :title="$t('pageTitles.Approvals')"
        :subtitle="$t('governance.approval.subtitle')" />
      <BCard
        no-body>
        <FrAccessRequestList
          :requests="accessRequests" />
      </BCard>
    </div>
  </BContainer>
</template>

<script>
import {
  BCard,
  BContainer,
} from 'bootstrap-vue';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrAccessRequestList from '@/components/governance/AccessRequestList';
import { getUserApprovals } from '@/api/governance/AccessRequestApi';

/**
 * @description Landing page for User Approvals
 */
export default {
  name: 'Approvals',
  components: {
    BCard,
    BContainer,
    FrAccessRequestList,
    FrHeader,
  },
  data() {
    return {
      accessRequests: [],
    };
  },
  mounted() {
    getUserApprovals(null, { pageSize: 10, pageNumber: 1 }).then(({ data }) => {
      this.accessRequests = data.results;
    });
  },
};
</script>
