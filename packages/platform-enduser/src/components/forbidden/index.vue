<!-- Copyright (c) 2021-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="page-height">
    <FrForbidden :show-dashboard="false" />
  </div>
</template>
<script>
/**
 * @description Card container that will stay horizontally and vertically center on the screen (example can be found on the default login page)
 *
 * */
import FrForbidden from '@forgerock/platform-shared/src/views/Forbidden';

export default {
  name: 'ForbiddenWrapper',
  components: {
    FrForbidden,
  },
  props: {
    showLogo: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
.page-height {
  height: calc(100vh - #{$fr-navbar-height + $fr-app-content-padding-bottom}); // Adjust height based on navbar and padding
  padding-top: $fr-app-content-padding-bottom; // To manage vertical centering
}
</style>
