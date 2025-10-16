<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    class="border-0 shadow-none"
    no-body>
    <BCardHeader class="p-0">
      <BButtonToolbar
        v-if="!readOnly"
        class="justify-content-between p-3 border-bottom-0">
        <div class="float-left">
          <BButton
            variant="primary"
            @click="bvModal.show('addEntitlementsModal')">
            <FrIcon
              icon-class="mr-2"
              name="add">
              {{ $t('common.addObject', { object: $t('common.entitlements') }) }}
            </FrIcon>
          </BButton>
          <BButton
            class="ml-2"
            :disabled="readOnly"
            v-show="selected.length > 0"
            variant="outline-primary"
            @click="removeEntitlementsModal.show()">
            {{ $t('common.remove') }}
          </BButton>
        </div>
      </BButtonToolbar>
    </BCardHeader>
    <div v-if="isLoading">
      <FrSpinner class="py-5" />
      <div class="text-center pb-4 font-bold">
        {{ $t('common.loading') }}
      </div>
    </div>
    <FrNoData
      v-else-if="items.length === 0"
      class="border-0 shadow-none"
      icon="people"
      body-class="mb-5"
      :title="$t('governance.access.noRecordFound', { grantType: 'entitlements' })"
      :subtitle="$t('governance.access.noResultsRole', { grantType: 'entitlement' })" />
    <BTable
      v-else
      :ref="(el) => grid = el"
      v-model:sort-by="sortBy"
      v-model:sort-desc="sortDesc"
      :busy="isLoading"
      class="mb-0"
      :class="{ 'cursor-pointer': true }"
      :fields="entitlementColumns"
      :items="entitlements"
      no-local-sorting
      no-sort-reset
      responsive
      selectable
      :read-only="readOnly"
      @row-selected="onRowSelected"
      @sort-changed="sortChanged">
      <template #head(selected)>
        <div
          class="cursor-pointer"
          @click="toggleSelectAll">
          <BFormCheckbox
            v-if="!readOnly"
            class="pl-3"
            disabled
            v-model="allRowsSelected">
            <span class="sr-only">
              {{ $t('common.select') }}
            </span>
          </BFormCheckbox>
        </div>
      </template>
      <template #cell(selected)="data">
        <BFormCheckbox
          class="pl-3"
          v-if="!readOnly"
          :id="`rowSelectCheckbox_entitlement_${data.index}`"
          @change="onCheckboxClicked(data)"
          v-model="data.rowSelected">
          <span class="sr-only">
            {{ $t('common.selectSelection', { selection: data.item.name || '' }) }}
          </span>
        </BFormCheckbox>
      </template>
      <template #cell(entitlement)="{ item }">
        <BMedia
          class="align-items-center"
          no-body>
          <BMediaAside class="align-self-center">
            <img
              class="size-24"
              :onerror="onImageError"
              :src="getApplicationLogo(item.application)"
              :alt="$t('common.logo')">
          </BMediaAside>
          <BMediaBody class="align-self-center overflow-hidden text-nowrap">
            <p class="h5 mb-0">
              {{ item.application?.name }}
            </p>
            {{ getApplicationDisplayName(item.application) }}
          </BMediaBody>
        </BMedia>
      </template>
    </BTable>
    <BModal
      id="addEntitlementsModal"
      :ref="(e) => addEntitlementsModal = e"
      :static="isTesting"
      no-close-on-backdrop
      no-close-on-esc
      :title="$t('common.addObject', { object: $t('common.entitlements') })"
      size="lg"
      @close="hideEntitlementModal()">
      <FrAppAndObjectType
        v-if="step === 0"
        override-scope-permission
        :label-text="$t('governance.entitlements.chooseEntitlementApplication')"
        @selected:application="application = $event"
        @input="updateAppAndObjectType" />
      <FrField
        v-else-if="step === 1"
        v-model="newEntitlements"
        :internal-search="false"
        :label="$t('governance.administer.roles.entitlements')"
        name="entitlementSelect"
        :options="entitlementOptions"
        type="multiselect"
        validation="required"
        @search-change="debouncedSearch" />
      <template #modal-footer>
        <BButton
          v-if="step === 1"
          variant="btn-link"
          @click="step = 0">
          {{ $t('common.previous') }}
        </BButton>
        <BButton
          class="ml-auto"
          variant="btn-link mr-2"
          @click="hideEntitlementModal()">
          {{ $t('common.cancel') }}
        </BButton>
        <BButton
          v-if="step === 0"
          variant="primary"
          @click="step = 1">
          {{ $t('common.next') }}
        </BButton>
        <BButton
          v-else
          variant="primary"
          :disabled="newEntitlements.length === 0"
          @click="updateRoleEntitlements('add')">
          {{ $t('common.add') }}
        </BButton>
      </template>
    </BModal>
    <BModal
      id="removeEntitlementsModal"
      :ref="(e) => removeEntitlementsModal = e"
      :title="$t('pages.access.removeModalTitle')"
      no-close-on-backdrop
      no-close-on-esc>
      <div>
        {{ $t('pages.access.removeConfirm', { type: $t('common.entitlements') }) }}
      </div>
      <template #modal-footer>
        <div class="w-100">
          <div class="float-right">
            <BButton
              variant="btn-link text-danger mr-2"
              @click="removeEntitlementsModal.hide()">
              {{ $t('common.cancel') }}
            </BButton>
            <BButton
              variant="danger"
              @click="updateRoleEntitlements('remove')">
              {{ $t('common.remove') }}
            </BButton>
          </div>
        </div>
      </template>
    </BModal>
  </BCard>
