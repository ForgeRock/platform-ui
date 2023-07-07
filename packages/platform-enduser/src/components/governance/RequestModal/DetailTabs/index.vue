<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="card-tabs-vertical">
    <BTabs
      class="w-100"
      pills
      card
      vertical>
      <BTab
        v-for="tab in tabs"
        :key="tab.title"
        :title="tab.title"
        class="p-0"
        :data-testid="`tab-${tab}`">
        <Component
          :is="tab.component"
          :item="item"
        />
      </BTab>
    </BTabs>
  </div>
</template>

<script>

import {
  BTabs, BTab,
} from 'bootstrap-vue';
import FrDetails from './Details';

export default {
  name: 'RequestModalDetailTabs',
  components: {
    BTabs,
    BTab,
    FrDetails,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      tabs: [
        {
          component: 'FrDetails',
          title: this.$t('common.details'),
        },
        {
          component: '',
          title: this.$t('governance.accessRequest.requestModal.workflow'),
        },
        {
          component: '',
          title: this.$t('governance.accessRequest.requestModal.comments'),
        },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
  ::v-deep .nav-pills {
    padding: 0px;
  }

  ::v-deep .tabs > .col-auto {
    min-width: 160px;
  }

  .card-tabs-vertical ::v-deep .nav {
    margin-left: -1px;
  }
</style>
