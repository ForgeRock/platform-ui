<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    ref="itemsContainer"
    @scroll="lazyLoadItems">
    <BListGroup flush>
      <BListGroupItem
        v-for="(item, itemIndex) in listItems"
        class="p-0 border-none"
        :key="`${item._id}_${itemIndex}`">
        <slot
          name="list-item"
          :item="item"
          :item-index="itemIndex" />
      </BListGroupItem>
      <BListGroupItem
        v-if="loading"
        class="d-flex justify-content-center p-0 border-none bg-transparent">
        <FrSpinner
          button-spinner
          size="sm" />
      </BListGroupItem>
    </BListGroup>
  </div>
</template>

<script>
import { BListGroup, BListGroupItem } from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';

/**
 * List which displays provided items and emits request for more items
 * as user scrolls to the bottom
 */
export default {
  name: 'LazyLoadList',
  components: {
    BListGroup,
    BListGroupItem,
    FrSpinner,
  },
  props: {
    additionalItemsAvailable: {
      default: false,
      type: Boolean,
    },
    listItems: {
      default: () => [],
      type: Array,
    },
  },
  data() {
    return {
      loading: false,
    };
  },
  mounted() {
    // Calling lazyLoadItems immediately ensures that taller resolutions do not start with too few
    // items, thus not filling the container
    this.lazyLoadItems();
  },
  methods: {
    /**
     * Calculates the next offset based on the current page and page size, and fetches the
     * next set of items using the new offset
     */
    lazyLoadItems() {
      const container = this.$refs.itemsContainer;
      const threshold = 50;
      const { scrollHeight, scrollTop, clientHeight } = container;

      if (!this.loading && this.additionalItemsAvailable && (scrollHeight === clientHeight || (scrollHeight - (scrollTop + clientHeight) < threshold))) {
        this.loading = true;
        this.$emit('query-additional-items');
      }
    },
  },
  watch: {
    listItems: {
      deep: true,
      handler() {
        this.loading = false;
        this.$nextTick().then(this.lazyLoadItems);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.bg-transparent {
  background-color: transparent;
}
</style>
