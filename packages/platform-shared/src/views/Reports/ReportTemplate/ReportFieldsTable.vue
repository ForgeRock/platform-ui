<!-- Copyright 2023-2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->

<template>
  <BContainer class="overflow-hidden mt-5">
    <BCard
      v-if="!tableEntries.length"
      class="text-center py-2">
      <BCardTitle
        class="h4 mb-2"
        title-tag="h3">
        {{ $t('reports.template.noColumnsAdded') }}
      </BCardTitle>
      <BCardText>
        {{ $t('reports.template.filtersSettingDescription') }}
      </BCardText>
    </BCard>
    <BCard
      v-else
      no-body>
      <BTableSimple
        ref="entityColumnSelectionTable"
        responsive>
        <BThead>
          <BTr>
            <BTh
              v-for="(column, index) in tableEntries"
              :key="index"
              class="p-0">
              <FrField
                :floating-label="false"
                :input-class="`
                  ${index !== 0 ? 'px-3' : ''}
                  border-0
                  font-weight-bold
                  rounded-0
                  py-3
                  data-source-label-input
                `"
                :name="column.label"
                :placeholder="$t('common.label')"
                :value="column.context === 'AGGREGATE' ? column.label : column.columnLabel"
                @input="updateLabel(column, $event)"
                type="string" />
            </BTh>
          </BTr>
        </BThead>
        <BTbody>
          <BTr>
            <BTd
              v-for="(column, index) in tableEntries"
              :key="index"
              class="px-2 py-4 text-nowrap">
              <div class="mx-2">
                &#123;{{ column.context }}&#125;
              </div>
            </BTd>
          </BTr>
        </BTbody>
      </BTableSimple>
    </BCard>
  </BContainer>
</template>

<script setup>
/**
 * @description
 * Create report table that displays the selected data source columns
 * and aggregates along with the ability for the user to edit the
 * selection labels through the table headings.
 */
import {
  computed,
  nextTick,
  ref,
  watch,
} from 'vue';
import {
  BCard,
  BCardTitle,
  BCardText,
  BContainer,
  BTableSimple,
  BTbody,
  BTd,
  BTh,
  BThead,
  BTr,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import i18n from '@/i18n';

const emit = defineEmits(['update-table-entry-label', 'disable-template-save']);
const props = defineProps({
  dataSources: {
    type: Array,
    default: () => [],
  },
  aggregates: {
    type: Array,
    default: () => [],
  },
});

// global
const entityColumnSelectionTable = ref(null);

// computed
const tableEntries = computed(() => {
  const selectedColumns = [];
  let aggregates = [];

  props.dataSources.forEach((entity) => {
    if (entity && entity.selectedColumns?.length) {
      const columns = entity.selectedColumns.map((source) => {
        const dataSourceColumnMatch = entity.dataSourceColumns.find((column) => column.path === source);
        return {
          ...dataSourceColumnMatch,
          context: dataSourceColumnMatch.path,
          settingId: 'entities',
        };
      });
      selectedColumns.push(...columns);
    }
  });

  if (props.aggregates.length) {
    aggregates = props.aggregates.map(({ label }, definitionIndex) => ({
      context: i18n.global.t('common.aggregate').toUpperCase(),
      definitionIndex,
      label,
      settingId: 'aggregate',
    }));
  }
  return [...selectedColumns, ...aggregates];
});
const atLeastOneLabelIsEmpty = computed(() => tableEntries.value.filter(({ context, columnLabel, label }) => {
  if (context === 'AGGREGATE') {
    return !label;
  }
  return !columnLabel;
}));

// functions
/**
 * Data source columns as well as aggregates are what makes up the list of tableEntries.
 * The 'path' destructured parameter is associated with data source columns and the definitionIndex
 * is associated with aggregates and both of these values are used for updating a changed label.
 * @param {Object} obj tableEntries destructured object
 * @param {String} obj.settingId Report settings ID
 * @param {String} obj.path data source path
 * @param {String} obj.definitionIndex aggregate object index
 * @param {String} inputText label text input
 */
function updateLabel({ settingId, path, definitionIndex }, inputText) {
  const columnMatch = tableEntries.value.find((entry) => (entry.path || entry.definitionIndex) === (path || definitionIndex));
  if (columnMatch.columnLabel !== inputText) {
    emit('update-table-entry-label', settingId, (path || definitionIndex), inputText);
  }
}

// watchers
watch(tableEntries, (current, previous) => {
  // Scrolls the table to the right on selection change so the most recent
  // selection displays within the table element, otherwise there isn't a visual
  // queue that a new element gets added if the selection is hidden by overflow.
  if (current.length !== previous.length) {
    nextTick(() => {
      const tableElement = entityColumnSelectionTable?.value?.$el;
      const tableHorizontalScrollWidth = tableElement ? tableElement.scrollWidth : 0;
      if (tableElement) {
        tableElement.scrollLeft = tableHorizontalScrollWidth;
      }
    });
  }
});

watch(atLeastOneLabelIsEmpty, (emptyList) => {
  if (emptyList.length) {
    emit('disable-template-save', true);
  }
});
</script>

<style lang="scss" scoped>
  :deep(.table) {
    table-layout: unset;
  }

  :deep(.data-source-label-input) {
    margin-top: 1px;
  }

  :deep(.form-label-group .form-label-group-input) {
    padding-right: 1px;
  }
</style>
