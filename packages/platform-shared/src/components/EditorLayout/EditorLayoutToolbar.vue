<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BButtonToolbar class="fr-toolbar w-100 shadow-sm border-0 px-4 py-3 d-flex align-items-center justify-content-end">
    <BButtonGroup
      v-if="!sidebarLeftOpen && sidebarLeftOpenButtonText"
      class="mx-1 pr-4 border-right-light">
      <BButton
        id="btnOpenSidebar"
        variant="outline-primary"
        :aria-label="sidebarLeftOpenButtonTooltip"
        @click="$emit('toggle-sidebar-left')">
        <FrIcon
          icon-class="md-24 mr-md-2"
          name="add">
          <span class="d-none d-md-inline-block">
            {{ sidebarLeftOpenButtonText }}
          </span>
        </FrIcon>
      </BButton>
      <BTooltip
        v-if="sidebarLeftOpenButtonTooltip"
        target="btnOpenSidebar"
        triggers="hover"
        placement="bottom">
        {{ sidebarLeftOpenButtonTooltip }}
      </BTooltip>
    </BButtonGroup>
    <slot />
  </BButtonToolbar>
</template>

<script setup>
import {
  BButtonGroup, BButtonToolbar, BButton, BTooltip,
} from 'bootstrap-vue';
import FrIcon from '../Icon';
import i18n from '@/i18n';

/**
 * Toolbar component for the editor layout
 */

defineProps({
  sidebarLeftOpenButtonTooltip: {
    type: String,
    default: i18n.global.t('sideMenu.toggleSidebar'),
  },
  sidebarLeftOpenButtonText: {
    type: String,
    default: i18n.global.t('sideMenu.toggleSidebar'),
  },
  sidebarLeftOpen: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['toggle-sidebar-left']);
</script>

<style lang="scss" scoped>
.fr-toolbar {
  background-color: $white;
  min-height: 83px;
  z-index: 10;
}
</style>