</template>

<script setup>
import {
  computed,
  ref,
  onMounted,
  watch,
} from 'vue';
import {
  BButton,
  BButtonToolbar,
  BCard,
  BCardHeader,
  BMedia,
  BMediaAside,
  BMediaBody,
  BModal,
  BTable,
} from 'bootstrap-vue';
import {
  debounce, filter, map,
} from 'lodash';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { getApplicationLogo, getApplicationDisplayName } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { getEntitlementList } from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import { getRoleDataById } from '@forgerock/platform-shared/src/api/governance/RoleApi';
import FrAppAndObjectType from '@forgerock/platform-shared/src/components/governance/LCM/Entitlements/Add/Steps/AppAndObjectType';

import i18n from '@/i18n';

// Composables
const { bvModal } = useBvModal();
const addEntitlementsModal = ref(null);
const allRowsSelected = ref(false);
const application = ref({});
const applicationId = ref('');
const entitlements = ref([]);
const entitlementCount = ref(0);
const entitlementOptions = ref([]);
const entitlementColumns = [
  {
    key: 'selected',
    label: '',
    class: 'checkbox-column',
  },
  {
    key: 'entitlement',
    label: i18n.global.t('common.entitlement'),
    initialSort: true,
    sortKey: 'application.name',
    sortable: true,
  },
  {
    key: 'descriptor.idx./entitlement.displayName',
    label: i18n.global.t('common.displayName'),
    sortKey: 'descriptor.idx./entitlement.displayName',
    sortable: true,
  },
  {
    key: 'item.objectType',
    label: 'Object Type',
    name: 'type',
    sortable: true,
    sortKey: 'item.objectType',
  },
];
const grid = ref(null);
const newEntitlements = ref([]);
const objectType = ref('');
const removeEntitlementsModal = ref(null);
const selected = ref([]);
const step = ref(0);

const newEntitlementIds = computed(() => map(newEntitlements.value, 'id'));

let debouncedSearch;

// emits
const emit = defineEmits(['update-tab-data']);

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  count: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  loadData: {
    type: Function,
    default: () => [],
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  request: {
    type: Object,
    default: () => ({}),
  },
  roleId: {
    type: String,
    default: '',
  },
  roleSchema: {
    type: Array,
    default: () => [],
  },
  roleStatus: {
    type: String,
    default: '',
  },
  createRolePermission: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
});

