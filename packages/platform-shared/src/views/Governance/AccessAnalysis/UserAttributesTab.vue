<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrSpinner
      v-if="isLoading"
      class="py-5" />
    <template v-else-if="attributeKeys.length">
      <BRow class="mb-3">
        <BCol class="d-flex justify-content-end">
          <FrListOrganizer
            :column-organizer-key="ATTRIBUTE_ORGANIZER_KEY"
            v-model="availableAttributes"
            @list-updated="updateAttributeList">
            <!-- icon-only default button needs an accessible name -->
            <template #button="{ open }">
              <BButton
                variant="link"
                class="text-dark"
                :aria-label="$t('common.customizeColumns')"
                :data-testid="`attributes-organizer-button`"
                @click="open">
                <FrIcon
                  icon-class="md-24"
                  name="view_column" />
              </BButton>
            </template>
          </FrListOrganizer>
        </BCol>
      </BRow>
      <BTableSimple
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
            v-for="attribute in selectedAttributes"
            :key="attribute.key"
            :class="{ 'fr-attributes-tab__row--diff': isDiff(attribute.key) }">
            <BTd class="fr-attributes-tab__col-key text-muted">
              {{ attribute.key }}
            </BTd>
            <BTd>{{ formatValue(userAData[attribute.key], attribute.key) }}</BTd>
            <BTd>{{ formatValue(userBData[attribute.key], attribute.key) }}</BTd>
          </BTr>
        </BTbody>
      </BTableSimple>
    </template>
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
  BButton,
  BCol,
  BRow,
  BTableSimple,
  BTbody,
  BTd,
  BTh,
  BThead,
  BTr,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrListOrganizer from '@forgerock/platform-shared/src/components/ListOrganizer';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import { getFilterSchema, getUserById } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
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
// standard user attributes from the filter schema - the same source the other
// governance column pickers use
const schemaAttributes = ref([]);

const ATTRIBUTE_ORGANIZER_KEY = 'access_analysis_attributes_rows';

// Attributes active by default until the user customizes the picker
const DEFAULT_ACTIVE_ATTRIBUTES = new Set([
  'accountStatus', 'cn', 'compositeId', 'fr', 'givenName', 'id', 'mail', 'sn', 'userName',
]);

// Full picker list - schema attributes plus any attribute present on the loaded users
const availableAttributes = ref([]);

// union of attribute keys present across the two loaded users
const attributeKeys = computed(() => (
  [...new Set([...Object.keys(userAData.value), ...Object.keys(userBData.value)])].sort()
));

/**
 * Rebuild the picker list: the standard user attributes from the schema first (labeled
 * by displayName), then any attributes on the loaded users the schema doesn't cover.
 * The user's current selection is preserved; attributes seen for the first time default
 * to active only when listed in DEFAULT_ACTIVE_ATTRIBUTES.
 */
function buildAttributeList() {
  const previousState = new Map(availableAttributes.value.map((attribute) => [attribute.key, attribute.enabled]));
  const schemaEntries = schemaAttributes.value.map((attribute) => ({
    key: attribute.key,
    label: attribute.displayName || attribute.key,
  }));
  const schemaKeys = new Set(schemaEntries.map((entry) => entry.key));
  const extraEntries = attributeKeys.value
    .filter((key) => !schemaKeys.has(key))
    .map((key) => ({ key, label: key }));
  availableAttributes.value = [...schemaEntries, ...extraEntries].map((entry) => ({
    ...entry,
    enabled: previousState.has(entry.key)
      ? previousState.get(entry.key)
      : DEFAULT_ACTIVE_ATTRIBUTES.has(entry.key),
  }));
}

// Rows shown in the table: the picker's enabled attributes, in the picker's order
const selectedAttributes = computed(() => (
  availableAttributes.value.filter((attribute) => attribute.enabled)
));

/**
 * Apply the picker's selection; the table rows re-render from the already-loaded user data
 * @param {Array} updatedList the organizer's full attribute list with enabled flags
 */
function updateAttributeList(updatedList) {
  availableAttributes.value = updatedList;
}

watch([attributeKeys, schemaAttributes], () => {
  // mid-reload the keys collapse to [] before the new users resolve; keep the
  // selection so a reload doesn't reset attributes the user removed
  if (!attributeKeys.value.length && isLoading.value) return;
  buildAttributeList();
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

/**
 * Load the standard user attribute list for the picker. Non-fatal: the picker then
 * covers only the attributes present on the loaded users.
 */
async function loadSchema() {
  try {
    const { data } = await getFilterSchema();
    schemaAttributes.value = data?.user ?? [];
  } catch {
    schemaAttributes.value = [];
  }
}

onMounted(() => {
  loadSchema();
  loadUsers();
});
watch(() => [props.userAId, props.userBId], loadUsers);
// the tab's count badge shows the rows currently displayed, matching the other tabs
watchEffect(() => emit('update:count', selectedAttributes.value.length));
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
