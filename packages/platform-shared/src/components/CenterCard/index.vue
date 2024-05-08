<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<!--AVAILABLE SLOTS: center-card-header, center-card-body, center-card-footer-->
<template>
  <BContainer class="px-0 flex-grow-1 d-flex">
    <div class="fr-m-auto fr-center-card align-self-center">
      <BCard
        no-body
        class="border-xs-0 border-sm d-flex fr-stretch-card"
        header-tag="header"
        footer-tag="footer">
        <BCardHeader :class="headerClassList">
          <div class="d-flex flex-fill flex-column justify-content-center">
            <template v-if="logoEnabled">
              <div
                v-if="logoPath.length === 0"
                class="ping-logo ping-logo-square mb-3 mt-2"
                fluid
                :alt="$t('common.logo')" />
              <img
                v-else
                class="ping-logo mb-4 mt-2"
                :alt="logoAltText"
                :src="logoPath"
                :style="{ height: `${logoHeight}px`}">
            </template>
            <!-- @slot Content for card header -->
            <slot name="center-card-header" />
          </div>
        </BCardHeader>
        <!-- @slot Content for card body -->
        <slot name="center-card-body" />
        <!-- @slot Content for card footer -->
        <slot name="center-card-footer" />
      </BCard>
    </div>
  </BContainer>
</template>

<script>
import {
  BCardHeader,
  BContainer,
  BCard,
} from 'bootstrap-vue';

/**
 * Card container that will stay horizontally and vertically centered on the screen
 * (example can be found on the default login page)
 */
export default {
  name: 'CenterCard',
  components: {
    BCard,
    BCardHeader,
    BContainer,
  },
  props: {
    /**
     * List of classes to apply to the header of the card
     */
    headerClasses: {
      type: Array,
      default: () => [],
    },
    /**
     * Height of logo
     */
    logoHeight: {
      type: String,
      default: '72',
    },
    /**
     * Path to logo
     */
    logoPath: {
      type: String,
      default: '',
    },
    /**
     * Alt text for logo
     */
    logoAltText: {
      type: String,
      default: '',
    },
    /**
     * Whether we want to show a logo on the card
     */
    logoEnabled: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    headerClassList() {
      return ['d-flex', 'align-items-center', 'flex-fill', ...this.headerClasses];
    },
  },
};
</script>

<style lang="scss" scoped>
  // login/registration/password/username form and card
  .container-fluid {
    overflow: auto;
  }

  :deep(.fr-center-card) {
    width: 100%;
    text-align: center;

    @include media-breakpoint-between(sm, xl) {
      max-width: 480px;
      padding: 40px 0;
      margin: 0 auto;
    }

    .card {
      border: none;

      @include media-breakpoint-between(sm, xl) {
        margin: 0;
        border-radius: $border-radius;
      }
    }

    .card-header {
      border: none;
      padding: 40px 50px 0;

      .justify-content-center {
        flex-direction: column;

        .ping-logo {
          align-self: center;
          height: $fr-center-card-logo-height;
          max-width: 100%;
        }
      }
    }

    .card-body {
      padding: 20px 40px 40px;

      @include media-breakpoint-between(sm, xl) {
        padding: 20px 40px 40px;
      }
    }

    .card-footer {
      padding: 20px 50px;
    }

    .fr-footer-bottom {
      @media (max-width: 575px) {
        position: fixed;
        bottom: 0;
        width: 100%;
      }
    }
  }

  .fr-m-auto {
    @include media-breakpoint-between(sm, xl) {
      margin: auto;
    }

    @media (max-width: 575px) {
      height: 100%;
      margin: 0;
    }

    .fr-stretch-card {
      @media (max-width: 575px) {
        height: 100%;
      }
    }
  }
</style>
