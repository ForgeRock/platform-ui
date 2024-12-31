<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrRequestItemsList
      class="border-top border-bottom"
      data-testid="initial-items-list"
      :context="context"
      :fr-hover="frHover"
      :list-name="groupName"
      :request-items="initialRequestItems"
      :show-delete-button="showDeleteButton"
      :show-empty-state="showEmptyState"
      v-on="$listeners" />
    <BCollapse :visible="viewMoreToggle">
      <FrRequestItemsList
        data-testid="view-more-items"
        :class="{ 'border-bottom': viewMoreRequestItems.length }"
        :context="context"
        :fr-hover="frHover"
        :list-name="`${groupName}, ${$t('governance.accessRequest.newRequest.moreItems')}`"
        :request-items="viewMoreRequestItems"
        :show-empty-state="false"
        v-on="$listeners" />
    </BCollapse>
    <BButton
      v-if="viewableItemsCount && viewMoreRequestItems.length"
      class="w-100 text-left pl-0 pb-0"
      variant="link"
      data-testid="view-more-button"
      @click="viewMoreToggle = !viewMoreToggle">
      {{ viewMoreText }}
    </BButton>
  </div>
</template>

<script>
import { BButton, BCollapse } from 'bootstrap-vue';
import FrRequestItemsList from '../RequestItemsList';

/**
 * Lists out the selected access request items
 */
export default {
  name: 'RequestItemsGroup',
  components: {
    BButton,
    BCollapse,
    FrRequestItemsList,
  },
  props: {
    context: {
      type: String,
      default: 'user',
      validator(value) {
        return ['user', 'accessItem'].includes(value);
      },
    },
    frHover: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      default: undefined,
    },
    requestItems: {
      type: Array,
      default: () => [],
    },
    showEmptyState: {
      type: Boolean,
      default: true,
    },
    viewableItemsCount: {
      type: [Number || Boolean],
      default: 3,
    },
  },
  data() {
    return {
      defaultViewableItems: 3,
      viewMoreToggle: false,
    };
  },
  computed: {
    initialItemsCount() {
      return this.viewableItemsCount === true
        ? this.defaultViewableItems
        : this.viewableItemsCount;
    },
    initialRequestItems() {
      return this.initialItemsCount < this.requestItems.length
        ? this.requestItems.filter((item, index) => index < this.initialItemsCount)
        : this.requestItems;
    },
    listItems() {
      return this.viewableItemsCount
        ? this.initialRequestItems
        : this.requestItems;
    },
    showDeleteButton() {
      return this.context === 'accessItem' || (this.context === 'user' && this.initialRequestItems.length > 1);
    },
    viewMoreRequestItems() {
      return this.requestItems.filter((item, index) => index > this.initialItemsCount - 1);
    },
    viewMoreText() {
      return this.viewMoreToggle ? this.$t('common.viewLess') : this.$t('common.viewMore', { count: this.viewMoreRequestItems.length });
    },
  },
};
</script>
