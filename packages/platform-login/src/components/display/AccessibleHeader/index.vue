<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BButton
      v-if="mainContentId"
      variant="link"
      id="header-skip-link"
      class="sr-only sr-only-focusable"
      @click="skipContentDestination.focus()"
      data-testid="link-skip-to-main-content">
      {{ $t('login.header.skipToMainContent') }}
    </BButton>
    <header
      v-html="customHtml"
      id="appHeader" />
  </div>
</template>

<script>
import { BButton } from 'bootstrap-vue';
/**
 * We will use a button instead of a link due to the reload/refresh behavior the href brings which could go agains the intended accessibility
 * Therefore the button provides a skip which moves the focus to the element with the given id `mainContentId`
 */
export default {
  name: 'AccessibleHeader',
  components: {
    BButton,
  },
  props: {
    /**
     * The id of the main content that you want to skip to
    */
    mainContentId: {
      type: String,
      default: '',
      required: true,
    },
    /**
     * Custom html if user has specified a custom header in Hosted Pages
    */
    customHtml: {
      type: String,
      default: '',
      required: true,
    },
  },
  computed: {
    /**
     * Ensures the given skip link id starts with a hash
     */
    skipContentDestination() {
      return document.getElementById(this.mainContentId);
    },
  },
};
</script>
