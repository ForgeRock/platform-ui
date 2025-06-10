<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BButton
    v-if="mainContentId"
    variant="link"
    id="header-skip-link"
    :class="computedClasses"
    @click="onClickSkipToMainContent"
    data-testid="link-skip-to-main-content">
    {{ $t('common.skipToMainContent') }}
  </BButton>
</template>

<script setup>
import { BButton } from 'bootstrap-vue';
import { computed } from 'vue';

/**
 * We will use a button instead of a link due to the reload/refresh behavior the href brings which could go agains the intended accessibility
 * Therefore the button provides a skip which moves the focus to the element with the given id `mainContentId`
 */

const props = defineProps({
  // The id of the main content that you want to skip to
  mainContentId: {
    type: String,
    required: true,
  },
  // Type of the skip link, either 'popover' or 'default'
  type: {
    type: String,
    default: '',
    required: false,
  },
});

const computedClasses = computed(() => {
  switch (props.type) {
    case 'popover':
      return 'skip-to-content-popover';
    default:
      return 'sr-only sr-only-focusable';
  }
});

const onClickSkipToMainContent = () => {
  const mainElement = document.getElementById(props.mainContentId);
  if (mainElement) mainElement.focus();
};
</script>

<style lang="scss" scoped>
.skip-to-content-popover {
  background: $black;
  color: $white !important;
  position: fixed;
  left: 1rem;
  top: 1rem;
  padding: .5rem 1rem;
  z-index: 9999;
  border-radius: 4px;
  font-weight: 400;
  box-shadow: 0 1px 3px rgba(0, 0, 0, .13);
  transform: translateY(-10px);
  opacity: 0;
  pointer-events: none;
  text-decoration: none !important;

  &:focus {
    pointer-events: auto;
    animation: slide-fade-in .3s ease forwards;
  }
}

@keyframes slide-fade-in {
  100% {
    transform: translateY(0px);
    opacity: 1;
  }
}
</style>
