<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VueDraggableResizable
    v-if="featureData.length > 0"
    :key="feature.id"
    class="m-2 position-relative"
    :enable-native-drag="false"
    :w="width"
    :h="height"
    :resizable="true"
    :parent="false">
    <BCard
      no-body
      class="p-1 h-100 overflow-auto">
      <FrTable
        small
        :items="data[page]"
        :fields="fields" />
      <!-- <FrPagination :currentPage="page" :lastPage="isLastPage" @pagination-change="pageChange" /> -->
    </BCard>
  </VueDraggableResizable>
</template>

<script>
import VueDraggableResizable from 'vue-draggable-resizable';
import { BCard } from 'bootstrap-vue';
import FrTable from '@forgerock/platform-shared/src/components/DataTable';
// import FrPagination from "@forgerock/platform-shared/src/components/DataTable/Pagination";
import 'vue-draggable-resizable/dist/VueDraggableResizable.css';
import _ from 'lodash';

export default {
  name: 'FeatureCard',
  components: {
    VueDraggableResizable,
    BCard,
    FrTable,
    // FrPagination,
  },
  props: {
    feature: {
      type: Object,
    },
    featureData: {
      type: Array,
    },
  },
  computed: {
    isLastPage() {
      if (7 * (this.page + 1) + 7 < this.totalRecords) {
        return false;
      }
      return true;
    },
  },
  data() {
    return {
      data: [],
      page: 0,
      height: 0,
      width: 0,
      totalRecords: 0,
      fields: [
        { key: 'key', label: this.feature.label },
        { key: 'doc_count', label: this.$t('access.identities.count') },
      ],
    };
  },
  watch: {
    featureData: {
      immediate: true,
      handler(newFeatureData) {
        if (newFeatureData && newFeatureData.length > 0) {
          this.totalRecords = newFeatureData.length;
          const chunks = _.chunk(newFeatureData, 7);

          this.data = chunks;

          this.height = chunks[0].length * 38 + 120;

          if (this.feature.label === 'referer') {
            this.width = 800;
            this.height = chunks[0].length * 38 + 220;
          } else {
            this.width = 400;
            this.height = chunks[0].length * 38 + 120;
          }
        }
      },
    },
  },
  methods: {
    pageChange(page) {
      this.page = page;
    },
  },
};
</script>

<style></style>
