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
            @click="bvModal.show('addMembersModal')">
            <FrIcon
              icon-class="mr-2"
              name="add">
              {{ $t('common.addObject', { object: relationshipArrayProperty?.title }) }}
            </FrIcon>
          </BButton>
          <BButton
            v-show="selected.length > 0"
            class="ml-2"
            variant="outline-primary"
            @click="removeMembersModal.show()">
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
      data-testid="gov-resource-table-no-results-first-load"
      :title="$t('governance.access.noRecordFound', { grantType: 'users' })"
      :subtitle="$t('governance.access.noResultsRole', { grantType: 'user' })" />
    <BTable
      v-else
      :ref="(el) => grid = el"
      v-model:sort-by="sortBy"
      v-model:sort-desc="sortDesc"
      :busy="isLoading"
      class="mb-0"
      :class="{ 'cursor-pointer': true }"
      :fields="memberColumns"
      :items="props.items"
      no-local-sorting
      no-sort-reset
      responsive
      selectable
      @row-selected="onRowSelected"
      @sort-changed="sortChanged">
      <template #head(selected)>
        <div
          v-if="!readOnly"
          class="cursor-pointer"
          @click="toggleSelectAll">
          <BFormCheckbox
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
          v-if="!readOnly"
          class="pl-3"
          :id="`rowSelectCheckbox_user_${data.index}`"
          @change="onCheckboxClicked(data)"
          v-model="data.rowSelected">
          <span class="sr-only">
            {{ $t('common.selectSelection', { selection: data.item.name || '' }) }}
          </span>
        </BFormCheckbox>
      </template>
    </BTable>
    <BModal
      cancel-variant="link"
      id="addMembersModal"
      no-close-on-backdrop
      no-close-on-esc
      :ok-disabled="newMembers.length === 0"
      :ok-title="$t('common.save')"
      ref="addMembersModal"
      :static="isTesting"
      :title="$t('common.addObject', { object: relationshipArrayProperty?.title })"
      size="lg"
      @ok="updateRoleMembers('add')">
      <FrRelationshipEdit
        parent-resource="managed/alpha_role"
        :relationship-property="relationshipArrayProperty"
        :show-time-constraints-switch="false"
        :index="0"
        @setValue="onSelectAdditionalMembers" />
    </BModal>
    <BModal
      id="removeMembersModal"
      :ref="(e) => removeMembersModal = e"
      no-close-on-backdrop
      no-close-on-esc
      cancel-variant="outline-secondary"
      ok-variant="danger"
      :ok-title="$t('common.remove')"
      :title="$t('pages.access.removeModalTitle')"
      @cancel="removeMembersModal.hide()"
      @ok="updateRoleMembers('remove')">
      <div>
        {{ $t('pages.access.removeConfirm', { type: relationshipArrayProperty?.title }) }}
      </div>
    </BModal>
  </BCard>
</template>

<script setup>
import {
  computed,
  ref,
  onMounted,
} from 'vue';
import {
  BButton,
  BButtonToolbar,
  BCard,
  BCardHeader,
  BFormCheckbox,
  BModal,
  BTable,
} from 'bootstrap-vue';
import { find } from 'lodash';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrRelationshipEdit from '@forgerock/platform-shared/src/components/resource/RelationshipEdit';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { getRoleDataById } from '@forgerock/platform-shared/src/api/governance/RoleApi';

import i18n from '@/i18n';

// Composables
const { bvModal } = useBvModal();

const grid = ref(null);
const removeMembersModal = ref(null);
const relationshipProperty = ref(null);
const isFirstLoad = ref(true);
const selected = ref([]);
const allRowsSelected = ref(false);
const newMembers = ref([]);
const memberColumns = [
  {
    key: 'selected',
    label: '',
    class: 'checkbox-column',
  },
  {
    key: 'userName',
    label: i18n.global.t('common.user.userName'),
    initialSort: true,
    sortKey: 'userName',
    sortable: true,
  },
  {
    key: 'givenName',
    label: i18n.global.t('governance.user.firstName'),
    sortKey: 'givenName',
    sortable: true,
  },
  {
    key: 'sn',
    label: i18n.global.t('governance.user.lastName'),
    sortKey: 'sn',
    sortable: true,
  },
];

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
  isTesting: {
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
  role: {
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
});

const relationshipArrayProperty = computed(() => find(props.roleSchema, (schema) => schema.propName === 'members'));

/**
 * Get the role's members.
 */
async function loadRoleMembers() {
  if (props.request?.id) {
    const { data } = await getRoleDataById(props.roleId, props.roleStatus, 'members', { pageSize: 100 }, props.request.id);
    emit('update-tab-data', 'members', 'load', data);
  } else if (isFirstLoad.value && props.roleId !== 'new') {
    const { data } = await getRoleDataById(props.roleId, props.roleStatus, 'members', { pageSize: 100 });
    emit('update-tab-data', 'members', 'load', data);
    isFirstLoad.value = false;
    return { data };
  }
  return {
    data: {
      results: props.items,
    },
  };
}

/**
 * Update members of the role.
 * @param {string} operation - The operation to perform ('add' or 'remove').
 */
async function updateRoleMembers(operation) {
  const updatedMemberData = operation === 'add' ? newMembers.value : selected.value;
  emit('update-tab-data', 'members', operation, updatedMemberData);
  removeMembersModal.value.hide();
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
 * Handle row selection.
 * @param {Array} selectedItems - The selected row items.
 */
function onRowSelected(selectedItems) {
  selected.value = selectedItems;
  allRowsSelected.value = selectedItems.length === props.items.length;
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
 * Handle selecting additional members
 * @param {Array} val - The array of selected users.
 */
async function onSelectAdditionalMembers(val) {
  const userFilter = val.map((user) => `_id eq '${user._ref.split('/').pop()}'`).join(' or ');
  const params = {
    _queryFilter: userFilter,
    fields: 'userName,sn,givenName,profileImage,_id',
    sortKeys: 'userName',
  };
  const { data } = await getManagedResourceList('alpha_user', params);
  newMembers.value = data?.result?.map((user) => ({
    ...user,
    usr_id: user._id,
    usr_name: `${user.givenName} ${user.sn}`,
  })) || [];
}

onMounted(() => {
  relationshipProperty.value = find(props.roleSchema, { propName: 'members' });
  loadRoleMembers();
});

</script>

<style lang="scss" scoped>
:deep(.w-65) {
  width: 65% !important;
}
</style>
