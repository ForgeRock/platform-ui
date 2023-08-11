<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    class="h-100 d-flex"
    fluid>
    <div
      style="width: 550px;"
      class="m-auto align-self-center text-center">
      <FrSpinner class="py-5" />
      <p class="lead text-center font-weight-light text-muted mb-5">
        {{ $t("pages.loggingOut.message") }}
      </p>
    </div>
  </BContainer>
</template>

<script>

import {
  BContainer,
} from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';

/**
 * @description The default logout screen
 */
export default {
  name: 'LogoutScreen',
  components: {
    BContainer,
    FrSpinner,
  },
};
</script>
