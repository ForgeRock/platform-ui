<!-- Copyright (c) 2021-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard>
    <div class="d-flex align-items-center justify-content-start pb-2">
      <h2 class="h5 mb-0">
        {{ title }}
      </h2>
      <div
        v-if="tooltip"
        :id="`link-button-${tooltipId}`"
        class="tooltip-button"
        tabindex="0">
        <FrIcon
          icon-class="ml-1 mt-1"
          name="info" />
      </div>
    </div>
    <FrSpinner
      v-if="loading"
      class="fr-spinner"
      size="md" />
    <div v-if="!loading">
      <Transition
        appear
        name="fade">
        <p
          :data-testid="`counter-${counterId}`"
          class="h1 mb-0">
          {{ countFormatted }}
        </p>
      </Transition>
      <BTooltip
        v-if="tooltip"
        no-fade
        placement="top"
        :target="`link-button-${tooltipId}`">
        {{ tooltip }}
      </BTooltip>
      <RouterLink
        v-if="linkPath"
        :to="linkPath">
        {{ linkText }}
      </RouterLink>
    </div>
  </BCard>
</template>

<script>
import {
  BCard,
  BTooltip,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import i18n from '@/i18n';

/**
 * Card container that contains a title and a number count of results with tooltip
 */
export default {
  name: 'CountCard',
  components: {
    BCard,
    BTooltip,
    FrIcon,
    FrSpinner,
  },
  computed: {
    countFormatted() {
      return parseInt(this.count, 10).toLocaleString(i18n.global.locale);
    },
    tooltipId() {
      return this.title.replace(/\W/g, '_');
    },
    counterId() {
      return this.title.replace(/\W/g, '_').toLowerCase();
    },
  },
  props: {
    /**
     * Number to be shown as a count
     */
    count: {
      required: true,
      type: Number,
    },
    /**
     * Route message
     */
    linkText: {
      default: '',
      type: String,
    },
    /**
     * Route to redirect
     */
    linkPath: {
      default: '',
      type: String,
    },
    loading: {
      default: false,
      type: Boolean,
    },
    /**
     * String to be used as tooltip  content
     */
    tooltip: {
      required: false,
      type: String,
      default: '',
    },
    /**
     * String to be used as main title of card
     */
    title: {
      required: true,
      type: String,
    },
  },
};
</script>
<style lang="scss" scoped>
  .card-body {
    min-height: 87px;
  }

  .fr-spinner {
    display: inline;
  }

  .tooltip-button {
    color: $gray-800;
    cursor: default;
  }

  .b-tooltip:not([style*='transform']) {
    top: 0;
  }
</style>
