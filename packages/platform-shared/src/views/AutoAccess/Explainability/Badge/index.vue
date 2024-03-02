<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BBadge variant="light">
    <span class="text-danger">
      <FrIcon
        icon-class="mr-2"
        name="check" />
    </span>
    <span class="badgeTitle">
      {{ $t(`autoAccess.access.reasons["${title}"]`) }}
    </span>
  </BBadge>
</template>
<script>
import { BBadge } from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

export default {
  name: 'ExplainabilityBadge',
  components: {
    BBadge,
    FrIcon,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
  },
};
</script>
<style lang="scss" scoped>
.badge {
  background: transparent;
  border: solid $gray-300 1px;
  padding-bottom: 0.1em;
  padding-top: 0.1em;
}
.event-item {
  border-radius: 0;
  margin-bottom: 0;

  &:hover {
    background: $gray-100;
  }

}
</style>
