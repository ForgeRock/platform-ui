<!-- Copyright (c) 2021-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer>
    <div style="margin-top: 40%;">
      <FrForbidden
        :show-dashboard="false"
        :show-logout="false" />
    </div>
  </BContainer>
</template>

<script>
/**
 * @description Card container that will stay horizontally and vertically center on the screen (example can be found on the default login page)
 */
import { BContainer } from 'bootstrap-vue';
import FrForbidden from '@forgerock/platform-shared/src/views/Forbidden';

export default {
  name: 'ForbiddenWrapper',
  components: {
    BContainer,
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
