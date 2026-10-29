<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    :id="iconId"
    :aria-label="$t(`governance.accessAnalysis.scopes.categories.${category}`)"
    :data-testid="`scope-permission-icon-${category}`"
    :class="[
      `fr-scope-permission-icon rounded-circle d-flex align-items-center justify-content-center color-dark${scopePermissionCategoryColors[category]} bg-light${scopePermissionCategoryColors[category]}`,
    ]"
    role="img"
    tabindex="0">
    <FrIcon
      icon-class="fr-scope-permission-icon__glyph"
      :name="scopePermissionCategoryIcons[category]" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import {
  scopePermissionCategoryColors,
  scopePermissionCategoryIcons,
} from '@forgerock/platform-shared/src/utils/governance/scopePermissions';

const props = defineProps({
  /**
   * One of SCOPE_PERMISSION_CATEGORIES
   */
  category: {
    type: String,
    required: true,
  },
  /**
   * Unique id prefix (tooltip targets must not collide across tables/rows)
   */
  idPrefix: {
    type: String,
    required: true,
  },
});

const iconId = computed(() => `${props.idPrefix}${props.category}`);
</script>

<style lang="scss" scoped>
.fr-scope-permission-icon {
  width: 28px;
  height: 28px;
}

// Match the form editor's icon glyph size inside its circles (EditorItem.vue)
.fr-scope-permission-icon .fr-scope-permission-icon__glyph {
  font-size: 25px;
  line-height: 25px;
}
</style>
