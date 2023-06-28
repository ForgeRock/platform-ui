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
        {{ item }}
      </BTab>
    </BTabs>
  </div>
</template>

<script>

import {
  BTabs, BTab,
} from 'bootstrap-vue';

export default {
  name: 'RequestModalDetails',
  components: {
    BTabs, BTab,
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
        { title: this.$t('governance.requestModal.details') },
        { title: this.$t('governance.requestModal.workflow') },
        { title: this.$t('governance.requestModal.comments') },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
  ::v-deep .nav-pills {
    padding: 0px;
  }

  .card-tabs-vertical ::v-deep .nav {
    margin-left: -1px;
  }
</style>
