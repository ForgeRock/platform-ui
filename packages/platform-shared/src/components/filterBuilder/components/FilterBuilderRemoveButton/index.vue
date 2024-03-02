<!-- Copyright (c) 2022-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BButton
    :aria-label="$t('queryFilterBuilder.queryFilterRemoveButton')"
    class="hover-gray"
    no-caret
    variant="link"
    :disabled="disabled"
    @click="$emit('click')">
    <FrIcon
      icon-class="text-dark md-24"
      name="remove" />
  </BButton>
</template>

<script>
import { BButton } from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

export default {
  name: 'RemoveButton',
  components: {
    BButton,
    FrIcon,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
