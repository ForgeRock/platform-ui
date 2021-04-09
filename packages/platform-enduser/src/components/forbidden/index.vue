<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<!--AVAILABLE SLOTS: center-card-header, center-card-body, center-card-footer-->
<template>
  <BContainer>
    <div style="margin-top: 40%;">
      <Forbidden :show-dashboard="false" />
    </div>
  </BContainer>
</template>
<script>
/**
 * @description Card container that will stay horizontally and vertically center on the screen (example can be found on the default login page)
 *
 * */
import Forbidden from '@forgerock/platform-shared/src/views/Forbidden';

export default {
  name: 'ForbiddenWrapper',
  components: {
    Forbidden,
  },
  props: {
    showLogo: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