/**
 * Get the role's entitlements.
 */
async function loadRoleEntitlements() {
  if (props.request?.id) {
    const { data } = await getRoleDataById(props.roleId, props.roleStatus, 'entitlements', { pageSize: 100 }, props.request.id);
    emit('update-tab-data', 'entitlements', 'load', data);
  } else if (props.roleId !== 'new') {
    const { data } = await getRoleDataById(props.roleId, props.roleStatus, 'entitlements', { pageSize: 100 });
    emit('update-tab-data', 'entitlements', 'load', data);
  } else {
    emit('update-tab-data', 'entitlements', 'load', { result: [], totalHits: 0 });
  }
}

/**
 * Update the role's entitlements.
 * @param {string} operation - The operation to perform ('add' or 'remove').
 */
async function updateRoleEntitlements(operation) {
  const updatedEntitlementData = operation === 'add' ? newEntitlements.value : selected.value;
  emit('update-tab-data', 'entitlements', operation, updatedEntitlementData);
  newEntitlements.value = [];
  selected.value = [];
  addEntitlementsModal.value.hide();
  removeEntitlementsModal.value.hide();
}

/**
 * Hides the entitlement modal and resets all related form data to initial state.
 */
function hideEntitlementModal() {
  newEntitlements.value = [];
  step.value = 0;
  applicationId.value = '';
  objectType.value = '';
  addEntitlementsModal.value.hide();
}

/**
 * Handle row selection.
 * @param {Array} selectedItems - The selected row items.
 */
function onRowSelected(selectedItems) {
  selected.value = selectedItems;
  allRowsSelected.value = selectedItems.length === props.items.length;
}

/**
 * Handle checkbox click to select row.
 * @param {Object} row - The row with the selected checkbox.
 */
function onCheckboxClicked(row) {
  if (row.rowSelected) {
    grid.value.selectRow(row.index);
  } else {
    grid.value.unselectRow(row.index);
  }
}

/**
 * Handle selecting all rows.
 */
function toggleSelectAll() {
  if (!allRowsSelected.value) {
    grid.value.selectAllRows();
  } else {
    grid.value.clearSelected();
  }
}

/**
 * Query entitlements based on application, object type, and search value.
 * @param {string} searchValue - The search query to filter entitlements.
 */
async function queryEntitlements(searchValue) {
  const query = {
    _pageSize: 10,
    _pagedResultsOffset: 0,
    _fields: 'application,assignment,descriptor,glossary,entitlement,catalog.id,item',
    _queryFilter: `application.id eq '${applicationId.value}' and item.objectType eq '${objectType.value}'`,
  };
  if (searchValue) {
    query._queryFilter += ` and descriptor.idx./entitlement.displayName co '${searchValue}'`;
  }
  const { data } = await getEntitlementList(null, query);
  const results = filter(data.result, (ent) => !newEntitlementIds.value.includes(ent.id));
  entitlementOptions.value = map(results, (ent) => ({
    text: ent.descriptor.idx['/entitlement'].displayName,
    value: ent,
  }));
}

/**
 * Update the selected application ID and object type
 * @param {Object} value - application id and object type values.
 */
function updateAppAndObjectType(value) {
  applicationId.value = value?.applicationId || '';
  objectType.value = value?.objectType || '';
  if (value && value.applicationId && value.objectType) {
    queryEntitlements();
  }
}

watch(() => props.items, () => {
  entitlements.value = props.items;
  entitlementCount.value = props.count;
}, { deep: true, immediate: true });

onMounted(() => {
  debouncedSearch = debounce(queryEntitlements, 500);
  loadRoleEntitlements();
});

</script>
<style lang="scss" scoped>
:deep(.table td.checkbox-column) {
  width: 30px;
}

:deep(.w-65) {
  width: 65% !important;
}
</style>
