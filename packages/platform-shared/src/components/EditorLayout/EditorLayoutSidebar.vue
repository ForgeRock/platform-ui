<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VueDraggableResizable
    class="fr-panel position-relative h-100"
    class-name-handle="fr-handle"
    prevent-deactivation
    :class="{ open }"
    :draggable="false"
    :handles="handles"
    :max-width="maxWidth"
    :min-width="minWidth"
    :w="calculatedWidth"
    :active="open"
    :resizable="resizable"
    @resizing="onResize">
    <BCard
      class="w-100 h-100 p-0 rounded-0 overflow-auto"
      no-body>
      <div class="d-flex px-4 w-100 align-items-center justify-content-between">
        <div
          v-if="title"
          class="d-flex py-3 align-items-center">
          <h2 class="h5 mb-0 py-3">
            {{ title }}
          </h2>
        </div>
        <div class="d-flex border-0 px-0 py-3 align-items-center">
          <BButtonClose
            class="text-dark"
            variant="none"
            :id="`btnClose-${closeButtonId}`"
            :aria-label="closeButtonTooltip"
            @click="$emit('toggle-sidebar')">
            <FrIcon
              icon-class="md-24"
              name="close" />
          </BButtonClose>
          <BTooltip
            triggers="hover"
            placement="bottom"
            :target="`btnClose-${closeButtonId}`">
            {{ closeButtonTooltip }}
          </BTooltip>
        </div>
      </div>
      <slot />
    </BCard>
  </VueDraggableResizable>
</template>

<script setup>
import { BButtonClose, BCard, BTooltip } from 'bootstrap-vue';
import VueDraggableResizable from 'vue-draggable-resizable';
import { ref, computed } from 'vue';
import uuid from 'uuid/v4';
import FrIcon from '../Icon';
import {
  EDITOR_LAYOUT_SIDEBAR_DEFAULT_MAX_WIDTH, EDITOR_LAYOUT_SIDEBAR_DEFAULT_MIN_WIDTH, EDITOR_LAYOUT_SIDEBAR_DEFAULT_WIDTH, EDITOR_LAYOUT_SIDEBAR_POSITION,
} from './Utils/constants';
import i18n from '@/i18n';

/**
 * Sidebar component for the editor layout
 */

const props = defineProps({
  width: {
    type: Number,
    default: EDITOR_LAYOUT_SIDEBAR_DEFAULT_WIDTH,
  },
  minWidth: {
    type: Number,
    default: EDITOR_LAYOUT_SIDEBAR_DEFAULT_MIN_WIDTH,
  },
  maxWidth: {
    type: Number,
    default: EDITOR_LAYOUT_SIDEBAR_DEFAULT_MAX_WIDTH,
  },
  open: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: '',
  },
  closeButtonTooltip: {
    type: String,
    default: i18n.global.t('common.close'),
  },
  position: {
    type: String,
    default: EDITOR_LAYOUT_SIDEBAR_POSITION.LEFT,
  },
  resizable: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['toggle-sidebar']);

const savedWidth = ref(props.width);
const calculatedWidth = computed(() => (props.open ? savedWidth.value : 1));
// For now is resizable only when it is on the right side
const handles = computed(() => (props.resizable && EDITOR_LAYOUT_SIDEBAR_POSITION.RIGHT ? ['ml'] : []));
// Generate a unique id for the close button to not have duplicated ids on sidebar components
const closeButtonId = uuid();

/**
 * Handler for panel resizing that updates the current
 * width of the right edit panel
 * @param {Number} width Width returned by the event
 */
function onResize(_, __, resizeWidth) {
  savedWidth.value = resizeWidth;
}
</script>

<style lang="scss" scoped>
.fr-panel {
  background-color: $white;
  visibility: hidden;
  opacity: 0;
  left: unset !important;
  right: -1px;
  transition: all 0.1s linear;

  &.open {
    visibility: visible;
    opacity: 1;
  }
}

:deep {
  .fr-handle {
    box-sizing: border-box;
    position: absolute;
    width: 10px;
    top: 0;
    left: -5px;
    cursor: ew-resize;
    z-index: 1;
  }

  .fr-handle-ml {
    position: absolute;
    top: 0;
    left: -5px;
    height: 100%;
    cursor: ew-resize;
  }
}
</style>
