<!-- Copyright (c) 2023-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    fluid
    class="overflow-hidden mt-5">
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
        v-resizable-table="{ persistKey: 'reports-fields-table' }"
        ref="entityColumnSelectionTable"
        responsive>
        <BThead>
          <Draggable
            v-model="tableEntries"
            drag-class="drag-item"
            handle=".handle"
            item-key="path"
            ghost-class="ghost-item"
            tag="BTr"
            :force-fallback="true"
            :move="handleMove"
            @change="handleColumnOrderUpdate"
          >
            <template #item="{ element }">
              <BTh
                class="p-0"
                role="columnheader">
                <div class="d-flex">
                  <FrField
                    class="flex-grow-1"
                    input-class="th-input border-0 font-weight-bold rounded-0 py-3 data-source-label-input"
                    :floating-label="false"
                    :name="element.label"
                    :placeholder="$t('common.label')"
                    :value="element.context === 'AGGREGATE' ? element.label : element.columnLabel"
                    @input="updateLabel(element, $event)"
                    type="string" />
                  <BButton
                    v-if="tableEntries.length > 1 && element.context !== 'AGGREGATE'"
                    class="cursor-grab handle px-2"
                    variant="link text-dark"
                  >
                    <FrIcon
                      name="drag_indicator" />
                  </BButton>
                </div>
              </BTh>
            </template>
          </Draggable>
        </BThead>
        <BTbody>
          <BTr>
            <BTd
              v-for="(column, index) in tableEntries"
              :key="index"
              class="px-1 py-4">
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
  BButton,
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
import Draggable from 'vuedraggable';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
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
    if (entity?.selectedColumns?.length) {
      entity.selectedColumns.forEach((source) => {
        const dataSourceColumnMatch = entity.dataSourceColumns.find((column) => column.path === source.path);
        selectedColumns[source.order] = {
          ...dataSourceColumnMatch,
          context: dataSourceColumnMatch.path,
          settingId: 'entities',
        };
      });
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
  // Using trim to remove blank spaces, else it may trigger to enable the save button
  if (context === 'AGGREGATE') {
    return !label.trim();
  }
  return !columnLabel.trim();
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
  if (columnMatch?.columnLabel !== inputText) {
    emit('update-table-entry-label', settingId, (path || definitionIndex), inputText);
  }
}

/**
 * Callback used when the table column headers are rearranged and drag-and-drop is complete
 * @param {Object} changeEvent - Event with drag-and-drop element data
 * @emits update-table-column-order
 */
function handleColumnOrderUpdate(changeEvent) {
  const { moved } = changeEvent;
  if (moved) {
    emit('update-table-column-order', moved.newIndex, moved.oldIndex);
  }
}

/**
 * Callback used when a drag-and-drop element is being moved by the user. The logic
 * checks to see if the column type is an `Aggregate` and returns false. The false
 * is used by `vue-draggable` to determine if the item can be moved.
 * Aggregates are not able to be moved, and will always be at the end of the column list.
 * @param {Object} moveEvent - Event fired from `vue-draggable` / `SortableJS` - https://github.com/SortableJS/Sortable#move-event-object
 * @returns {Boolean} false/true if the column is an aggregate or not
 */
function handleMove(moveEvent) {
  return !(moveEvent.relatedContext.element.context === 'AGGREGATE');
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
  emit('disable-template-save', !!emptyList.length);
});
</script>

<style lang="scss" scoped>
  .container {
    max-width: none; /* Remove the max-width requirement to allow table to go full width */
  }

  .ghost-item {
    opacity: 0.5;
    background-color: $light-blue;
  }

  .drag-item {
    background: rgba($white, 0.75);
    border-radius: 4px;
    box-shadow: 1px 1px 5px 0px rgba(0,0,0,0.25);
  }

  :deep(.th-input) {
    background: transparent;
  }

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
