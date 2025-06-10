<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrSkipToMainContent
      v-if="isAccessible"
      :main-content-id="mainContentId" />
    <header
      v-html="customHtml"
      id="appHeader" />
  </div>
</template>

<script>
import FrSkipToMainContent from '@forgerock/platform-shared/src/components/SkipToMainContent';

export default {
  name: 'LoginHeader',
  components: {
    FrSkipToMainContent,
  },
  props: {
    // The id of the main content that you want to skip to
    mainContentId: {
      type: String,
      default: '',
      required: false,
    },
    // Custom html if user has specified a custom header in Hosted Pages
    customHtml: {
      type: String,
      default: '',
      required: true,
    },
    // Flag to display skip to main content accessible link
    isAccessible: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
};
</script>
