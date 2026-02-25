<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <slot name="header" />
    <FrSpinner
      v-if="isLoading"
      class="py-5" />
    <BTable
      v-else-if="items.length"
      :aria-label="listName"
      class="border-top mb-0"
      v-resizable-table="{ persistKey: `governance-access-modeling-list-${listName}` }"
      responsive
      hover
      tbody-tr-class="cursor-pointer"
      :fields="fields"
      :items="items"
      v-model:sort-by="sortBy"
      v-model:sort-desc="sortDesc"
      @sort-changed="$emit('sort-change', $event)"
      @row-clicked="navigateToDetails">
      <template #cell(details)="{ item }">
        <BMedia
          v-if="item.details"
          class="align-items-center">
          <BMediaBody class="align-self-center text-truncate">
            <h2 class="h5 mb-2">
              {{ item.name }}
            </h2>
          </BMediaBody>
        </BMedia>
      </template>
      <template #cell(name)="{ item }">
        <span class="d-flex align-items-center">{{ item.name }}
          <BBadge
            v-if="item.recommendations?.entitlements || item.recommendations?.justifications"
            class="ml-2 text-white"
            pill
            variant="info">
            {{ item.recommendations.entitlements + item.recommendations.justifications }}
          </BBadge>
        </span>
      </template>
      <template #cell(status)="{ item }">
        <BBadge
          class="text-capitalize pl-2 pr-2 font-weight-normal"
          :variant="variantsByStatus[item.status]">
          {{ item.status }}
        </BBadge>
      </template>
      <template #cell(actions)="{ item }">
        <slot
          name="actions"
          :item="item" />
      </template>
    </BTable>
    <template v-else>
      <slot name="no-data" />
    </template>
    <slot name="footer" />
  </div>
</template>

<script setup>

import {
  BBadge,
  BTable,
  BMedia,
  BMediaBody,
} from 'bootstrap-vue';
import {
  ref,
  watch,
  computed,
} from 'vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import i18n from '@/i18n';

const variantsByStatus = {
  active: 'success',
  draft: 'warning',
  candidate: 'light',
};

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  roleStatus: {
    type: String,
    default: 'active',
  },
  roles: {
    type: Array,
    default: () => [],
  },
  sortParams: {
    type: Object,
    default: () => {},
  },
  listName: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['open-detail', 'sort-change']);

const items = ref([]);
const sortBy = ref(null);
const sortDesc = computed(() => props.sortParams?.sortDir === 'desc');
const fields = [
  {
    key: 'name',
    label: i18n.global.t('common.name'),
    sortable: true,
  },
  {
    key: 'memberCount',
    label: i18n.global.t('governance.accessModeling.members'),
    sortable: true,
  },
  {
    key: 'entitlementCount',
    label: i18n.global.t('common.entitlements'),
    sortable: true,
  },
  {
    key: 'status',
    label: i18n.global.t('common.status'),
  },
  {
    key: 'actions',
    label: '',
    class: 'w-120px fr-no-resize sticky-right',
  },
];

/**
 * Navigate to the details page for the selected role.
 * @param {Object} role - The selected role object.
 */
function navigateToDetails(role) {
  emit('open-detail', role);
}

watch(() => props.roles, (newRoles) => {
  items.value = newRoles;
}, { immediate: true });

</script>
<style lang="scss" scoped>
.w-200px {
  width: 200px;
}

:deep(.w-65) {
  width: 65% !important;
}
</style>
