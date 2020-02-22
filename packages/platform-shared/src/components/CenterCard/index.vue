<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<!--AVAILABLE SLOTS: center-card-header, center-card-body, center-card-footer-->
<template>
  <div class="min-vh-100 h-100 justify-content-center align-items-sm-center d-flex">
    <BCard
      no-body
      class="fr-center-card flex-column justify-content-center"
      header-tag="header"
      footer-tag="footer">
      <BCardHeader
        v-if="!hideHeader"
        class="text-center border-0 pb-0">
        <BImg
          v-if="!hideLogo"
          class="fr-logo mb-3 mt-2"
          :src="logoPath"
          fluid
          :alt="$t('common.logo')" />
        <!-- @slot Text or HTML Elements the header will contain. -->
        <slot name="center-card-header" />
      </BCardHeader>
      <BCardBody>
        <!-- @slot Text or HTML Elements the body will contain -->
        <slot name="center-card-body" />
      </BCardBody>
      <BCardFooter v-if="!hideFooter">
        <!-- @slot Text or HTML Elements the footer will contain -->
        <slot name="center-card-footer" />
      </BCardFooter>
    </BCard>
  </div>
</template>

<script>
/* eslint import/no-extraneous-dependencies: 0 */
import {
  BCard,
  BCardBody,
  BCardHeader,
  BCardFooter,
  BImg,
} from 'bootstrap-vue';
import frVerticalLogo from '@forgerock/platform-shared/src/assets/images/vertical-logo.svg';

/**
 *  Card container that will stay horizontally and vertically center on the screen (example can be found on the default login page)
 * */
export default {
  name: 'CenterCard',
  components: {
    BCard,
    BCardBody,
    BCardFooter,
    BCardHeader,
    BImg,
  },
  props: {
    /**
     * Path to logo in header.
     */
    logoPath: {
      type: String,
      default: frVerticalLogo,
    },
    /**
     * Hide card footer.
     */
    hideFooter: {
      type: Boolean,
      default: false,
    },
    /**
     * Hide card header.
     */
    hideHeader: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether or not the header should show the ForgeRock logo
     */
    hideLogo: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
.fr-center-card {
  width: 100%;

  @include media-breakpoint-between(sm, xl) {
    max-width: 420px;
  }

  .card-header {
    padding: 40px 50px 0;
  }

  .card-body {
    @include media-breakpoint-down(xs) {
      flex: 0;
    }
  }
}
</style>
