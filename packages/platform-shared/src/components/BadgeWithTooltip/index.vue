<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BBadge
    :id="badgeId"
    tabindex="0"
    :variant="variant"
    :aria-describedby="srDescription ? srDescriptionId : undefined">
    <slot />
    <span
      v-if="srDescription"
      :id="srDescriptionId"
      class="sr-only"
      :hidden="tooltipVisible">
      {{ tooltipText }}
    </span>
    <BTooltip
      :target="badgeId"
      triggers="hover focus"
      @show="tooltipVisible = true"
      @hide="tooltipVisible = false">
      {{ tooltipText }}
    </BTooltip>
  </BBadge>
</template>

<style lang="scss" scoped>
.badge:focus-visible {
  outline: 2px solid $outline-blue;
  outline-offset: -2px;
}
</style>

<script setup>
import { ref } from 'vue';
import { BBadge, BTooltip } from 'bootstrap-vue';
import { v4 as uuid } from 'uuid';

defineOptions({
  name: 'BadgeWithTooltip',
});

/**
 * Renders a BBadge paired with a BTooltip that is keyboard-focusable and
 * screen-reader accessible. Unlike the v-b-tooltip.hover directive, this
 * component's tooltip opens on both hover and keyboard focus, and
 * BootstrapVue automatically wires up aria-describedby between the badge
 * and the tooltip content once the tooltip is shown.
 *
 * Enable the `srDescription` prop on inline surfaces (a badge not nested
 * inside another control's label, e.g. on an application details page) to
 * also render the tooltip text in a visually-hidden span referenced by a
 * persistent aria-describedby, so screen readers announce it with the
 * badge alone: while browsing (no interaction needed) and on keyboard
 * focus, without the user having to discover a Space/VO+Space gesture.
 * The span sits inside the badge element but outside any accessible-name
 * context (srDescription is not for use inside another control's label).
 *
 * Exactly one description source is live at a time: while the tooltip is
 * shown (hover or focus) the hidden span is [hidden] (an aria-describedby
 * reference to [hidden] content is ignored by screen readers) and
 * BootstrapVue's tooltip node carries the same text. The toggle is bound
 * to the toolpop's show/hide events (start of show, start of hide) rather
 * than shown/hidden (transition completion), so the swap is independent of
 * the fade animation. This prevents the warning being announced twice per
 * focus.
 *
 * Do not enable `srDescription` inside CardRadioInput cards: the span
 * would render inside the option's <label> and be concatenated into the
 * radio's accessible name.
 *
 * The template has a single root element (BBadge), so fallthrough attributes
 * (class, tabindex, data-testid, aria-*, etc.) apply naturally to the badge
 * without needing a dedicated prop per attribute.
 *
 * The badge defaults to tabindex="0"; pass a tabindex attribute to override
 * it (e.g. "-1" to remove it from Tab order within a roving-tabindex group).
 */

defineProps({
  // Render the tooltip text as a visually-hidden description for screen
  // readers (see note above about CardRadioInput)
  srDescription: {
    type: Boolean,
    default: false,
  },
  // Tooltip content associated with the badge
  tooltipText: {
    type: String,
    required: true,
  },
  // Bootstrap variant applied to the badge
  variant: {
    type: String,
    required: true,
  },
});

const tooltipVisible = ref(false);
const srDescriptionId = `badge-with-tooltip-sr-description-${uuid()}`;
const badgeId = `badge-with-tooltip-${uuid()}`;
</script>
