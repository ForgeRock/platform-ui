<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<!-- AVAILABLE SLOTS: center-card-header, center-card-body, center-card-footer -->
<template>
  <BContainer
    fluid
    class="px-0 h-100 d-flex">
    <div class="fr-m-auto fr-center-card align-self-center">
      <BCard
        no-body
        class="border-xs-0 border-sm d-flex fr-stretch-card"
        header-tag="header"
        footer-tag="footer">
        <BCardHeader class="d-flex align-items-center flex-fill">
          <div class="d-flex flex-fill flex-column justify-content-center">
            <div
              v-if="logoPath.length === 0"
              class="fr-logo fr-logo-vertical mb-3 mt-2"
              :alt="$t('centerCard.logoAltText')" />
            <img
              v-else
              class="fr-logo mb-3 mt-2"
              :alt="logoAltText"
              :src="logoPath">
            <slot name="center-card-header" />
          </div>
        </BCardHeader>
        <slot name="center-card-body" />
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
 * @description Card container that will stay horizontally and vertically center on the screen (example can be found on the default login page)
 *
 * */
export default {
  name: 'CenterCard',
  components: {
    BCard,
    BCardHeader,
    BContainer,
  },
  data: () => ({
    publicPath: process.env.BASE_URL,
  }),
  props: {
    showLogo: {
      type: Boolean,
      default: false,
    },
    logoPath: {
      type: String,
      default: '',
    },
    logoAltText: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
  // login/registration/password/username form and card

  .container-fluid {
    overflow: auto;
  }

  .fr-center-card {
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

        .fr-logo {
          align-self: center;
          height: $fr-center-card-logo-height;
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
