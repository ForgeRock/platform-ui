<!-- Copyright (c) 2025-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-4 flex-grow-1 overflow-auto h-100">
    <BContainer class="my-4">
      <h1 class="h4 mb-4">
        {{ $t('governance.editTemplate.columnConfig') }}
      </h1>
      <p>
        {{ $t('governance.editTemplate.columnConfigDescription') }}
      </p>
      <BTabs
        v-model="selectedTab"
        nav-class="fr-tabs">
        <BTab
          v-for="(grantType, index) in grantTypes"
          :key="index"
          :title="grantType.text">
          <CertColumnConfiguration
            class="my-4"
            :model-value="updatedColumnConfig[grantType.value]"
            :sortable-columns="sortableColumnConfig[grantType.value] || []"
            :grant-filter-properties="grantFilterProperties"
            :grant-type="grantType.value"
            :auto-id-enabled="autoIdEnabled"
            @update:model-value="updatedColumnConfig[grantType.value] = $event"
            @update:sortable-columns="sortableColumnConfig[grantType.value] = $event.map((col) => col.value)" />
        </BTab>
      </BTabs>
    </BContainer>
  </div>
</template>

<script setup>
/**
 * Customization components for a certification template.
 */
import { computed, ref, watch } from 'vue';
import { cloneDeep, isEmpty } from 'lodash';
import { baseColumnConfig } from './baseColumnConfig';
import CertColumnConfiguration from './CertColumnConfiguration';
import i18n from '@/i18n';

const emit = defineEmits(['input']);

const props = defineProps({
  value: {
    type: Object,
    default: () => ({}),
  },
  grantFilterProperties: {
    type: Object,
    default: () => ({}),
  },
  summary: {
    type: Object,
    default: () => ({}),
  },
  autoIdEnabled: {
    type: Boolean,
    default: false,
  },
});

const updatedColumnConfig = ref({});
const sortableColumnConfig = ref({});
const selectedTab = ref(0);

const availableGrantTypes = [
  { value: 'accounts', text: i18n.global.t('common.accounts') },
  { value: 'entitlements', text: i18n.global.t('common.entitlements') },
  { value: 'roles', text: i18n.global.t('common.roles') },
  { value: 'entitlementComposition', text: i18n.global.t('common.entitlementComposition') },
  { value: 'identityProfile', text: i18n.global.t('common.identityProfile') },
  { value: 'roleComposition', text: i18n.global.t('common.roleComposition') },
];

const grantTypes = computed(() => {
  const types = [];
  if (props.summary?.enableAccountGrant) {
    types.push(availableGrantTypes.find((type) => type.value === 'accounts'));
  }
  if (props.summary?.enableEntitlementGrant) {
    types.push(availableGrantTypes.find((type) => type.value === 'entitlements'));
  }
  if (props.summary?.enableRoleGrant) {
    types.push(availableGrantTypes.find((type) => type.value === 'roles'));
  }
  if (props.summary?.enableEntitlementCompositionGrant) {
    types.push(availableGrantTypes.find((type) => type.value === 'entitlementComposition'));
  }
  if (props.summary?.enableIdentityProfileGrant) {
    types.push(availableGrantTypes.find((type) => type.value === 'identityProfile'));
  }
  if (props.summary?.enableRoleCompositionGrant) {
    types.push(availableGrantTypes.find((type) => type.value === 'roleComposition'));
  }
  return types;
});

/**
 * Set the initial column configuration based on the template configuration
 */
function init() {
  const columnConfig = cloneDeep(baseColumnConfig);

  if (!props.autoIdEnabled) {
    columnConfig.entitlements = columnConfig.entitlements.filter((col) => col !== 'review.prediction');
  }

  if (!isEmpty(props.value?.columnConfig)) {
    const { columnConfig: templateConfig } = props.value;
    if (templateConfig.accounts?.length) columnConfig.accounts = [...templateConfig.accounts];
    if (templateConfig.entitlements?.length) columnConfig.entitlements = [...templateConfig.entitlements];
    if (templateConfig.roles?.length) columnConfig.roles = [...templateConfig.roles];
    if (templateConfig.entitlementComposition?.length) columnConfig.entitlementComposition = [...templateConfig.entitlementComposition];
    if (templateConfig.identityProfile?.length) columnConfig.identityProfile = [...templateConfig.identityProfile];
    if (templateConfig.roleComposition?.length) columnConfig.roleComposition = [...templateConfig.roleComposition];
  }
  updatedColumnConfig.value = columnConfig;

  const savedSortable = props.value?.sortableColumnConfig || {};
  sortableColumnConfig.value = {
    accounts: savedSortable.accounts || [],
    entitlements: savedSortable.entitlements || [],
    entitlementComposition: savedSortable.entitlementComposition || [],
    roles: savedSortable.roles || [],
    identityProfile: savedSortable.identityProfile || [],
    roleComposition: savedSortable.roleComposition || [],
  };
}

init();

watch(
  [() => updatedColumnConfig.value, () => sortableColumnConfig.value],
  ([columnConfig, sortableConfig]) => {
    emit('input', { columnConfig, sortableColumnConfig: sortableConfig });
  },
  { deep: true, immediate: true },
);
</script>
