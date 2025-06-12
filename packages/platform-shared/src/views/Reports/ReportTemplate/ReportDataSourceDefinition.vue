<!-- Copyright (c) 2024-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    body-class="p-0"
    class="shadow-none mb-2">
    <BButton
      class="fr-card-header d-flex align-items-center p-3 w-100 text-decoration-none text-body"
      variant="link"
      @click="showAccordion = !showAccordion">
      <BCardTitle
        class="h5 m-0 d-flex align-items-start flex-column justify-content-center text-left text-break"
        title-tag="h4">
        <small
          v-if="dataSourceIsRelated"
          class="d-block text-muted">
          {{ parentDataSourcePathLabel }}
        </small>
        {{ currentName }}
      </BCardTitle>
      <FrSpinner
        v-if="reportIsLoading || dataSourceBeingDeleted === dataSource"
        class="ml-auto"
        size="sm" />
      <FrActionsCell
        v-else
        wrapper-class="ml-auto"
        :divider="false"
        :edit-option="false"
        @delete-clicked.stop="$emit('delete-data-source')">
        <template #custom-top-actions>
          <BDropdownItem
            v-if="dataSourceIsRelated"
            @click.stop="$emit('related-entity-settings')">
            <FrIcon
              icon-class="mr-2"
              name="settings">
              {{ $t('common.settings') }}
            </FrIcon>
          </BDropdownItem>
        </template>
      </FrActionsCell>
      <FrIcon
        icon-class="pl-2"
        :name="showAccordion ? 'expand_less' : 'expand_more'" />
    </BButton>
    <BCollapse
      class="px-3 mb-3"
      :class="{'margin-top-offset': !dataSourcePathLabel.length}"
      :visible="showAccordion">
      <BFormGroup
        v-slot="{ ariaDescribedby }"
        :label="$t('reports.template.availableColumns')">
        <BFormCheckboxGroup
          v-if="dataSourceColumns.length"
          v-model="columnsModel"
          name="data-source-columns"
          :aria-describedby="ariaDescribedby">
          <BListGroup>
            <BListGroupItem
              v-for="column in dataSourceColumns"
              class="mb-2 py-2 px-3 border-0 rounded"
              :class="selectedColumns.find((value) => value.path === column.path) ? 'bg-lightblue' : 'bg-light'"
              :key="column.path">
              <BFormCheckbox :value="column.path">
                {{ column.label }}
              </BFormCheckbox>
            </BListGroupItem>
          </BListGroup>
        </BFormCheckboxGroup>
        <BCardText v-else>
          <small>
            {{ $t('reports.template.noColumns') }}
          </small>
        </BCardText>
      </BFormGroup>
      <BFormGroup
        v-if="relatedDataSources.length"
        v-slot="{ ariaDescribedby }"
        :label="$t('reports.template.relatedDataSources')">
        <BListGroup :aria-describedby="ariaDescribedby">
          <BListGroupItem
            v-for="({ label, name }) in relatedDataSources"
            class="d-flex align-items-center mb-2 py-2 px-3 border-0 rounded justify-content-between"
            data-testid="related-entity-list-item"
            :class="selectedRelatedDataSourcePaths.includes(name) ? 'bg-lightblue' : 'bg-light'"
            :key="name">
            <p class="m-0">
              {{ label }}
            </p>
            <FrSpinner
              v-if="currentEntityBeingFetched === name && !selectedRelatedDataSourcePaths.includes(name)"
              class="ml-auto opacity-50"
              size="sm" />
            <BDropdown
              v-else-if="!selectedRelatedDataSourcePaths.includes(name)"
              class="p-0 ml-auto"
              no-caret
              right
              toggle-class="text-decoration-none p-0"
              variant="link">
              <template #button-content>
                <FrIcon
                  icon-class="text-dark md-18"
                  name="add" />
              </template>
              <BDropdownItem @click="addRelatedEntity(name, label)">
                <FrIcon
                  icon-class="mr-2"
                  name="add">
                  {{ $t('reports.template.addAsDataSource') }}
                </FrIcon>
              </BDropdownItem>
            </BDropdown>
            <FrIcon
              v-else
              icon-class="text-success md-18 ml-auto"
              name="check" />
          </BListGroupItem>
        </BListGroup>
      </BFormGroup>
    </BCollapse>
  </BCard>
</template>

<script setup>
/**
 * @description
 * Data sources setting accordion block definition
 */
import {
  BButton,
  BCard,
  BCardText,
  BCardTitle,
  BCollapse,
  BDropdown,
  BDropdownItem,
  BFormGroup,
  BFormCheckbox,
  BFormCheckboxGroup,
  BListGroup,
  BListGroupItem,
} from 'bootstrap-vue';
import { ref, computed, watch } from 'vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

const emit = defineEmits([
  'delete-data-source',
  'related-entity-settings',
  'set-column-selections',
  'set-related-data-source',
]);
const props = defineProps({
  dataSource: {
    type: String,
    default: '',
  },
  dataSourceBeingDeleted: {
    type: String,
    default: '',
  },
  dataSourceColumns: {
    type: Array,
    default: () => [],
  },
  dataSourcePathLabel: {
    type: String,
    default: '',
  },
  relatedDataSources: {
    type: Array,
    default: () => [],
  },
  reportIsLoading: {
    type: Boolean,
    default: false,
  },
  selectedColumns: {
    type: Array,
    default: () => [],
  },
  selectedRelatedDataSources: {
    type: Array,
    default: () => [],
  },
});

// Globals
const currentEntityBeingFetched = ref('');
const showAccordion = ref(false);

// Functions
function addRelatedEntity(dataSourceName, label) {
  currentEntityBeingFetched.value = dataSourceName;
  emit('set-related-data-source', { path: dataSourceName, label });
}

// Computed
const columnsModel = computed({
  get() {
    return props.selectedColumns.map((column) => column.path);
  },
  /**
   * complete data source field option column selections
   * @param {Array} values list of all column selections
   */
  set(values) {
    emit('set-column-selections', values);
  },
});
const parentDataSourcePathLabel = computed(() => {
  const arr = props.dataSourcePathLabel.split(' / ');
  arr.pop(); // Remove the last element which is the current name which is not needed here
  return `${arr.join(' / ')} /`;
});
const dataSourceIsRelated = computed(() => props.dataSourcePathLabel.split(' / ').length > 1);
const currentName = computed(() => props.dataSourcePathLabel.split(' / ').pop());
const selectedRelatedDataSourcePaths = computed(() => props.selectedRelatedDataSources.map(({ path }) => path));

// Watchers
watch(() => props.selectedRelatedDataSources, (entityPath) => {
  const paths = entityPath.map(({ path }) => path);
  if (paths.includes(currentEntityBeingFetched.value)) {
    currentEntityBeingFetched.value = '';
  }
});

// Start
(() => {
  // Purposeful delay to reveal the data source accordion on component mount
  // to give the user a guided visual connection of their previous selection.
  setTimeout(() => { showAccordion.value = true; }, 1000);
})();
</script>

<style lang="scss" scoped>
  :deep(fieldset) legend {
    font-size: 0.75rem;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  :deep(.form-group) {
    margin-bottom: 1.5rem;
  }

  :deep(.list-group-item) {
    cursor: default;
    min-height: 40px;
  }

  :deep(.custom-checkbox) {
    width: 100%;

    .custom-control-label {
      width: 100%;

      &:hover {
        cursor: pointer;
      }
    }
  }

  .fr-card-header {
    min-height: 68px;
  }

  .margin-top-offset {
    margin-top: -7px;
  }
</style>
