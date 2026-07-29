<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    v-if="hasSource"
    class="mb-4">
    <FrSpinner
      v-if="isLoadingApplications"
      size="md" />
    <BRow
      v-else
      class="w-100 align-items-center">
      <BCol lg="8">
        <h2 class="h5 mb-0">
          {{ sourceLabel }}
        </h2>
        <p class="text-secondary text-muted mb-0">
          {{ $t('governance.agents.integration.subtitle', { source: sourceLabel }) }}
        </p>
      </BCol>
      <BCol lg="3">
        <BBadge
          class="w-100px"
          data-testid="integration-status"
          :variant="statusVariant">
          {{ statusText }}
        </BBadge>
      </BCol>
      <BCol
        class="d-flex justify-content-end"
        lg="1">
        <BButton
          variant="link"
          class="text-nowrap"
          @click="showConfigModal">
          {{ hasConfiguredSubtypes
            ? $t('governance.agents.integration.configure')
            : $t('governance.agents.integration.turnOn') }}
        </BButton>
      </BCol>
    </BRow>

    <FrConfigureAgentSourceModal
      :source="source"
      @configured="refreshStatus()" />
  </BCard>
</template>

<script setup>
/**
 * Status card for a dynamic discovery source; all configuration detail lives in
 * the ConfigureAgentSourceModal. Prop-driven so it can render anywhere.
 */
import {
  computed, onMounted,
} from 'vue';
import {
  BBadge, BButton, BCard, BCol, BRow,
} from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import i18n from '@/i18n';
import FrConfigureAgentSourceModal from './ConfigureAgentSourceModal';
import { useAgentConfig } from '../utils/useAgentConfig';
import {
  useSourceApplications, buildSubtypeRows, getSourceLabel, STATUS_REFRESH_BACKOFF_MS,
} from './useSourceApplications';

const props = defineProps({
  // Source key from the /agent/config sources object (e.g. 'privilege').
  source: {
    type: String,
    default: 'privilege',
  },
});

const { bvModal } = useBvModal();
const { agentSources, loadConfig } = useAgentConfig();
const { sourceApplications, isLoadingApplications, fetchSourceApplications } = useSourceApplications();

const sourceLabel = computed(() => getSourceLabel(props.source));

const subtypeRows = computed(() => buildSubtypeRows(
  agentSources.value,
  props.source,
  sourceApplications.value,
));

const configuredCount = computed(() => subtypeRows.value.filter((row) => row.configured).length);

const hasConfiguredSubtypes = computed(() => configuredCount.value > 0);

// Self-gating: the card renders only while the backend config actually defines
// this source (agentSources null — e.g. connector service unreachable — hides it).
const hasSource = computed(() => Boolean(agentSources.value?.[props.source]));

const statusVariantMap = {
  notSetUp: 'light',
  partial: 'warning',
  setUp: 'success',
};

const statusText = computed(() => {
  if (subtypeRows.value.length && configuredCount.value === subtypeRows.value.length) {
    return i18n.global.t('governance.agents.integration.status.setUp');
  }
  if (hasConfiguredSubtypes.value) {
    return i18n.global.t('governance.agents.integration.status.partial', {
      configured: configuredCount.value,
      total: subtypeRows.value.length,
    });
  }
  return i18n.global.t('governance.agents.integration.status.notSetUp');
});

const statusVariant = computed(() => {
  if (subtypeRows.value.length && configuredCount.value === subtypeRows.value.length) {
    return statusVariantMap.setUp;
  }
  return hasConfiguredSubtypes.value ? statusVariantMap.partial : statusVariantMap.notSetUp;
});

/**
 * Refetches applications, retrying with backoff while the status lags (the search
 * index is eventually consistent); bounded at 3 attempts so failed saves settle.
 * @param {Number} [attempt] current retry attempt (internal)
 */
async function refreshStatus(attempt = 0) {
  const previousCount = configuredCount.value;
  await fetchSourceApplications(props.source);
  if (configuredCount.value > previousCount || attempt >= 2) {
    return;
  }
  await new Promise((resolve) => setTimeout(resolve, STATUS_REFRESH_BACKOFF_MS));
  await refreshStatus(attempt + 1);
}

function showConfigModal() {
  bvModal.value.show('ConfigureAgentSourceModal');
}

onMounted(() => {
  loadConfig().then(() => {
    if (hasSource.value) {
      fetchSourceApplications(props.source);
    }
  });
});
</script>
