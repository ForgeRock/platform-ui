<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-4 bg-light border-top">
    <BRow class="mb-3">
      <BCol>
        <BCard body-class="event-card-body">
          <p class="section-header mb-3">
            {{ $t('governance.audit.details.event') }}
          </p>
          <BRow>
            <BCol cols="6">
              <div class="event-field d-flex justify-content-between mb-2">
                <small class="text-muted flex-shrink-0">{{ $t('common.displayName') }}</small>
                <small class="text-dark text-right ml-3 event-field__value">{{ props.log.displayName ?? blankValueIndicator }}</small>
              </div>
            </BCol>
            <BCol cols="6">
              <div class="event-field d-flex justify-content-between mb-2">
                <small class="text-muted flex-shrink-0">{{ $t('governance.audit.actor') }}</small>
                <small class="text-dark text-right ml-3 event-field__value">{{ props.log.actorDisplayName ?? (props.log.actor === 'system' ? $t('governance.audit.actorTypes.system') : props.log.actor) ?? blankValueIndicator }}</small>
              </div>
            </BCol>
            <BCol cols="6">
              <div class="event-field d-flex justify-content-between">
                <small class="text-muted flex-shrink-0">{{ $t('common.id') }}</small>
                <small class="text-dark text-right ml-3 event-field__value">{{ props.log.objectId ?? blankValueIndicator }}</small>
              </div>
            </BCol>
            <BCol cols="6">
              <div class="event-field d-flex justify-content-between">
                <small class="text-muted flex-shrink-0">{{ $t('governance.audit.details.fields.systemExecuted') }}</small>
                <small class="text-dark text-right ml-3 event-field__value">{{ props.log.systemExecuted ?? blankValueIndicator }}</small>
              </div>
            </BCol>
          </BRow>
        </BCard>
      </BCol>
    </BRow>
    <BRow class="mb-3">
      <BCol>
        <BCard body-class="changes-card-body">
          <p class="section-header mb-3">
            {{ $t('governance.audit.details.changes') }}
          </p>
          <div
            v-if="log.changes && log.changes.length"
            class="changes-list">
            <BRow class="change-header mb-0 mx-0">
              <BCol
                cols="4"
                class="change-header--field py-1 px-2">
                <small class="font-weight-bold">
                  {{ $t('governance.audit.details.fields.field') }}
                </small>
              </BCol>
              <BCol
                cols="4"
                class="change-header--before py-1 px-2">
                <small class="font-weight-bold">
                  {{ $t('governance.audit.details.fields.before') }}
                </small>
              </BCol>
              <BCol
                cols="4"
                class="change-header--after py-1 px-2">
                <small class="font-weight-bold">
                  {{ $t('governance.audit.details.fields.after') }}
                </small>
              </BCol>
            </BRow>
            <BRow
              v-for="(change, index) in log.changes"
              :key="index"
              class="mx-0 mb-1">
              <BCol
                cols="4"
                class="change-value-col change-value-col--field">
                <small class="font-weight-bold">
                  {{ stripQuotes(change.field_name) }}
                </small>
              </BCol>
              <BCol
                cols="4"
                class="change-value-col change-value-col--before">
                <small>
                  {{ change.before_value ?? blankValueIndicator }}
                </small>
              </BCol>
              <BCol
                cols="4"
                class="change-value-col change-value-col--after">
                <small>
                  {{ change.after_value ?? blankValueIndicator }}
                </small>
              </BCol>
            </BRow>
          </div>
          <small
            v-else
            class="text-muted">
            {{ blankValueIndicator }}
          </small>
        </BCard>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <p class="section-header mb-3">
          {{ $t('governance.audit.details.rawEventJson') }}
        </p>
        <pre class="raw-json">{{ JSON.stringify(omit(log, UI_ONLY_KEYS), null, 2) }}</pre>
      </BCol>
    </BRow>
  </div>
</template>

<script setup>
import { omit } from 'lodash';
import { BCard, BCol, BRow } from 'bootstrap-vue';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';

const UI_ONLY_KEYS = ['_showDetails', 'assignments'];

function stripQuotes(str) {
  if (!str) return str;
  return str.replace(/^"+|"+$/g, '');
}

const props = defineProps({
  log: {
    type: Object,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.event-field {
  min-width: 0;

  &__value {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.section-header {
  font-size: 1rem;
  font-weight: 600;
  color: $gray-900;
}

.change-header {
  border-radius: 4px 4px 0 0;
  overflow: hidden;

  &--field {
    background-color: $gray-300;
    color: $gray-800;
  }

  &--before {
    background-color: rgba($danger, 0.2);
    color: darken($danger, 10%);
  }

  &--after {
    background-color: rgba($success, 0.2);
    color: darken($success, 10%);
  }
}

.change-value-col {
  min-width: 0;
  word-break: break-word;
  white-space: pre-wrap;
  padding: 0.25rem 0.5rem;

  &--field {
    background-color: $gray-100;
    color: $gray-800;
  }

  &--before {
    background-color: rgba($danger, 0.08);
    color: darken($danger, 15%);
  }

  &--after {
    background-color: rgba($success, 0.08);
    color: darken($success, 15%);
  }
}

.event-card-body,
.changes-card-body {
  max-height: 300px;
  overflow-y: auto;
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
