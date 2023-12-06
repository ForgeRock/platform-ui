<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div v-if="reportStatus === 'processing'">
    <BSpinner
      class="mr-2"
      data-testid="fr-report-badge-spinner"
      small
      variant="primary"
      :label="$t('common.loadingEtc')" />
    {{ $t('common.running') }}
  </div>
  <BBadge
    v-else-if="reportStatus === 'complete'"
    class="w-100"
    data-testid="fr-complete-report-badge"
    variant="success">
    {{ $t('common.complete') }}
  </BBadge>
  <BBadge
    v-else-if="reportStatus === 'expired'"
    class="w-100"
    data-testid="fr-expired-report-badge"
    variant="light">
    {{ $t('common.expired') }}
  </BBadge>
  <BBadge
    v-else
    class="w-100"
    data-testid="fr-error-report-badge"
    variant="danger">
    {{ $t('common.error') }}
  </BBadge>
</template>

<script setup>
/**
 * @description Report status badges
 */
import { BBadge, BSpinner } from 'bootstrap-vue';

defineProps({
  reportStatus: {
    type: String,
    default: 'processing',
  },
});
</script>
