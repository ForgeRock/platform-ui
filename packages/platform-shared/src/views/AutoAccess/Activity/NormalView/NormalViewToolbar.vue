<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="normal-view-toolbar">
    <div class="d-flex flex-wrap">
      <div class="mb-3 mb-md-0 flex-grow-0 flex-md-grow-1">
        <h4 class="mb-0">
          {{ $t('autoAccess.access.normalView.authenticationAttempts') }}
        </h4>
        <small>{{ $t('autoAccess.access.normalView.dataTimePeriod') }}</small>
      </div>
      <div class="flex-md-grow-0 flex-grow-1">
        <div class="d-flex flex-wrap">
          <div class="align-self-center d-flex align-items-end h-100 flex-grow-1 flex-md-grow-0 mb-3 mb-md-0">
            <FrField
              v-if="hasCompare"
              v-model="compare"
              class="mr-3"
              name="showLastPeriod"
              size="sm"
              type="boolean"
              :aria-label="$t('autoAccess.access.normalView.compareLabel')"
              :disabled="isLoading"
              :label="$t('autoAccess.access.normalView.compareLabel')"
            />
          </div>
          <BButton
            class="w-md-auto w-100"
            pill
            variant="outline-primary"
            :disabled="isLoading"
            @click="$bvModal.show('FilterFeaturesModal')"
          >
            <span>
              {{ $t('autoAccess.access.normalView.featuresSelectedTitle') }}
            </span>
            <span class="font-weight-bold">
              {{ filterButtonName }}
            </span>
          </BButton>
        </div>
      </div>
    </div>
    <FrFilterFeaturesModal
      :filters="filters"
      @update="updateSelectedFeatures"
    />
  </div>
</template>

<script setup>
import FrField from '@forgerock/platform-shared/src/components/Field';
import { BButton } from 'bootstrap-vue';
import {
  computed, ref, watch,
} from 'vue';
import i18n from '@forgerock/platform-shared/src/i18n';
import FrFilterFeaturesModal from './FilterFeaturesModal';

const emit = defineEmits(['compare', 'updateSelectedFeatures']);
const compare = ref(false);

const prop = defineProps({
  filters: {
    type: Array,
    default: () => ([]),
  },
  hasCompare: {
    type: Boolean,
    default: true,
  },
  isLoading: {
    type: Boolean,
    default: true,
  },
});

/**
 * Updates the active view options list
 *
 * @param {Array<FeatureViewOptionItem>} value Array of active view options
 */
function updateSelectedFeatures(selectedFeatures) {
  emit('updateSelectedFeatures', selectedFeatures);
}

/**
 * Generates the text on the filter button
 */
const filterButtonName = computed(() => {
  const { filters } = prop;
  const activeFeaturesCount = filters.filter((filter) => filter.show).length;
  if (filters.length === activeFeaturesCount) {
    return i18n.global.t('autoAccess.access.normalView.featuresSelectedAll');
  }
  return i18n.global.tc('autoAccess.access.normalView.featuresSelected', activeFeaturesCount, { count: activeFeaturesCount });
});

/**
 * When the compare switch changes state, emit the updated value to the consuming component
 */
watch(compare, (newVal) => {
  emit('compare', newVal);
});

</script>
<style type="scss" scoped>
  .button-filter {
    &:hover {
      background-color: transparent;
    }
  }

  @media (min-width: 576px) {
    .w-md-auto {
      width: auto !important;
    }
  }
</style>
