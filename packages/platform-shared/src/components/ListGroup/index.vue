<!-- Copyright (c) 2019-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    no-body
    :class="{'mb-3': !noMargin}">
    <!-- @slot Header containing title and subtitle -->
    <slot name="list-group-header">
      <BCardBody
        v-if="title || subtitle"
        class="py-4 list-group-header-card">
        <h5 :class="[{ 'mb-4': subtitle, 'mb-0': !subtitle}, 'card-title']">
          {{ title }}
        </h5>
        <h6
          v-if="subtitle"
          class="card-subtitle mb-0 text-muted">
          {{ subtitle }}
        </h6>
      </BCardBody>
    </slot>
    <BListGroup flush>
      <!-- @slot List items -->
      <slot />
    </BListGroup>
  </BCard>
</template>

<script>
import {
  BCard,
  BCardBody,
  BListGroup,
} from 'bootstrap-vue';
/**
 * Container for holding ListItem.vue, together both components can be used to display a list of items with varying degrees of customization
 * */
export default {
  name: 'ListGroup',
  components: {
    BCard,
    BCardBody,
    BListGroup,
  },
  props: {
    /**
     * Title for list
     */
    title: {
      default: '',
      type: String,
    },
    /**
     * Subtitle for list
     */
    subtitle: {
      default: '',
      type: String,
    },
    /**
     * Whether the list should include a margin on it's top level card element
     */
    noMargin: {
      default: null,
      type: Boolean,
    },
  },
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
  .card {
    text-align: left;
    background-color: inherit;
    border: none;
    box-shadow: none;
  }
</style>
