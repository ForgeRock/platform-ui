<!-- Copyright 2023-2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->

<template>
  <BContainer class="overflow-hidden mt-5">
    <BCard
      v-if="!selectedDataSourceColumns.length"
      class="text-center py-2">
      <BCardTitle
        class="h4 mb-2"
        title-tag="h3">
        {{ $t('reports.template.noColumnsAdded') }}
      </BCardTitle>
      <BCardText>
        {{ $t('reports.template.selectColumnsFromDataSets') }}
      </BCardText>
    </BCard>
    <BCard
      v-else
      no-body>
      <BTableSimple responsive>
        <BThead>
          <BTr>
            <BTh
              v-for="(column, index) in selectedDataSourceColumns"
              :key="index"
              class="p-0">
              <FrField
                :name="column.label"
                :value="column.label"
                @input="updateLabel($event, column.value)"
                input-class="border-0 font-weight-bold rounded-0 px-4 py-3 data-source-label-input"
                type="string" />
            </BTh>
          </BTr>
        </BThead>
        <BTbody>
          <BTr>
            <BTd
              v-for="(column, index) in selectedDataSourceColumns"
              :key="index"
              class="p-4">
              &#123;{{ column.vanityValue }}&#125;
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
 * along with the ability for the user to edit the table heading labels.
 */
import { computed } from 'vue';
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

const emit = defineEmits(['update-data-source-column-label']);
const props = defineProps({
  dataSources: {
    type: Array,
    default: () => [],
  },
});

const selectedDataSourceColumns = computed(() => {
  const [entity] = props.dataSources;

  if (entity && entity.selectedColumns?.length) {
    return entity.selectedColumns.map((value) => {
      const dataSourceColumnMatch = entity.dataSourceColumns.find((column) => column.value === value);
      const valueArr = dataSourceColumnMatch.value.split('.');
      // Removes the first word within string by period
      // delimeter since it matches entity name.
      valueArr.shift();
      return {
        ...dataSourceColumnMatch,
        vanityValue: valueArr.join('.'),
      };
    });
  }
  return [];
});

// Functions

/**
 * Updates the label for a table heading input.
 * @param {String} label The updated data source label
 * @param {String} value The data source value
 */
function updateLabel(label, value) {
  const columnMatch = selectedDataSourceColumns.value.find((obj) => obj.value === value);
  if (columnMatch.label !== label) {
    emit('update-data-source-column-label', label, value);
  }
}
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
