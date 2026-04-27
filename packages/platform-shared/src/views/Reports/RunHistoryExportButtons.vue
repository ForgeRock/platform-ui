<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrIcon
      v-if="props.exportStatus === 'export' || props.exportStatus === 'error'"
      data-testid="fr-export-button-icon"
      name="sync" />
    <BSpinner
      v-else-if="props.exportStatus === 'exporting' || props.exportStatus === 'downloading'"
      class="mr-1"
      data-testid="fr-export-button-spinner"
      small
      :label="$t('common.loadingEtc')" />
    <FrIcon
      v-else-if="props.exportStatus === 'download' || props.exportStatus === 'error'"
      data-testid="fr-download-button-icon"
      name="file_download" />
    <span data-testid="action-button-label">
      {{ props.label }}
    </span>
    <div class="fr-report-error-badge d-inline-block ml-2">
      <FrRunReportBadges
        v-if="props.exportStatus === 'error'"
        report-status="error" />
    </div>
  </div>
</template>

<script setup>
/**
 * @description Run History export buttons
 */
import { BSpinner } from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrRunReportBadges from './RunReportBadges';

const props = defineProps({
  exportStatus: {
    type: String,
    default: 'export',
    validator(value) {
      return ['export', 'exporting', 'download', 'downloading', 'error'].includes(value);
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
