<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="h-100 d-flex w-100">
    <div class="w-100 bg-white">
      <FrNavbar
        hide-dropdown
        hide-toggle
        :show-help-link="false"
        :show-docs-link="false"
        :show-profile-link="false">
        <template #right-content>
          <BButton
            id="expandRequestCart"
            variant="none"
            class="ml-auto d-lg-none"
            aria-controls="expandableRequestCart"
            :aria-expanded="requestCartExpanded"
            :aria-label="$t('governance.accessRequests.newRequest.expandRequestCart')"
            @click="toggleRequestCartPanel">
            <FrIcon
              class="md-24"
              name="shopping_cart" />
          </BButton>
        </template>
      </FrNavbar>
      <div
        id="contentWrapper"
        class="w-100 cart-open-lg"
        :class="{ 'cart-open': requestCartExpanded }">
        <div class="overflow-auto h-100">
          Access Catalog Here
        </div>
        <div class="w-100 h-100 fixed-top fr-sidebar-shim d-lg-none" />
        <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
        <transition name="slide-fade">
          <div
            id="expandableRequestCart"
            v-if="requestCartExpanded"
            class="fr-cart-panel position-fixed shadow-lg h-100 pb-4">
            Request panel
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { BButton } from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNavbar from '@forgerock/platform-shared/src/components/Navbar';
import BreadcrumbMixin from '@forgerock/platform-shared/src/mixins/BreadcrumbMixin';
import MediaMixin from '@forgerock/platform-shared/src/mixins/MediaMixin';

/**
 * View housing new access request catalog and request cart panel
 */
export default {
  name: 'NewRequest',
  components: {
    BButton,
    FrIcon,
    FrNavbar,
  },
  mixins: [
    BreadcrumbMixin,
    MediaMixin,
  ],
  data() {
    return {
      requestCartExpanded: false,
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.setBreadcrumb('/my-requests', this.$t('governance.accessRequests.myRequests.title'));
  },
  methods: {
    /**
     * Ensures access request cart is always expanded when screen resolution is above 992px
     */
    handleResize() {
      this.requestCartExpanded = !this.media('lt-lg').matches;
    },
    /**
     * Expands or collapses request cart side panel (only available if resolution is below 992px)
     */
    toggleRequestCartPanel() {
      this.requestCartExpanded = !this.requestCartExpanded;
    },
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
};
</script>

<style lang="scss" scoped>
#contentWrapper {
  padding-right: 0;
  height: calc(100vh - 72px);
  &.cart-open {
    .fr-sidebar-shim {
      display: block;
      z-index: 2;
    }

    .fr-cart-panel {
      margin-right: 0;
      z-index: 3;
    }
  }

  @media (min-width: 992px) {
    &.cart-open-lg {
      padding-right: 320px;
      .fr-cart-panel {
        margin-right: 0;
        z-index: 3;
      }
    }
  }

  .fr-sidebar-shim {
    display: none;
    background-color: $black;
    opacity: 0.2;
  }

  .fr-cart-panel {
    right: 0;
    width: 320px;
    background-color: $white;
    top: 0;
    margin-top: 72px;
    margin-right: -320px;

    &.slide-fade-enter-active {
      transition: all .3s ease;
    }
    &.slide-fade-leave-active {
      transition: all .2s ease;
    }
    &.slide-fade-enter, .slide-fade-leave-to {
      transform: translateX(10px);
      opacity: 0;
    }
  }
}
</style>
