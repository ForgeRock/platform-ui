<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <a
      v-if="mainContentId"
      id="header-skip-link"
      class="sr-only sr-only-focusable"
      :href="skipContentDestination"
      data-testid="link-skip-to-main-content">
      {{ $t('login.header.skipToMainContent') }}
    </a>
    <header
      v-html="customHtml"
      id="appHeader" />
  </div>
</template>

<script>
/**
 * It is good practise to add skip links to headers so that those using assistive technologies can navigate to the main content.
 * See: https://www.w3schools.com/accessibility/accessibility_skip_links.php
 * This header provides that skip link which moves the focus to the element with the given id `mainContentId`
 */
export default {
  name: 'AccessibleHeader',
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
      return this.mainContentId.startsWith('#') ? this.mainContentId : `#${this.mainContentId}`;
    },
  },
};
</script>
