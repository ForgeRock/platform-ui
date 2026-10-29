<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex align-items-center">
    <div
      v-for="category in categories"
      :key="`${scopeId}-${category}`"
      class="cursor-default mr-3">
      <FrScopePermissionIcon
        :category="category"
        :id-prefix="idPrefix + scopeId"
        :aria-describedby="`${idPrefix}${scopeId}${category}-sr-description`" />
      <span
        :id="`${idPrefix}${scopeId}${category}-sr-description`"
        class="sr-only"
        :hidden="tooltipVisible[category]">
        {{ srText(category) }}
      </span>
      <BTooltip
        :target="`${idPrefix}${scopeId}${category}`"
        triggers="focus hover"
        placement="top"
        @show="tooltipVisible[category] = true"
        @hide="tooltipVisible[category] = false">
        <div class="text-left">
          <strong>{{ $t(`governance.accessAnalysis.scopes.categories.${category}`) }}</strong>
          <div
            v-for="permissionKey in getScopePermissionKeys(scope, category)"
            :key="permissionKey">
            {{ $t(`governance.accessAnalysis.scopes.permissionLabels.${permissionKey}`) }}
          </div>
        </div>
      </BTooltip>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { BTooltip } from 'bootstrap-vue';
import {
  getScopePermissionCategories,
  getScopePermissionKeys,
} from '@forgerock/platform-shared/src/utils/governance/scopePermissions';
import i18n from '@/i18n';
import FrScopePermissionIcon from './ScopePermissionIcon';

const props = defineProps({
  /**
   * Raw scope resource; null/undefined renders nothing (non-scope result rows)
   */
  scope: {
    type: Object,
    default: null,
  },
  /**
   * Unique prefix for this table's icon ids (tooltip targets must not collide across tables)
   */
  idPrefix: {
    type: String,
    required: true,
  },
});

const categories = computed(() => getScopePermissionCategories(props.scope));
const scopeId = computed(() => props.scope?.id || '');

// Per-category sr-only description visibility, swapped on the tooltip's show/hide
// events (not shown/hidden) so the swap is independent of the fade animation —
// prevents the permission list being announced twice per focus (BadgeWithTooltip pattern).
const tooltipVisible = reactive({});

/**
 * Build the screen-reader description for a category: its name followed by the
 * permissions the scope grants within it.
 * @param {String} category one of SCOPE_PERMISSION_CATEGORIES
 * @returns {String} e.g. "Roles: View Roles, Create Roles"
 */
function srText(category) {
  const labels = getScopePermissionKeys(props.scope, category)
    .map((key) => i18n.global.t(`governance.accessAnalysis.scopes.permissionLabels.${key}`));
  return `${i18n.global.t(`governance.accessAnalysis.scopes.categories.${category}`)}: ${labels.join(', ')}`;
}
</script>
