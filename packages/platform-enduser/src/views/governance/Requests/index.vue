<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer>
    <div class="mt-5">
      <FrHeader
        :title="$t('pageTitles.MyRequests')"
        :subtitle="$t('governance.accessRequests.myRequests.subtitle')" />
      <BCard
        no-body
        class="card-tabs-vertical" />
    </div>
  </BContainer>
</template>

<script>
import {
  BCard,
  BContainer,
} from 'bootstrap-vue';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
/**
 * @description Landing page for Requests
 */
export default {
  name: 'Requests',
  components: {
    BCard,
    BContainer,
    FrHeader,
  },
  data() {
    return {
    };
  },
};
</script>
