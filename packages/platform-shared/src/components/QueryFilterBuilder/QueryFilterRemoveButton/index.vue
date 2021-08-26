<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BButton
    :aria-label="$t('queryFilterBuilder.queryFilterRemoveButton')"
    no-caret
    variant="outline-secondary"
    :disabled="disabled"
    @click="$emit('click')">
    <FrIcon
      :outline="true"
      name="remove"
    />
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
