<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

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
          v-if="entityNamePath"
          class="d-block text-muted">
          {{ entityNamePath }}
        </small>
        {{ currentName }}
      </BCardTitle>
      <FrSpinner
        v-if="reportIsLoading"
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
            v-if="entityNamePath"
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
      :class="{'margin-top-offset': !entityNamePath.length}"
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
              v-for="(option) in dataSourceColumns"
              class="mb-2 py-2 px-3 border-0 rounded"
              :class="selectedColumns.find((value) => value === option.value) ? 'bg-lightblue' : 'bg-light'"
              :key="option.dataSource">
              <BFormCheckbox :value="option.value">
                {{ option.label }}
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
            v-for="(dataSourceName, index) in relatedDataSources"
            class="d-flex align-items-center mb-2 py-2 px-3 border-0 rounded justify-content-between"
            data-testid="related-entity-list-item"
            :class="selectedRelatedDataSources.includes(dataSourceName) ? 'bg-lightblue' : 'bg-light'"
            :key="index">
            <p class="m-0">
              {{ dataSourceName }}
            </p>
            <FrSpinner
              v-if="currentEntityBeingFetched === dataSourceName && !selectedRelatedDataSources.includes(dataSourceName)"
              class="ml-auto opacity-50"
              size="sm" />
            <BDropdown
              v-else-if="!selectedRelatedDataSources.includes(dataSourceName)"
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
              <BDropdownItem @click="addRelatedEntity(dataSourceName)">
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
  'set-related-data-sources',
]);
const props = defineProps({
  dataSource: {
    type: String,
    default: '',
  },
  dataSourceColumns: {
    type: Array,
    default: () => [],
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
const entityNamePath = computed(() => {
  const nameArray = props.dataSource.split('.');
  nameArray.pop();
  if (nameArray.length) {
    return `${nameArray.join(' / ')} /`;
  }
  return '';
});
const showAccordion = ref(false);

// Functions
function addRelatedEntity(dataSourceName) {
  currentEntityBeingFetched.value = dataSourceName;
  const dataSourcePath = `${props.dataSource}.${dataSourceName}`;
  emit('set-related-data-sources', dataSourcePath);
}

// Computed
const currentName = computed(() => props.dataSource.split('.').pop());
const columnsModel = computed({
  get() {
    return props.selectedColumns;
  },
  /**
   * complete data source field option column selections
   * @param {Array} values list of all column selections
   */
  set(values) {
    emit('set-column-selections', values);
  },
});

// Watchers
watch(() => props.selectedRelatedDataSources, (entities) => {
  if (entities.includes(currentEntityBeingFetched.value)) {
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
