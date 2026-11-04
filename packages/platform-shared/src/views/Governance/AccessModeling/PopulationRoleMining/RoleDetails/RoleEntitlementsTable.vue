<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard no-body>
    <BCardBody class="pb-3 d-flex justify-content-end">
      <FrSearchInput
        v-model="searchQuery"
        class="col-12 col-md-4 p-0"
        :data-testid="`${testid}-search`"
        :placeholder="$t('governance.accessModeling.populationRoleMining.roleDetailsPage.searchEntitlements')" />
    </BCardBody>
    <BTable
      class="mb-0"
      responsive
      :fields="entitlementTableFields"
      :items="filteredEntitlements"
      :empty-text="$t('governance.accessModeling.populationRoleMining.roleDetailsPage.noEntitlements')"
      show-empty>
      <template #cell(entitlementName)="{ item }">
        {{ entitlementDisplayName(item) }}
      </template>
      <template #cell(application)="{ item }">
        {{ item.appName || blankValueIndicator }}
      </template>
      <template #cell(prevalence)="{ item }">
        <div class="d-flex align-items-center w-100">
          <div
            class="prevalence-bar flex-grow-1 mr-2"
            role="progressbar"
            :aria-label="$t('governance.accessModeling.populationRoleMining.roleDetailsPage.pctOfMembers')"
            :aria-valuenow="Math.round((item.prevalenceInRole ?? 0) * 100)"
            aria-valuemin="0"
            aria-valuemax="100">
            <div
              class="prevalence-bar-fill"
              :style="{ width: `${Math.round((item.prevalenceInRole ?? 0) * 100)}%` }" />
          </div>
          <span class="text-nowrap">{{ Math.round((item.prevalenceInRole ?? 0) * 100) }}%</span>
        </div>
      </template>
    </BTable>
  </BCard>
</template>

<script setup>
import {
  BCard,
  BCardBody,
  BTable,
} from 'bootstrap-vue';
import { computed, ref } from 'vue';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import i18n from '@/i18n';

/**
 * Table of the entitlements behind a mined role, searchable client-side.
 * @component RoleEntitlementsTable
 */

const roleDetailsPage = 'governance.accessModeling.populationRoleMining.roleDetailsPage';

const props = defineProps({
  entitlements: {
    type: Array,
    default: () => [],
  },
  testid: {
    type: String,
    default: 'entitlements',
  },
});

const searchQuery = ref('');

const entitlementTableFields = [
  { key: 'entitlementName', label: i18n.global.t(`${roleDetailsPage}.entitlementName`) },
  { key: 'application', label: i18n.global.t('common.application') },
  { key: 'prevalence', label: i18n.global.t(`${roleDetailsPage}.pctOfMembers`) },
];

const filteredEntitlements = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return props.entitlements;
  return props.entitlements.filter((entitlement) => [
    entitlement.displayName,
    entitlement.entId,
    entitlement.appName,
  ].some((value) => value && value.toLowerCase().includes(query)));
});

/**
 * Display name for an entitlement: the backend displayName is often empty, so fall back to
 * the last path segment of entId, e.g. ".../Roles/SourceOneUsers" -> "SourceOneUsers"
 * @param {Object} entitlement an entitlementMetadata entry
 * @returns {String} the displayable entitlement name
 */
function entitlementDisplayName(entitlement) {
  return entitlement.displayName || entitlement.entId?.split('/').pop() || blankValueIndicator;
}
</script>

<style lang="scss" scoped>
.prevalence-bar {
  height: 0.5rem;
  background-color: $gray-200;
  border-radius: 0.25rem;
  overflow: hidden;
}

.prevalence-bar-fill {
  height: 100%;
  background-color: $green;
}
</style>
