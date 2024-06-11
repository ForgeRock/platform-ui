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
        class="h5 m-0 d-flex align-items-start flex-column justify-content-center text-left"
        title-tag="h4">
        <small
          v-if="relatedPath"
          class="d-block text-muted">
          {{ relatedPath }}
        </small>
        {{ currentName }}
      </BCardTitle>
      <FrActionsCell
        wrapper-class="ml-auto"
        :divider="false"
        :edit-option="false"
        @delete-clicked.stop="$emit('delete-data-source')" />
      <FrIcon
        icon-class="pl-2"
        :name="showAccordion ? 'expand_less' : 'expand_more'" />
    </BButton>
    <BCollapse
      class="px-3 mb-3"
      :class="{'margin-top-offset': !relatedPath.length}"
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
              v-for="(option, index) in dataSourceColumns"
              class="mb-2 py-2 px-3 border-0 rounded"
              :class="selectedColumns.find((value) => value === option.value) ? 'bg-lightblue' : 'bg-light'"
              :key="index">
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
        class="d-none"
        :label="$t('reports.template.relatedDataSources')">
        <BListGroup :aria-describedby="ariaDescribedby">
          <BListGroupItem
            v-for="(entity, index) in relatedDataSources"
            class="d-flex align-items-center mb-2 py-2 px-3 border-0 rounded justify-content-between"
            data-testid="related-entity-list-item"
            :class="selectedRelatedDataSources.includes(entity) ? 'bg-lightblue' : 'bg-light'"
            :key="index">
            <p class="m-0">
              {{ entity }}
            </p>
            <FrSpinner
              v-if="currentEntityBeingFetched === entity && !selectedRelatedDataSources.includes(entity)"
              class="ml-auto opacity-50"
              size="sm" />
            <BDropdown
              v-else-if="!selectedRelatedDataSources.includes(entity)"
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
              <BDropdownItem @click="addRelatedEntity(entity)">
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
  'set-column-selections',
  'set-related-data-sources',
]);
const props = defineProps({
  dataSourceColumns: {
    type: Array,
    default: () => [],
  },
  name: {
    type: String,
    default: '',
  },
  relatedDataSources: {
    type: Array,
    default: () => [],
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
const relatedPath = computed(() => {
  const nameArray = props.name.split('.');
  nameArray.pop();
  if (nameArray.length) {
    return `${nameArray.join(' / ')} /`;
  }
  return '';
});
const showAccordion = ref(false);

// Functions
function addRelatedEntity(entity) {
  currentEntityBeingFetched.value = entity;
  emit('set-related-data-sources', entity);
}

// Computed
const currentName = computed(() => props.name.split('.').pop());
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
