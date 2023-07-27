<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="card-tabs-vertical">
    <BTabs
      class="w-100"
      pills
      card
      vertical
      v-model="tabIndex">
      <BTab
        v-for="(tab, index) in tabs"
        :key="tab.title"
        :title="tab.title"
        class="p-0"
        :data-testid="`tab-${tab}`">
        <template
          v-if="tab.component === 'FrComments'"
          #title>
          {{ tab.title }}
          <BBadge
            class="ml-3"
            pill
            :variant="tabIndex === index ? 'primary': 'secondary'">
            {{ commentsCount }}
          </BBadge>
        </template>
        <Component
          :is="tab.component"
          :item="item"
          v-on="$listeners"
        />
      </BTab>
    </BTabs>
  </div>
</template>

<script>

import {
  BBadge, BTabs, BTab,
} from 'bootstrap-vue';
import FrComments from './Comments';
import FrDetails from './Details';
import FrWorkflow from './Workflow';

export default {
  name: 'RequestModalDetailTabs',
  components: {
    BBadge,
    BTabs,
    BTab,
    FrComments,
    FrDetails,
    FrWorkflow,
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
          component: 'FrWorkflow',
          title: this.$t('governance.requestModal.workflow'),
        },
        {
          component: 'FrComments',
          title: this.$t('common.comments'),
        },
      ],
      tabIndex: 0,
      commentsCount: this.item.rawData.decision.comments.length,
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
