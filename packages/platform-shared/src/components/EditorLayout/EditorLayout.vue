<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex flex-column w-100 h-100">
    <FrNavbar>
      <template #center-content>
        <slot name="navbar-center-content" />
      </template>
      <template #right-content>
        <slot name="navbar-right-content" />
      </template>
    </FrNavbar>
    <div class="fr-editor-container d-flex w-100">
      <FrEditorLayoutSidebar
        v-if="!sidebarLeftCustom"
        :open="isSidebarLeftOpen"
        :title="sidebarLeftTitle"
        :close-button-tooltip="sidebarLeftCloseButtonTooltip"
        @toggle-sidebar="toggleSidebarLeft">
        <slot name="sidebar-left" />
      </FrEditorLayoutSidebar>
      <slot
        v-else
        name="sidebar-left"
        :is-sidebar-left-open="isSidebarLeftOpen"
        :toggle-sidebar-left="toggleSidebarLeft" />
      <div class="d-flex flex-column h-100 flex-fill">
        <FrEditorLayoutToolbar
          :sidebar-left-open="isSidebarLeftOpen"
          :sidebar-left-open-button-text="sidebarLeftOpenButtonText"
          :sidebar-left-open-button-tooltip="sidebarLeftOpenButtonTooltip"
          @toggle-sidebar-left="toggleSidebarLeft">
          <slot name="toolbar" />
        </FrEditorLayoutToolbar>
        <div class="d-flex flex-fill overflow-hidden">
          <div class="flex-fill overflow-auto">
            <slot name="canvas" />
          </div>
          <FrEditorLayoutSidebar
            resizable
            :open="isSidebarRightOpen"
            :title="sidebarRightTitle"
            :close-button-tooltip="sidebarRightCloseButtonTooltip"
            :width="EDITOR_LAYOUT_SIDEBAR_DEFAULT_MIN_WIDTH"
            :position="EDITOR_LAYOUT_SIDEBAR_POSITION.RIGHT"
            @toggle-sidebar="toggleSidebarRight">
            <slot name="sidebar-right" />
          </FrEditorLayoutSidebar>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import FrNavbar from '@forgerock/platform-shared/src/components/Navbar';
import { ref, watch } from 'vue';
import FrEditorLayoutSidebar from './EditorLayoutSidebar';
import FrEditorLayoutToolbar from './EditorLayoutToolbar';
import { EDITOR_LAYOUT_SIDEBAR_DEFAULT_MIN_WIDTH, EDITOR_LAYOUT_SIDEBAR_POSITION } from './Utils/constants';
import i18n from '@/i18n';

/**
 * component to manage the layout of the editor pages, like forms editor, journeys, workflows
 */

const props = defineProps({
  sidebarRightOpen: {
    type: Boolean,
    default: false,
  },
  sidebarLeftOpen: {
    type: Boolean,
    default: true,
  },
  sidebarLeftCustom: {
    type: Boolean,
    default: false,
  },
  sidebarLeftTitle: {
    type: String,
    default: '',
  },
  sidebarRightTitle: {
    type: String,
    default: '',
  },
  sidebarLeftCloseButtonTooltip: {
    type: String,
    default: i18n.global.t('common.close'),
  },
  sidebarRightCloseButtonTooltip: {
    type: String,
    default: i18n.global.t('common.close'),
  },
  sidebarLeftOpenButtonText: {
    type: String,
    default: '',
  },
  sidebarLeftOpenButtonTooltip: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['toggle-sidebar-right']);

const isSidebarLeftOpen = ref(props.sidebarLeftOpen);
const isSidebarRightOpen = ref(props.sidebarRightOpen);

watch(() => props.sidebarLeftOpen, (newVal) => {
  isSidebarLeftOpen.value = newVal;
});

watch(() => props.sidebarRightOpen, (newVal) => {
  isSidebarRightOpen.value = newVal;
});

function toggleSidebarLeft() {
  isSidebarLeftOpen.value = !isSidebarLeftOpen.value;
}

function toggleSidebarRight() {
  isSidebarRightOpen.value = !isSidebarRightOpen.value;
  emit('toggle-sidebar-right', isSidebarRightOpen.value);
}
</script>

<style lang="scss" scoped>
.fr-editor-container {
  height: calc(100vh - 72px) !important;
}
</style>
