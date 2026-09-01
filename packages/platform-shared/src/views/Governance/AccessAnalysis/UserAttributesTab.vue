<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrSpinner
      v-if="isLoading"
      class="py-5" />
    <BTableSimple
      v-else-if="attributeKeys.length"
      hover
      responsive
      class="mb-0">
      <BThead>
        <BTr>
          <BTh class="fr-attributes-tab__col-key">
            {{ $t('governance.accessAnalysis.attributes.attribute') }}
          </BTh>
          <BTh class="fr-attributes-tab__col-value">
            {{ userAName }}
          </BTh>
          <BTh class="fr-attributes-tab__col-value">
            {{ userBName }}
          </BTh>
        </BTr>
      </BThead>
      <BTbody>
        <BTr
          v-for="key in attributeKeys"
          :key="key"
          :class="{ 'fr-attributes-tab__row--diff': isDiff(key) }">
          <BTd class="fr-attributes-tab__col-key text-muted">
            {{ key }}
          </BTd>
          <BTd>{{ formatValue(userAData[key], key) }}</BTd>
          <BTd>{{ formatValue(userBData[key], key) }}</BTd>
        </BTr>
      </BTbody>
    </BTableSimple>
    <FrNoData
      v-else
      :card="false"
      icon="inbox"
      :subtitle="$t('governance.accessAnalysis.attributes.noAttributes')" />
  </div>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref,
  watch,
  watchEffect,
} from 'vue';
import {
  BTableSimple,
  BTbody,
  BTd,
  BTh,
  BThead,
  BTr,
} from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import { getUserById } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

const props = defineProps({
  userAId: { type: String, required: true },
  userBId: { type: String, required: true },
  userAName: { type: String, default: '' },
  userBName: { type: String, default: '' },
});

const emit = defineEmits(['update:count']);

const isLoading = ref(false);
const userAData = ref({});
const userBData = ref({});

const EXCLUDED_KEYS = new Set([
  '_rev', '_refResourceCollection', '_refProperties', 'password',
  'scopes', 'applications', 'assignments', 'metadata',
  'permissions', 'authzRoles', 'roles',
]);

const attributeKeys = computed(() => {
  const keys = new Set([...Object.keys(userAData.value), ...Object.keys(userBData.value)]);
  EXCLUDED_KEYS.forEach((k) => keys.delete(k));
  return [...keys].sort();
});

function formatManager(manager) {
  if (!manager || typeof manager !== 'object') return '—';
  const { givenName = '', sn = '', userName = '' } = manager;
  return i18n.global.t('common.userFullNameUserName', { givenName, sn, userName });
}

function formatValue(val, key) {
  if (key === 'manager') return formatManager(val);
  if (val === undefined || val === null || val === '') return '—';
  if (typeof val === 'boolean') return val ? i18n.global.t('common.yes') : i18n.global.t('common.no');
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

function isDiff(key) {
  return formatValue(userAData.value[key], key) !== formatValue(userBData.value[key], key);
}

let loadUsersSeq = 0;

async function loadUsers() {
  isLoading.value = true;
  loadUsersSeq += 1;
  const seq = loadUsersSeq;
  userAData.value = {};
  userBData.value = {};
  const [aResult, bResult] = await Promise.allSettled([
    getUserById(props.userAId),
    getUserById(props.userBId),
  ]);
  if (seq !== loadUsersSeq) return;
  if (aResult.status === 'rejected') {
    showErrorMessage(aResult.reason, i18n.global.t('governance.accessAnalysis.attributes.errorLoading'));
  }
  if (bResult.status === 'rejected') {
    showErrorMessage(bResult.reason, i18n.global.t('governance.accessAnalysis.attributes.errorLoading'));
  }
  userAData.value = aResult.status === 'fulfilled' ? (aResult.value?.data?.result?.[0] ?? {}) : {};
  userBData.value = bResult.status === 'fulfilled' ? (bResult.value?.data?.result?.[0] ?? {}) : {};
  isLoading.value = false;
}

onMounted(loadUsers);
watch(() => [props.userAId, props.userBId], loadUsers);
watchEffect(() => emit('update:count', attributeKeys.value.length));
</script>

<style lang="scss" scoped>
.fr-attributes-tab {
  &__col-key {
    width: 30%;
    font-weight: 600;
  }

  &__col-value {
    width: 35%;
  }

  &__row--diff td {
    background-color: rgba(255, 193, 7, 0.08);
  }
}
</style>
