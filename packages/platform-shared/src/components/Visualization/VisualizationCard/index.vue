<!-- Copyright (c) 2021-2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard no-body>
    <BCardBody ref="card-body">
      <BSkeletonWrapper :loading="loading">
        <template #loading>
          <BSkeleton
            class="mb-2"
            width="35%"
          />
          <BSkeleton
            v-if="count"
            class="mb-2"
            width="60%"
            height="45px"
            no-aspect
          />
          <BSkeletonImg width="100%" />
        </template>

        <template #default>
          <div :class="[{'mb-4': !count}, 'd-flex align-items-start justify-content-between' ]">
            <div class="d-flex align-items-center justify-content-start pb-2">
              <h5 class="mb-0">
                {{ title }}
              </h5>
              <div
                :id="`link-button-${tooltipId}`"
                class="tooltip-button"
                tabindex="0"
              >
                <FrIcon
                  class="ml-1 mt-1"
                  name="info"
                />
              </div>
            </div>
            <div>
              <slot name="menu" />
            </div>
          </div>
          <h1
            v-if="count"
            class="display-4 mb-3 h3">
            {{ localeCount }}
          </h1>
          <div>
            <Transition
              appear
              name="fade">
              <div>
                <slot name="legend" />
                <slot
                  name="chart"
                  :cardWidth="cardWidth" />
              </div>
            </Transition>
            <BTooltip
              no-fade
              placement="top"
              :target="`link-button-${tooltipId}`">
              {{ tooltip }}
            </BTooltip>
          </div>
        </template>
      </BSkeletonWrapper>
    </BCardBody>
  </BCard>
</template>

<script>
import {
  BCard,
  BCardBody,
  BSkeleton,
  BSkeletonImg,
  BSkeletonWrapper,
  BTooltip,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import i18n from '@/i18n';

/**
 *
 */
export default {
  name: 'VisualizationCard',
  components: {
    BCard,
    BCardBody,
    BSkeleton,
    BSkeletonImg,
    BSkeletonWrapper,
    BTooltip,
    FrIcon,
  },
  data() {
    return {
      cardWidth: 0,
    };
  },
  props: {
    /**
     * Show the large count header
     */
    count: {
      default: null,
      type: String,
    },
    /**
     * Show loading spinner or not
     */
    loading: {
      default: false,
      type: Boolean,
    },
    /**
     * String to be used as tooltip  content
     */
    tooltip: {
      required: true,
      type: String,
    },
    /**
     * String to be used as main title of card
     */
    title: {
      required: true,
      type: String,
    },
  },
  methods: {
    /**
      * Sets the cardWidth value based on responsive resizing
      */
    onResize() {
      const cardBodyCompStyle = getComputedStyle(this.$refs['card-body']);
      this.cardWidth = this.$refs['card-body'].offsetWidth - (parseInt(cardBodyCompStyle.paddingLeft, 10) * 2);
    },
  },
  computed: {
    /**
      * Sets localized string value of the total count
      *
      * @returns {number|string} localized string value of the total count
      */
    localeCount() {
      if (!this.count) {
        return 0;
      }
      return parseInt(this.count, 10).toLocaleString(i18n.locale);
    },
    /**
      * Returns cleaned up title string
      *
      * @returns {string} tooltip with removed whitespace characters
      */
    tooltipId() {
      return this.title.replace(/\W/g, '');
    },
  },
  mounted() {
    window.addEventListener('resize', this.onResize);
    this.onResize();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
};
</script>
<style lang="scss" scoped>
  .card-body {
    min-height: 87px;
  }

  .tooltip-button {
    color: $gray-800;
    cursor: default;
  }

  .b-tooltip:not([style*='transform']) {
    top: 0;
  }
</style>
>
