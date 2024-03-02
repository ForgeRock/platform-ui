<!-- Copyright (c) 2021-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard no-body>
    <BCardBody
      ref="cardBody"
      class="d-flex flex-column">
      <BSkeletonWrapper
        class="flex-grow-1"
        :loading="loading">
        <template #loading>
          <BSkeletonImg
            height="100%"
            width="100%"
            no-aspect />
        </template>

        <template #default>
          <div
            class="cardHeader"
            ref="cardHeader">
            <!-- <div -->
            <!--   :class="[{'mb-4': !count}, 'd-flex justify-content-between']" -->
            <!--   ref="cardTitle" -->
            <!-- > -->
            <div
              :class="[{'mb-4': !count}, 'position-relative']"
              ref="cardTitle">
              <div
                class="d-flex align-items-center justify-content-start"
                v-if="title.length">
                <h5 class="mb-0">
                  {{ title }}
                </h5>
                <div
                  v-if="tooltip.length"
                  :id="`link-button-${tooltipId}`"
                  class="tooltip-button"
                  tabindex="0">
                  <FrIcon
                    icon-class="ml-1 mt-1"
                    name="info" />
                </div>
              </div>

              <!--MENU SLOT -->
              <div
                ref="menu"
                class="menu">
                <slot name="menu" />
              </div>
            </div>

            <!--COUNT -->
            <div
              :class="[{'mb-3': count}]"
              ref="count">
              <h2
                v-if="count && !error"
                class="display-4h3">
                {{ localeCount }}
              </h2>
            </div>

            <!--LEGEND SLOT -->
            <slot name="legend" />
          </div>
          <Transition
            appear
            name="fade">
            <div
              class="d-flex flex-column flex-grow-1"
              style="position: relative;">
              <slot
                v-if="!error"
                name="chart"
                :svg-width="svgWidth"
                :svg-height="svgHeight" />
              <div
                v-if="error"
                class="d-flex flex-grow-1 align-items-center text-center">
                <div class="flex-grow-1">
                  <FrIcon
                    icon-class="error-icon text-danger"
                    name="error_outline" />
                  <div class="mt-3">
                    Failed to load data
                  </div>
                </div>
              </div>
            </div>
          </Transition>
          <BTooltip
            no-fade
            placement="top"
            v-if="tooltip.length"
            :target="`link-button-${tooltipId}`">
            {{ tooltip }}
          </BTooltip>
        </template>
      </BSkeletonWrapper>
    </BCardBody>
  </BCard>
</template>

<script>
import {
  BCard,
  BCardBody,
  BSkeletonImg,
  BSkeletonWrapper,
  BTooltip,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import i18n from '@/i18n';

export default {
  name: 'VisualizationCard',
  components: {
    BCard,
    BCardBody,
    BSkeletonImg,
    BSkeletonWrapper,
    BTooltip,
    FrIcon,
  },
  data() {
    return {
      svgWidth: 100,
      svgHeight: 100,
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
    error: {
      default: false,
      type: Boolean,
    },
    /**
     * Show loading skeleton or not
     */
    loading: {
      default: false,
      type: Boolean,
    },
    /**
     * String to be used as tooltip  content
     * @type {boolean}
     */
    tooltip: {
      default: '',
      type: String,
    },
    /**
     * String to be used as main title of card
     */
    title: {
      default: '',
      type: String,
    },
  },
  methods: {
    /**
      * Sets the svgWidth value based on responsive resizing
      */
    onResize() {
      const cardBodyPaddingTop = parseInt(getComputedStyle(this.$refs.cardBody).paddingTop, 10);
      this.svgWidth = this.$refs.cardHeader.offsetWidth;
      this.svgHeight = this.$refs.cardBody.offsetHeight - (cardBodyPaddingTop * 2) - this.$refs.cardHeader?.offsetHeight;
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
      return parseInt(this.count, 10).toLocaleString(i18n.global.locale);
    },
    /**
      * Returns cleaned up title string
      *
      * @returns {string} tooltip with removed whitespace characters
      */
    tooltipId() {
      return this.title.replace(/\W/g, '') || '';
    },
    isEmpty() {
      return this.title === '' && this.tooltip === '';
    },
  },
  mounted() {
    window.addEventListener('resize', this.onResize);
    const observer = new MutationObserver((() => {
      if (document.contains(this.$refs.cardHeader)) {
        this.onResize();
        observer.disconnect();
      }
    }));
    observer.observe(document, {
      attributes: false, childList: true, characterData: false, subtree: true,
    });
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize);
  },
};
</script>
<style lang="scss" scoped>
.card {
  min-width: 300px;
}

.card-title {
  height: 55px;
}

.card-title-secondary {
  height: 100px;
}

.error-icon {
  font-size: 3rem;
}

.tooltip-button {
  color: $gray-800;
  cursor: default;
}

.b-tooltip:not([style*='transform']) {
  top: 0;
}
</style>
