<!-- Copyright (c) 2021-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex justify-content-center align-items-center vh-100">
    <FrForbidden
      :show-dashboard="false"
      :show-logout="false" />
  </div>
</template>

<script>
/**
 * @description Card container that will stay horizontally and vertically center on the screen (example can be found on the default login page)
 */
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
