<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BSpinner
      v-if="props.downloadStatus === 'downloading'"
      class="mr-1"
      data-testid="fr-download-button-spinner"
      small
      :label="$t('common.loadingEtc')" />
    <FrIcon
      v-else
      data-testid="fr-download-button-icon"
      name="file_download" />
    <span data-testid="action-button-label">
      {{ props.label }}
    </span>
  </div>
</template>

<script setup>
/**
 * @description Run History download buttons
 */
import { BSpinner } from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

const props = defineProps({
  downloadStatus: {
    type: String,
    default: 'download',
    validator(value) {
      return ['download', 'downloading'].includes(value);
    },
  },
  fileType: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
});
</script>

<style lang="scss" scoped>
  .fr-report-error-badge {
    width: 48px;
  }
</style>
