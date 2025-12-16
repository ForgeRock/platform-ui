<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BButtonToolbar
    class="fr-access-toolbar shadow-sm border-0 justify-content-lg-start px-4 py-3">
    <BButtonGroup
      class="mx-1 pr-4 border-right-light"
      v-if="hideFilter">
      <BButton
        id="btnFilter"
        variant="outline-primary"
        @click="$emit('show-filter')">
        <FrIcon
          icon-class="md-24 mr-md-2"
          name="filter_list">
          <span class="d-none d-md-inline-block">
            {{ $t('governance.access.toggleAccessFilter') }}
          </span>
        </FrIcon>
      </BButton>
      <BTooltip
        target="btnFilter"
        triggers="hover"
        placement="bottom">
        {{ $t('governance.access.toggleAccessFilter') }}
      </BTooltip>
    </BButtonGroup>
    <div class="d-flex">
      <BButtonGroup
        class="mx-1 pr-2 mr-4">
        <template>
          <BButton
            :aria-label="$t('governance.access.toolbar.zoomIn')"
            variant="none"
            @click="zoom(10)"
            :disabled="disableZoomIn">
            <FrIcon
              icon-class="text-dark md-24"
              name="zoom_in" />
          </BButton>
          <BButton
            :aria-label="$t('governance.access.toolbar.zoomOut')"
            variant="none"
            @click="zoom(-10)"
            :disabled="disableZoomOut">
            <FrIcon
              icon-class="text-dark md-24"
              name="zoom_out" />
          </BButton>
        </template>
        <BButton
          id="btnFullscreen"
          variant="none"
          :squared="true"
          :aria-label="$t('governance.access.toolbar.fullscreen')"
          @click="$emit('toggle-fullscreen'); $refs.fullScreenTooltip.$emit('close');">
          <FrIcon
            icon-class="text-dark md-24"
            :name="fullscreen ? 'fullscreen_exit' : 'fullscreen'" />
        </BButton>
        <BTooltip
          ref="fullScreenTooltip"
          target="btnFullscreen"
          triggers="hover"
          placement="bottom">
          {{ $t('governance.access.toolbar.fullscreen') }}
        </BTooltip>
      </BButtonGroup>
      <div
        class="d-flex flex-row">
        <div
          v-for="type in Object.keys(localTypes)"
          :key="`type-${type}`"
          class="d-flex align-items-center">
          <FrField
            v-model="localTypes[type]"
            class="mr-4"
            :aria-labelledby="`label-${type}`"
            :name="`${type}ColumnSelected`"
            :label="getAccessLabel(type)"
            type="checkbox"
            @change="toggleSelectedType(type)" />
        </div>
      </div>
    </div>
    <slot name="right-content" />
  </BButtonToolbar>
</template>

<script setup>
import {
  BButton,
  BButtonGroup,
  BButtonToolbar,
  BTooltip,
} from 'bootstrap-vue';
import { computed, ref } from 'vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrField from '@forgerock/platform-shared/src/components/Field';
import i18n from '@/i18n';

const emit = defineEmits([
  'close',
  'toggle-fullscreen',
  'show-filter',
  'toggle-selected-type',
  'zoom',
]);

const props = defineProps({
  fullscreen: {
    type: Boolean,
    default: false,
  },
  hideFilter: {
    type: Boolean,
    default: false,
  },
  selectedTypes: {
    type: Object,
    required: true,
  },
});

const zoomValue = ref(80);
const disableZoomIn = computed(() => zoomValue.value === 150);
const disableZoomOut = computed(() => zoomValue.value === 50);
const localTypes = ref({ ...props.selectedTypes });

/**
 * Updates the current zoom value and emits the result
 * @param {Number} zoomValue value to increment or decrement the zoom
 */
function zoom(value) {
  zoomValue.value += value;
  emit('zoom', zoomValue.value);
}

function getAccessLabel(type) {
  switch (type) {
    case 'roleMembership':
      return i18n.global.t('common.roles');
    case 'entitlementGrant':
      return i18n.global.t('common.entitlements');
    case 'accountGrant':
      return i18n.global.t('common.applications');
    default:
      return '';
  }
}

function toggleSelectedType(type) {
  emit('toggle-selected-type', type);
}
</script>

<style lang="scss" scoped>
.fr-access-toolbar {
  background-color: $white;
  padding: 12px;
  z-index: 1;

  .btn-none {
    &:hover {
      background-color: $gray-100;
    }

    &.disabled:hover {
      background-color: $white;
    }
  }

  .border-right-light {
    border-right: 1px solid $gray-200;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s;
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }
}
</style>
