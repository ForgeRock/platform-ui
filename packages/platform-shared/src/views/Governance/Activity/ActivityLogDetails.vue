<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-4 bg-light border-top">
    <BRow>
      <BCol
        lg="4"
        class="px-4">
        <p class="section-header mb-3">
          {{ $t('governance.activity.details.actor') }}
        </p>
        <div
          v-for="field in actorFields"
          :key="field.key"
          class="d-flex justify-content-between mb-2">
          <small class="text-muted">
            {{ field.label }}
          </small>
          <small class="text-dark text-right ml-3">
            {{ field.value ?? blankValueIndicator }}
          </small>
        </div>
      </BCol>
      <BCol
        lg="4"
        class="px-4">
        <p class="section-header mb-3">
          {{ $t('governance.activity.details.environment') }}
        </p>
        <div
          v-for="field in environmentFields"
          :key="field.key"
          class="d-flex justify-content-between mb-2">
          <small class="text-muted">
            {{ field.label }}
          </small>
          <small class="text-dark text-right ml-3">
            {{ field.value ?? blankValueIndicator }}
          </small>
        </div>
      </BCol>
      <BCol
        lg="4"
        class="px-4">
        <p class="section-header mb-3">
          {{ $t('governance.activity.details.resultContext') }}
        </p>
        <div
          v-for="field in resultContextFields"
          :key="field.key"
          class="d-flex justify-content-between mb-2">
          <small class="text-muted">
            {{ field.label }}
          </small>
          <small class="text-dark text-right ml-3">
            {{ field.value ?? blankValueIndicator }}
          </small>
        </div>
      </BCol>
    </BRow>
    <BRow class="mt-4">
      <BCol class="px-4">
        <p class="section-header mb-3">
          {{ $t('governance.activity.details.rawEventJson') }}
        </p>
        <pre class="raw-json">{{ JSON.stringify(log, null, 2) }}</pre>
      </BCol>
    </BRow>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { BCol, BRow } from 'bootstrap-vue';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import i18n from '@/i18n';

const props = defineProps({
  log: {
    type: Object,
    required: true,
  },
});

/**
 * Formats bytes in and out into a single "in / out" string.
 * @param {string|number} bytesIn
 * @param {string|number} bytesOut
 * @returns {string|null}
 */
function formatBytes(bytesIn, bytesOut) {
  if (bytesIn == null && bytesOut == null) return null;
  return `${bytesIn ?? blankValueIndicator} / ${bytesOut ?? blankValueIndicator}`;
}

/**
 * Formats a geo object into a single readable string (City, Region, Country).
 * @param {Object} geo - Geo object with city, region, and country fields
 * @returns {string|null} Formatted string, or null if no geo data present
 */
function formatGeo(geo) {
  if (!geo) return null;
  return [geo.city, geo.region, geo.country].filter(Boolean).join(', ');
}

const actorFields = computed(() => [
  { key: 'actor_id', label: i18n.global.t('governance.activity.details.fields.actorId'), value: props.log.actor?.actor_id },
  { key: 'username', label: i18n.global.t('governance.activity.details.fields.username'), value: props.log.actor?.username },
  { key: 'email', label: i18n.global.t('governance.activity.details.fields.email'), value: props.log.actor?.email },
  { key: 'actor_global_id', label: i18n.global.t('governance.activity.details.fields.actorGlobalId'), value: props.log.actor_global_id },
]);

const environmentFields = computed(() => [
  { key: 'geo', label: i18n.global.t('governance.activity.details.fields.location'), value: formatGeo(props.log.environment?.geo) },
  { key: 'user_agent', label: i18n.global.t('governance.activity.details.fields.userAgent'), value: props.log.environment?.user_agent },
  { key: 'device_id', label: i18n.global.t('governance.activity.details.fields.device'), value: props.log.environment?.device_id },
  { key: 'cloud_region', label: i18n.global.t('governance.activity.details.fields.cloudRegion'), value: props.log.environment?.cloud_region },
]);

const resultContextFields = computed(() => [
  { key: 'response_code', label: i18n.global.t('governance.activity.details.fields.responseCode'), value: props.log.result_context?.response_code },
  { key: 'risk_score', label: i18n.global.t('governance.activity.details.fields.riskScore'), value: props.log.result_context?.risk_score },
  { key: 'bytes', label: i18n.global.t('governance.activity.details.fields.bytes'), value: formatBytes(props.log.result_context?.bytes_in, props.log.result_context?.bytes_out) },
]);
</script>

<style lang="scss" scoped>
.section-header {
  font-size: 1rem;
  font-weight: 600;
  color: $gray-900;
}

.raw-json {
  cursor: text;
  background-color: $white;
  border: 1px solid $gray-200;
  border-radius: 4px;
  font-size: 0.8rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 1rem;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
