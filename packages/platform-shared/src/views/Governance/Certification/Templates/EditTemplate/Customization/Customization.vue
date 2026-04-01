<!-- Copyright 2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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
            :grant-filter-properties="grantFilterProperties"
            :grant-type="grantType.value"
            :auto-id-enabled="autoIdEnabled"
            @update:model-value="updatedColumnConfig[grantType.value] = $event" />
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
const selectedTab = ref(0);

const availableGrantTypes = [
  { value: 'accounts', text: i18n.global.t('common.accounts') },
  { value: 'entitlements', text: i18n.global.t('common.entitlements') },
  { value: 'roles', text: i18n.global.t('common.roles') },
  { value: 'entitlementComposition', text: i18n.global.t('common.entitlementComposition') },
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
  }
  updatedColumnConfig.value = columnConfig;
}

init();

watch(
  () => updatedColumnConfig.value,
  (newValue) => {
    emit('input', { columnConfig: newValue });
  },
  { deep: true, immediate: true },
);
</script>
