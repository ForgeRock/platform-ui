<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    no-body
    class="resource-tab-card">
    <template #header>
      <h5 class="mb-0">
        <BButton
          class="w-100 d-flex align-items-center p-0 text-left cursor-pointer"
          variant="link"
          aria-controls="resource-tab-collapse"
          :aria-expanded="isCollapsed ? 'false' : 'true'"
          @click="isCollapsed = !isCollapsed">
          <FrIcon
            v-if="props.icon"
            :icon-class="`size-28 rounded-circle d-flex align-items-center justify-content-center mr-2 color-dark${props.iconColor} bg-light${props.iconColor}`"
            :name="props.icon" />
          <span class="mr-2">{{ resourceLabel }}</span>
          <BBadge
            v-if="totalCount > 0"
            class="ml-1"
            pill
            variant="info">
            {{ totalCount }}
          </BBadge>
          <FrIcon
            class="ml-auto"
            :name="isCollapsed ? 'chevron_right' : 'keyboard_arrow_down'" />
        </BButton>
      </h5>
    </template>
    <BCollapse
      id="resource-tab-collapse"
      :visible="!isCollapsed">
      <div v-if="isLoading">
        <FrSpinner class="py-5" />
      </div>
      <template v-else>
        <FrNoData
          v-if="!items.length"
          icon="inventory_2"
          body-class="mb-5"
          :subtitle="$t('governance.agents.details.noAssociatedEntities', { entities: resourceLabel })" />
        <template v-else>
          <BTable
            class="mb-0"
            responsive
            tbody-tr-class="cursor-pointer"
            :fields="fields"
            :items="items"
            @row-clicked="selectedItem = $event">
            <template #cell(name)="{ item }">
              <div class="d-flex align-items-center">
                <FrIcon
                  v-if="props.icon"
                  :icon-class="`size-28 rounded-circle d-flex align-items-center justify-content-center mr-2 color-dark${props.iconColor} bg-light${props.iconColor}`"
                  :name="props.icon" />
                {{ item.name }}
              </div>
            </template>
            <template #cell(actions)="{ item }">
              <FrActionsCell
                :delete-option="false"
                :edit-option="false"
                :divider="false"
                :test-id="item.id">
                <template #custom-top-actions>
                  <BDropdownItem @click.stop="selectedItem = item">
                    <FrIcon
                      icon-class="mr-2"
                      name="visibility">
                      {{ $t('common.viewDetails') }}
                    </FrIcon>
                  </BDropdownItem>
                </template>
              </FrActionsCell>
            </template>
          </BTable>
          <FrPagination
            v-if="totalCount > 0"
            :value="currentPage"
            :per-page="pageSize"
            :total-rows="totalCount"
            :current-page-rows="items.length"
            @input="loadPage"
            @on-page-size-change="onPageSizeChange" />
        </template>
      </template>
    </BCollapse>
  </BCard>

  <BModal
    v-if="selectedItem"
    id="resource-detail-modal"
    visible
    size="lg"
    title-class="h5"
    title-tag="h2"
    :title="selectedItem.name"
    @hide="selectedItem = null">
    <BRow>
      <template
        v-for="(value, key) in selectedItem.sourceObject"
        :key="key">
        <BCol
          sm="3"
          class="font-weight-bold text-truncate mb-3">
          {{ schemaProperties[key]?.displayName || key }}
        </BCol>
        <BCol
          sm="9"
          class="text-muted mb-3 resource-detail-value">
          {{ value }}
        </BCol>
      </template>
    </BRow>
    <template #modal-footer>
      <BButton
        variant="primary"
        @click="selectedItem = null">
        {{ $t('common.close') }}
      </BButton>
    </template>
  </BModal>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  BBadge, BButton, BCard, BCol, BCollapse, BDropdownItem, BModal, BRow, BTable,
} from 'bootstrap-vue';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getAgentResources } from '@forgerock/platform-shared/src/api/governance/AgentApi';
import { getObjectTypeSchema } from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import i18n from '@/i18n';

const props = defineProps({
  agentId: {
    type: String,
    required: true,
  },
  resourceType: {
    type: String,
    required: true,
  },
  resourceLabel: {
    type: String,
    required: true,
  },
  nameProperty: {
    type: String,
    default: '__NAME__',
  },
  descriptionProperty: {
    type: String,
    default: 'description',
  },
  icon: {
    type: String,
    default: '',
  },
  iconColor: {
    type: String,
    default: '',
  },
});

const isLoading = ref(true);
const isCollapsed = ref(false);
const items = ref([]);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const selectedItem = ref(null);
const schemaProperties = ref({});

const fields = [
  {
    key: 'name',
    label: i18n.global.t('common.name'),
    class: 'w-50',
  },
  {
    key: 'description',
    label: i18n.global.t('common.description'),
    class: 'w-40',
  },
  {
    key: 'actions',
    label: '',
    class: 'w-120px fr-no-resize sticky-right',
  },
];

async function loadPage(page = 1) {
  currentPage.value = page;
  isLoading.value = true;
  try {
    const { data } = await getAgentResources(props.agentId, props.resourceType, {
      pageSize: pageSize.value,
      pageNumber: page - 1,
    });
    items.value = (data?.result || []).map((item) => {
      const source = item.sourceObject || item;
      return {
        ...item,
        name: source[props.nameProperty] || item.displayName || item.id || '',
        description: source[props.descriptionProperty] || '',
      };
    });
    totalCount.value = data?.totalCount || 0;

    if (page === 1 && !Object.keys(schemaProperties.value).length) {
      const firstItem = data?.result?.[0];
      if (firstItem?.applicationId && firstItem?.objectType) {
        try {
          const { data: schema } = await getObjectTypeSchema(firstItem.applicationId, firstItem.objectType);
          schemaProperties.value = schema?.properties || {};
        } catch {
          // schema is optional — fall back to raw keys
        }
      }
    }
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.agents.errors.errorLoadingResources'));
  } finally {
    isLoading.value = false;
  }
}

function onPageSizeChange(size) {
  pageSize.value = size;
  loadPage(1);
}

onMounted(() => loadPage(1));
</script>

<style lang="scss" scoped>
// Resource source values can be long URLs/identifiers; let them wrap instead of
// forcing horizontal scroll at narrow viewports.
.resource-detail-value {
  overflow-wrap: anywhere;
}

// The global theme gives every .table cell a top border; inside this card that
// duplicates the card header's bottom divider, so drop it on the header row only.
:deep(.table) {
  thead th {
    border-top: none;
  }
}

// The shared `.card` theme rule (border shorthand + box-shadow) beats Bootstrap's
// border-0 utility; !important is the only way past it without touching shared scss.
.resource-tab-card {
  border: none !important;
  box-shadow: none !important;
}
</style>
